/**
 * The Java AI Workshop - Main Application
 * Three.js WebGL Scene, OrbitControls, Raycasting, and HUD binding.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { LabEnvironment } from './components/lab-environment.js';
import { HoloDeck } from './components/holo-deck.js';
import { LoomReactor } from './components/loom-reactor.js';
import { CURRICULUM_PILLARS, DAILY_ROADMAP } from './data/curriculum.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.canvas = document.getElementById('webgl-canvas');

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Camera target interpolation
    this.targetCameraPos = new THREE.Vector3(0, 10, 16);
    this.targetLookAt = new THREE.Vector3(0, 2.2, 0);
    this.isTransitioning = false;

    this.initThree();
    this.initComponents();
    this.initEventListeners();
    this.initRoadmapUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070b12, 0.02);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.copy(this.targetCameraPos);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't go below floor
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 40;
    this.controls.target.copy(this.targetLookAt);

    // If user starts dragging/interacting, stop programmatic camera transition
    this.controls.addEventListener('start', () => {
      this.isTransitioning = false;
    });
  }

  initComponents() {
    // 1. Studio Lab Environment & Workbench
    this.lab = new LabEnvironment(this.scene);

    // 2. 8 Curriculum Pillars Holographic Terminals
    this.holoDeck = new HoloDeck(this.scene, (pillar) => {
      this.openPillarModal(pillar);
    });

    // 3. Centerpiece: Loom Thread Reactor
    this.reactor = new LoomReactor(this.scene, (telemetry) => {
      this.updateTelemetryHUD(telemetry);
    });
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Raycasting for interactive 3D objects
    window.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      this.holoDeck.handlePointerMove(this.raycaster);
    });

    window.addEventListener('click', (e) => {
      // Don't trigger 3D click if clicking on HUD elements
      if (e.target.closest('.hud-header, .reactor-deck, .camera-dock, .modal-window')) return;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      this.holoDeck.handleClick(this.raycaster);
    });

    // Mode Switch Controls (Platform vs Virtual Threads)
    const btnVirtual = document.getElementById('btn-mode-virtual');
    const btnPlatform = document.getElementById('btn-mode-platform');

    btnVirtual.addEventListener('click', () => {
      this.reactor.setMode('virtual');
      btnVirtual.classList.add('active');
      btnPlatform.classList.remove('active', 'platform');
    });

    btnPlatform.addEventListener('click', () => {
      this.reactor.setMode('platform');
      btnPlatform.classList.add('active', 'platform');
      btnVirtual.classList.remove('active');
    });

    // Concurrency Slider
    const slider = document.getElementById('thread-slider');
    const sliderVal = document.getElementById('thread-slider-val');

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      sliderVal.textContent = Number(val).toLocaleString();
      this.reactor.setThreadCount(val);
    });

    // I/O Stall Button
    const btnStall = document.getElementById('btn-io-stall');
    btnStall.addEventListener('click', () => {
      this.reactor.triggerIoStall();
    });

    // Camera Preset Buttons
    document.querySelectorAll('[data-camera]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick(1.0);
        const preset = btn.getAttribute('data-camera');
        this.setCameraPreset(preset);
      });
    });

    // Roadmap Drawer & Code Modal
    const btnRoadmap = document.getElementById('btn-roadmap');
    const btnCode = document.getElementById('btn-inspect-code');
    const modalRoadmap = document.getElementById('modal-roadmap');
    const modalCode = document.getElementById('modal-code');
    const modalPillar = document.getElementById('modal-pillar');

    btnRoadmap.addEventListener('click', () => {
      sound.playClick(1.1);
      modalRoadmap.classList.add('open');
    });

    btnCode.addEventListener('click', () => {
      sound.playClick(1.1);
      modalCode.classList.add('open');
    });

    // Audio Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    btnAudio.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      btnAudio.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
      if (!isMuted) sound.playClick(1.5);
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close, .modal-overlay').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('modal-close')) {
          sound.playClick(0.8);
          document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
        }
      });
    });

    // Copy Code Button
    const btnCopy = document.getElementById('btn-copy-code');
    btnCopy.addEventListener('click', () => {
      const codeText = document.getElementById('code-display').innerText;
      navigator.clipboard.writeText(codeText);
      sound.playClick(1.4);
      btnCopy.textContent = 'COPIED!';
      setTimeout(() => (btnCopy.textContent = 'COPY CODE'), 1800);
    });
  }

  setCameraPreset(preset) {
    this.isTransitioning = true;
    if (preset === 'overview') {
      this.targetCameraPos.set(0, 10, 16);
      this.targetLookAt.set(0, 2.2, 0);
    } else if (preset === 'reactor') {
      this.targetCameraPos.set(0, 3.6, 6.2);
      this.targetLookAt.set(0, 2.2, 0);
    } else if (preset === 'pillars') {
      this.targetCameraPos.set(9.2, 5.0, 9.2);
      this.targetLookAt.set(0, 1.5, 0);
    }
  }

  updateTelemetryHUD(data) {
    document.getElementById('metric-ram').textContent = `${data.ramUsageMb.toLocaleString()} MB`;
    document.getElementById('metric-threads').textContent = `${data.osThreads.toLocaleString()} Cores`;
    document.getElementById('metric-latency').textContent = data.contextSwitchNs;
    document.getElementById('metric-throughput').textContent = data.throughputOps;

    const statusEl = document.getElementById('reactor-status');
    statusEl.textContent = data.statusText;
    statusEl.style.color = data.statusColor;

    const bannerEl = document.getElementById('status-banner');
    if (data.overheated) {
      bannerEl.textContent = 'WARNING: OS THREAD EXHAUSTION DETECTED';
      bannerEl.style.borderColor = '#ff2244';
      bannerEl.style.color = '#ff2244';
    } else {
      bannerEl.textContent = 'REACTOR STABLE // 60 FPS WEBGL';
      bannerEl.style.borderColor = 'var(--border-cyan)';
      bannerEl.style.color = 'var(--color-cyan)';
    }
  }

  initRoadmapUI() {
    const listContainer = document.getElementById('roadmap-cards');
    listContainer.innerHTML = '';

    DAILY_ROADMAP.forEach((item) => {
      const card = document.createElement('div');
      card.className = `roadmap-card ${item.day === 1 ? 'active-day' : ''}`;
      card.innerHTML = `
        <div class="card-left">
          <span class="card-badge">${item.badge} • ${item.category}</span>
          <span class="card-title">${item.title}</span>
          <span class="card-desc">${item.summary}</span>
        </div>
        <div class="card-right">
          <button class="tactile-btn ${item.status === 'ACTIVE' ? 'active' : ''}">
            ${item.status === 'ACTIVE' ? 'LAUNCHED' : 'UPCOMING'}
          </button>
        </div>
      `;
      card.addEventListener('click', () => {
        sound.playClick(1.0);
        this.openRoadmapDayModal(item);
      });
      listContainer.appendChild(card);
    });
  }

  openPillarModal(pillar) {
    const modal = document.getElementById('modal-pillar');
    document.getElementById('pillar-modal-title').textContent = `${pillar.icon} ${pillar.title}`;
    document.getElementById('pillar-modal-subtitle').textContent = pillar.subtitle;
    document.getElementById('pillar-modal-summary').textContent = pillar.summary;

    const list = document.getElementById('pillar-modal-topics');
    list.innerHTML = '';
    pillar.subtopics.forEach((sub) => {
      const li = document.createElement('li');
      li.style.padding = '0.35rem 0';
      li.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
      li.textContent = `⚡ ${sub}`;
      list.appendChild(li);
    });

    modal.classList.add('open');
  }

  openRoadmapDayModal(dayItem) {
    document.getElementById('modal-roadmap').classList.remove('open');
    const modalCode = document.getElementById('modal-code');
    document.getElementById('code-modal-title').textContent = `DAY ${dayItem.day}: ${dayItem.title}`;
    document.getElementById('code-display').textContent = dayItem.javaSnippet;
    modalCode.classList.add('open');
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smoothly ease camera to target preset when transitioning
    if (this.isTransitioning) {
      this.camera.position.lerp(this.targetCameraPos, 0.08);
      this.controls.target.lerp(this.targetLookAt, 0.08);
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.camera.position.copy(this.targetCameraPos);
        this.controls.target.copy(this.targetLookAt);
        this.isTransitioning = false;
      }
    }
    this.controls.update();

    // Update 3D components
    if (this.lab) this.lab.update(delta);
    if (this.holoDeck) this.holoDeck.update(time, delta);
    if (this.reactor) this.reactor.update(time, delta);

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});

