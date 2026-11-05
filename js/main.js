/**
 * The Java AI Workshop - Main Application Orchestrator
 * Integrates Left Topic Navigation, Dynamic 3D Scene Swapping,
 * and Right-Hand Knowledge & Interactive Controls Drawer.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { LabEnvironment } from './components/lab-environment.js';
import { LoomReactor } from './components/loom-reactor.js';
import { JvmMemoryModel } from './components/jvm-memory-model.js';
import { ConcurrencyLocksModel } from './components/concurrency-locks-model.js';
import { TOPICS } from './data/topics.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    // Active subtopic pointer
    this.activeTopicId = 'core-java';
    this.activeSubtopicId = 'virtual-threads';

    // Camera preset easing
    this.targetCameraPos = new THREE.Vector3(0, 10, 16);
    this.targetLookAt = new THREE.Vector3(0, 2.2, 0);
    this.isTransitioning = false;

    this.initThree();
    this.init3DModels();
    this.initNavigationUI();
    this.initEventListeners();

    // Select initial subtopic
    this.selectSubtopic('core-java', 'virtual-threads');

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
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 40;
    this.controls.target.copy(this.targetLookAt);

    this.controls.addEventListener('start', () => {
      this.isTransitioning = false;
    });
  }

  init3DModels() {
    // 1. Studio Lab Environment & Workbench
    this.lab = new LabEnvironment(this.scene);

    // 2. Model A: Project Loom Reactor
    this.loomReactor = new LoomReactor(this.scene, (data) => {
      if (this.activeSubtopicId === 'virtual-threads') {
        this.renderLoomTelemetry(data);
      }
    });

    // 3. Model B: JVM Transparent Memory Model & GC Physics
    this.jvmMemoryModel = new JvmMemoryModel(this.scene, (data) => {
      if (this.activeSubtopicId === 'jvm-memory') {
        this.renderJvmTelemetry(data);
      }
    });
    this.jvmMemoryModel.setVisible(false);

    // 4. Model C: Concurrency Locks Chamber
    this.locksModel = new ConcurrencyLocksModel(this.scene, (data) => {
      if (this.activeSubtopicId === 'concurrency-locks') {
        this.renderLocksTelemetry(data);
      }
    });
    this.locksModel.setVisible(false);
  }

  initNavigationUI() {
    const listContainer = document.getElementById('topic-list');
    listContainer.innerHTML = '';

    TOPICS.forEach((topic) => {
      const isCoreJava = topic.id === 'core-java';
      const group = document.createElement('div');
      group.className = 'topic-group';

      // Header
      const header = document.createElement('div');
      header.className = 'topic-group-header';
      header.innerHTML = `
        <div class="topic-group-title">
          <span>${topic.icon}</span>
          <span>${topic.name}</span>
        </div>
        <span class="topic-group-badge">${topic.badge}</span>
      `;

      // Subtopics list
      const subList = document.createElement('div');
      subList.className = 'subtopic-list';

      topic.subtopics.forEach((sub) => {
        const item = document.createElement('div');
        item.className = `subtopic-item ${sub.id === this.activeSubtopicId ? 'active' : ''}`;
        item.dataset.topicId = topic.id;
        item.dataset.subtopicId = sub.id;
        item.innerHTML = `<span>⚡</span> <span>${sub.title}</span>`;

        item.addEventListener('click', () => {
          sound.playClick(1.2);
          this.selectSubtopic(topic.id, sub.id);
        });

        subList.appendChild(item);
      });

      group.appendChild(header);
      group.appendChild(subList);
      listContainer.appendChild(group);
    });
  }

  selectSubtopic(topicId, subtopicId) {
    this.activeTopicId = topicId;
    this.activeSubtopicId = subtopicId;

    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    const subtopic = topic.subtopics.find((s) => s.id === subtopicId);
    if (!subtopic) return;

    // 1. Update Navigation UI active class
    document.querySelectorAll('.subtopic-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.subtopicId === subtopicId);
    });

    // 2. Update Header Status Badge
    document.getElementById('active-topic-badge').textContent = `${topic.name.toUpperCase()}: ${subtopic.title.toUpperCase()}`;

    // 3. Swap 3D Model on Stage
    this.switch3DModel(subtopic.sceneType);

    // 4. Update Right-Hand Knowledge & 3D Interactive Controls Drawer
    this.populateRightDrawer(subtopic);

    // 5. Open Drawer
    document.getElementById('right-drawer').classList.remove('closed');
  }

  switch3DModel(sceneType) {
    // Hide all
    if (this.loomReactor) this.loomReactor.group.visible = false;
    if (this.jvmMemoryModel) this.jvmMemoryModel.setVisible(false);
    if (this.locksModel) this.locksModel.setVisible(false);

    // Show selected
    if (sceneType === 'loom' || sceneType === 'virtual-threads') {
      if (this.loomReactor) {
        this.loomReactor.group.visible = true;
        this.loomReactor.updateTelemetry();
      }
    } else if (sceneType === 'jvm-memory') {
      if (this.jvmMemoryModel) {
        this.jvmMemoryModel.setVisible(true);
        this.jvmMemoryModel.updateTelemetry();
      }
    } else if (sceneType === 'locks') {
      if (this.locksModel) {
        this.locksModel.setVisible(true);
        this.locksModel.updateTelemetry();
      }
    }
  }

  populateRightDrawer(subtopic) {
    document.getElementById('drawer-tag').textContent = subtopic.tag || 'CORE JAVA';
    document.getElementById('drawer-simple-title').textContent = subtopic.simpleTitle || subtopic.title;
    document.getElementById('drawer-official-title').textContent = subtopic.title;
    document.getElementById('drawer-mental-model').textContent = subtopic.mentalModel || subtopic.summary;

    // How it works
    const howList = document.getElementById('drawer-how-it-works');
    howList.innerHTML = '';
    (subtopic.howItWorks || [subtopic.summary]).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      howList.appendChild(li);
    });

    // Senior Takeaways
    const takeList = document.getElementById('drawer-takeaways');
    takeList.innerHTML = '';
    (subtopic.seniorTakeaways || ['Master the fundamental mechanics before scaling.']).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      takeList.appendChild(li);
    });

    // Code snippet
    document.getElementById('drawer-code').textContent = subtopic.javaCode || '// Code implementation';

    // Populate Dynamic 3D Controls
    this.populate3DControls(subtopic);
  }

  populate3DControls(subtopic) {
    const container = document.getElementById('dynamic-3d-controls');
    container.innerHTML = '';

    if (subtopic.sceneType === 'loom') {
      container.innerHTML = `
        <div class="control-row">
          <div class="control-row-header">
            <span>THREAD SCHEDULING MODE:</span>
          </div>
          <div class="control-btn-group">
            <button class="tactile-btn active" id="btn-loom-virtual">Virtual Threads (M:N)</button>
            <button class="tactile-btn" id="btn-loom-platform">Platform Threads (1:1 OS)</button>
          </div>
        </div>

        <div class="control-row">
          <div class="control-row-header">
            <span>CONCURRENT TASKS IN FLIGHT:</span>
            <span class="control-val" id="loom-slider-val">50,000</span>
          </div>
          <input type="range" id="loom-slider" class="cyber-slider" min="100" max="250000" step="500" value="50000">
        </div>

        <div class="control-row">
          <button class="tactile-btn danger" id="btn-loom-stall">
            <span>⚠️ Simulate 200ms Blocking I/O Stall</span>
          </button>
        </div>
      `;

      const btnVirt = document.getElementById('btn-loom-virtual');
      const btnPlat = document.getElementById('btn-loom-platform');
      const slider = document.getElementById('loom-slider');
      const sliderVal = document.getElementById('loom-slider-val');
      const btnStall = document.getElementById('btn-loom-stall');

      btnVirt.addEventListener('click', () => {
        this.loomReactor.setMode('virtual');
        btnVirt.classList.add('active');
        btnPlat.classList.remove('active');
      });

      btnPlat.addEventListener('click', () => {
        this.loomReactor.setMode('platform');
        btnPlat.classList.add('active');
        btnVirt.classList.remove('active');
      });

      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        sliderVal.textContent = Number(val).toLocaleString();
        this.loomReactor.setThreadCount(val);
      });

      btnStall.addEventListener('click', () => {
        this.loomReactor.triggerIoStall();
      });

    } else if (subtopic.sceneType === 'jvm-memory') {
      container.innerHTML = `
        <div class="control-row">
          <div class="control-row-header">
            <span>JVM HEAP ALLOCATION & GC SWEEPER:</span>
          </div>
          <div class="control-btn-group">
            <button class="tactile-btn active" id="btn-jvm-alloc">➕ Allocate Objects</button>
            <button class="tactile-btn" id="btn-jvm-minor-gc">⚡ Minor GC (Eden)</button>
            <button class="tactile-btn danger" id="btn-jvm-major-gc">🧹 Major GC (ZGC)</button>
          </div>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
          Observe objects born in Eden nursery (lime green), surviving into S0/S1 (amber), and promoted to Tenured Old Gen (purple).
        </p>
      `;

      document.getElementById('btn-jvm-alloc').addEventListener('click', () => {
        this.jvmMemoryModel.allocateObjects();
      });
      document.getElementById('btn-jvm-minor-gc').addEventListener('click', () => {
        this.jvmMemoryModel.triggerMinorGc();
      });
      document.getElementById('btn-jvm-major-gc').addEventListener('click', () => {
        this.jvmMemoryModel.triggerMajorGc();
      });

    } else if (subtopic.sceneType === 'locks') {
      container.innerHTML = `
        <div class="control-row">
          <div class="control-row-header">
            <span>LOCK MECHANISM TYPE:</span>
          </div>
          <div class="control-btn-group">
            <button class="tactile-btn active" id="btn-lock-reentrant">ReentrantLock (AQS)</button>
            <button class="tactile-btn" id="btn-lock-synchronized">synchronized (Monitor)</button>
          </div>
        </div>

        <div class="control-row">
          <div class="control-btn-group">
            <button class="tactile-btn" id="btn-lock-toggle">🔒 Toggle Lock Acquisition</button>
            <button class="tactile-btn danger" id="btn-lock-pin-test">⚠️ Simulate I/O (Pinning Test)</button>
          </div>
        </div>
      `;

      const btnReen = document.getElementById('btn-lock-reentrant');
      const btnSync = document.getElementById('btn-lock-synchronized');

      btnReen.addEventListener('click', () => {
        this.locksModel.setLockType('reentrant');
        btnReen.classList.add('active');
        btnSync.classList.remove('active');
      });

      btnSync.addEventListener('click', () => {
        this.locksModel.setLockType('synchronized');
        btnSync.classList.add('active');
        btnReen.classList.remove('active');
      });

      document.getElementById('btn-lock-toggle').addEventListener('click', () => {
        this.locksModel.toggleLock();
      });

      document.getElementById('btn-lock-pin-test').addEventListener('click', () => {
        this.locksModel.simulateIoInsideLock();
      });
    }
  }

  renderLoomTelemetry(data) {
    const grid = document.getElementById('bottom-telemetry-grid');
    grid.innerHTML = `
      <div class="telemetry-cell">
        <span class="cell-label">Stack Memory Footprint</span>
        <span class="cell-value">${data.ramUsageMb.toLocaleString()} MB</span>
        <span class="cell-status" style="color: var(--color-cyan);">~2 KB Heap / Thread</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">OS Kernel Threads</span>
        <span class="cell-value">${data.osThreads.toLocaleString()} Cores</span>
        <span class="cell-status" style="color: var(--color-cyan);">ForkJoin Carrier Pool</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Context Switch Latency</span>
        <span class="cell-value">${data.contextSwitchNs}</span>
        <span class="cell-status" style="color: var(--color-gold);">Zero Kernel Traps</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Throughput / Reactor State</span>
        <span class="cell-value">${data.throughputOps}</span>
        <span class="cell-status" style="color: ${data.statusColor};">${data.statusText}</span>
      </div>
    `;
  }

  renderJvmTelemetry(data) {
    const grid = document.getElementById('bottom-telemetry-grid');
    grid.innerHTML = `
      <div class="telemetry-cell">
        <span class="cell-label">Eden Nursery Space</span>
        <span class="cell-value" style="color: #00ff88;">${data.edenUsed}</span>
        <span class="cell-status">Bump-the-pointer Allocation</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Survivor S0 / S1</span>
        <span class="cell-value" style="color: #ffaa00;">${data.survivorUsed}</span>
        <span class="cell-status">Aging Threshold Active</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Tenured Old Generation</span>
        <span class="cell-value" style="color: #aa66ff;">${data.tenuredUsed}</span>
        <span class="cell-status">Long-Lived Singletons & Caches</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">GC Pause Overhead</span>
        <span class="cell-value" style="color: var(--color-cyan);">${data.gcPauses}</span>
        <span class="cell-status">Concurrent Colored Pointers</span>
      </div>
    `;
  }

  renderLocksTelemetry(data) {
    const grid = document.getElementById('bottom-telemetry-grid');
    grid.innerHTML = `
      <div class="telemetry-cell">
        <span class="cell-label">Lock Acquisition State</span>
        <span class="cell-value">${data.state}</span>
        <span class="cell-status">Mutual Exclusion Gate</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Lock Implementation</span>
        <span class="cell-value" style="color: var(--color-cyan);">${data.type}</span>
        <span class="cell-status">Fair FIFO Queue</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Carrier Pinning Safety</span>
        <span class="cell-value" style="color: ${data.pinningStatus.includes('DANGER') ? '#ff2244' : '#00ff88'};">${data.pinningStatus}</span>
        <span class="cell-status">Virtual Thread Loom Integrity</span>
      </div>
      <div class="telemetry-cell">
        <span class="cell-label">Wait Queue Length</span>
        <span class="cell-value">${data.queueLength}</span>
        <span class="cell-status">AQS Node Parking</span>
      </div>
    `;
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Drawer Toggle Buttons
    const drawer = document.getElementById('right-drawer');
    document.getElementById('btn-toggle-right-panel').addEventListener('click', () => {
      sound.playClick(1.0);
      drawer.classList.toggle('closed');
    });

    document.getElementById('btn-close-drawer').addEventListener('click', () => {
      sound.playClick(0.8);
      drawer.classList.add('closed');
    });

    // Audio Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    btnAudio.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      btnAudio.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
      if (!isMuted) sound.playClick(1.5);
    });

    // Camera Quick Presets
    document.querySelectorAll('[data-camera]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick(1.0);
        document.querySelectorAll('[data-camera]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-camera');
        this.setCameraPreset(preset);
      });
    });

    // Copy Code Button
    document.getElementById('btn-copy-code').addEventListener('click', () => {
      const codeText = document.getElementById('drawer-code').innerText;
      navigator.clipboard.writeText(codeText);
      sound.playClick(1.4);
      const btn = document.getElementById('btn-copy-code');
      btn.textContent = 'COPIED!';
      setTimeout(() => (btn.textContent = 'COPY CODE'), 1800);
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

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

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

    if (this.lab) this.lab.update(delta);
    if (this.loomReactor && this.loomReactor.group.visible) this.loomReactor.update(time, delta);
    if (this.jvmMemoryModel && this.jvmMemoryModel.group.visible) this.jvmMemoryModel.update(time, delta);
    if (this.locksModel && this.locksModel.group.visible) this.locksModel.update(time, delta);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
