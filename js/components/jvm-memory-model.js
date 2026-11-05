/**
 * 3D Transparent JVM Memory Model & GC Physics
 * Visualizes Runtime Data Areas: Eden, Survivor S0/S1, Tenured, Metaspace, and Thread Stacks.
 */

import * as THREE from 'three';
import { sound } from '../audio.js';

export class JvmMemoryModel {
  constructor(scene, onTelemetryUpdate) {
    this.scene = scene;
    this.onTelemetryUpdate = onTelemetryUpdate;
    this.group = new THREE.Group();
    this.group.position.set(0, 1.2, 0);

    this.edenObjects = [];
    this.survivorObjects = [];
    this.tenuredObjects = [];
    this.gcSweepActive = false;
    this.gcSweepY = 0;

    this.initChambers();
    this.initParticlePool();
    this.scene.add(this.group);
    this.updateTelemetry();
  }

  initChambers() {
    // 1. Transparent JVM Container Glass Frame
    const outerBoxGeo = new THREE.BoxGeometry(6.4, 4.4, 5.0);
    const outerEdges = new THREE.EdgesGeometry(outerBoxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.4 });
    this.outerFrame = new THREE.LineSegments(outerEdges, lineMat);
    this.outerFrame.position.y = 2.2;
    this.group.add(this.outerFrame);

    // 2. Eden Space (Young Generation - Lime Green Chamber)
    const edenGeo = new THREE.BoxGeometry(2.8, 1.6, 2.2);
    const edenMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false
    });
    this.edenMesh = new THREE.Mesh(edenGeo, edenMat);
    this.edenMesh.position.set(-1.5, 1.0, 1.2);
    this.group.add(this.edenMesh);
    this.addLabel(this.edenMesh, 'EDEN (Young Gen)', '#00ff88');

    // 3. Survivor Spaces S0 & S1 (Amber Chambers)
    const survGeo = new THREE.BoxGeometry(1.3, 1.6, 2.2);
    const survMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.2
    });
    this.s0Mesh = new THREE.Mesh(survGeo, survMat);
    this.s0Mesh.position.set(0.8, 1.0, 1.2);
    this.group.add(this.s0Mesh);
    this.addLabel(this.s0Mesh, 'SURVIVOR S0/S1', '#ffaa00');

    // 4. Tenured / Old Generation (Deep Indigo / Violet Chamber)
    const oldGeo = new THREE.BoxGeometry(4.4, 1.8, 2.2);
    const oldMat = new THREE.MeshStandardMaterial({
      color: 0x8844ff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.2
    });
    this.tenuredMesh = new THREE.Mesh(oldGeo, oldMat);
    this.tenuredMesh.position.set(-0.2, 2.9, 1.2);
    this.group.add(this.tenuredMesh);
    this.addLabel(this.tenuredMesh, 'TENURED (Old Gen)', '#aa66ff');

    // 5. Metaspace Chamber (Off-heap native metadata - Cyan)
    const metaGeo = new THREE.BoxGeometry(5.8, 0.8, 1.8);
    const metaMat = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.4
    });
    this.metaMesh = new THREE.Mesh(metaGeo, metaMat);
    this.metaMesh.position.set(0, 3.8, -1.2);
    this.group.add(this.metaMesh);
    this.addLabel(this.metaMesh, 'METASPACE (Native Memory)', '#00d2ff');

    // 6. Thread Stacks Tower (Vertical stack frames - Coral Red)
    const stackGeo = new THREE.BoxGeometry(1.6, 2.6, 1.8);
    const stackMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.25,
      roughness: 0.4
    });
    this.stackMesh = new THREE.Mesh(stackGeo, stackMat);
    this.stackMesh.position.set(2.2, 1.5, -1.2);
    this.group.add(this.stackMesh);
    this.addLabel(this.stackMesh, 'THREAD STACKS', '#ff3366');

    // 7. GC Laser Scanner Plane
    const scannerGeo = new THREE.PlaneGeometry(6.2, 4.8);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.scannerMesh = new THREE.Mesh(scannerGeo, scannerMat);
    this.scannerMesh.rotation.x = Math.PI / 2;
    this.scannerMesh.position.y = 1.0;
    this.group.add(this.scannerMesh);
  }

  addLabel(parent, text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(7, 13, 24, 0.85)';
    if (typeof ctx.roundRect === 'function') ctx.roundRect(4, 4, 248, 56, 10);
    else ctx.rect(4, 4, 248, 56);
    ctx.fill();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colorHex;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 38);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 0.95;
    sprite.scale.set(1.2, 0.3, 1);
    parent.add(sprite);
  }

  initParticlePool() {
    // Floating objects in Eden, Survivor, and Old Gen
    this.particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Spawn mainly in Eden nursery
      this.positions[i3] = -2.5 + Math.random() * 2.0;
      this.positions[i3 + 1] = 0.4 + Math.random() * 1.2;
      this.positions[i3 + 2] = 0.4 + Math.random() * 1.6;

      // Lime green for Eden objects
      this.colors[i3] = 0.0;
      this.colors[i3 + 1] = 1.0;
      this.colors[i3 + 2] = 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  allocateObjects() {
    sound.playBurst(1.2);
    // Add burst of objects to Eden
    const pos = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < 50; i++) {
      const idx = Math.floor(Math.random() * this.particleCount) * 3;
      pos[idx] = -2.6 + Math.random() * 2.2;
      pos[idx + 1] = 0.3 + Math.random() * 1.3;
      pos[idx + 2] = 0.3 + Math.random() * 1.8;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.updateTelemetry();
  }

  triggerMinorGc() {
    sound.playModeSwitch(true);
    this.gcSweepActive = true;
    this.gcSweepY = 0.2;
    this.scannerMesh.material.opacity = 0.45;

    // Promote ~15% to Survivor, recycle the rest
    const pos = this.particles.geometry.attributes.position.array;
    const col = this.particles.geometry.attributes.color.array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      if (Math.random() > 0.8) {
        // Promote to Survivor S0/S1 (Amber)
        pos[i3] = 0.3 + Math.random() * 1.0;
        pos[i3 + 1] = 0.4 + Math.random() * 1.2;
        pos[i3 + 2] = 0.4 + Math.random() * 1.6;
        col[i3] = 1.0; col[i3 + 1] = 0.7; col[i3 + 2] = 0.0;
      } else if (Math.random() > 0.92) {
        // Promote to Tenured (Purple)
        pos[i3] = -2.0 + Math.random() * 3.6;
        pos[i3 + 1] = 2.2 + Math.random() * 1.4;
        pos[i3 + 2] = 0.3 + Math.random() * 1.8;
        col[i3] = 0.7; col[i3 + 1] = 0.2; col[i3 + 2] = 1.0;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
    this.updateTelemetry();
  }

  triggerMajorGc() {
    sound.playClick(0.5);
    this.gcSweepActive = true;
    this.gcSweepY = 4.0;
    this.scannerMesh.material.opacity = 0.6;

    // ZGC / G1 Concurrent compaction: clear unreferenced tenured
    const pos = this.particles.geometry.attributes.position.array;
    const col = this.particles.geometry.attributes.color.array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Reset non-long-lived objects back to Eden base
      if (Math.random() > 0.5) {
        pos[i3] = -2.5 + Math.random() * 2.0;
        pos[i3 + 1] = 0.3 + Math.random() * 1.2;
        pos[i3 + 2] = 0.4 + Math.random() * 1.6;
        col[i3] = 0.0; col[i3 + 1] = 1.0; col[i3 + 2] = 0.5;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
    this.updateTelemetry();
  }

  updateTelemetry() {
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        edenUsed: '412 MB / 512 MB',
        survivorUsed: '64 MB / 128 MB',
        tenuredUsed: '1.2 GB / 4.0 GB',
        metaspaceUsed: '84 MB (Native)',
        gcPauses: '< 0.5 ms (ZGC Generational)'
      });
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(time, delta) {
    if (!this.group.visible) return;

    // Laser scanner sweep animation
    if (this.gcSweepActive) {
      this.gcSweepY += delta * 3.5;
      this.scannerMesh.position.y = this.gcSweepY;
      if (this.gcSweepY > 4.4) {
        this.gcSweepActive = false;
        this.scannerMesh.material.opacity = 0.0;
      }
    }

    // Gentle particle pulsation
    const pos = this.particles.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] += Math.sin(time * 3 + i) * 0.003;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
