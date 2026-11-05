/**
 * 3D Concurrency Locks Model
 * Visualizes ReentrantLock (AQS FIFO Queue) vs Synchronized (Monitor Lock)
 * and Virtual Thread Carrier Pinning mechanics in real 3D space.
 */

import * as THREE from 'three';
import { sound } from '../audio.js';

export class ConcurrencyLocksModel {
  constructor(scene, onTelemetryUpdate) {
    this.scene = scene;
    this.onTelemetryUpdate = onTelemetryUpdate;
    this.group = new THREE.Group();
    this.group.position.set(0, 1.2, 0);

    this.isLocked = false;
    this.lockType = 'reentrant'; // 'reentrant' or 'synchronized'
    this.isPinned = false;

    this.initChamber();
    this.initQueueTracks();
    this.scene.add(this.group);
    this.updateTelemetry();
  }

  initChamber() {
    // 1. Central Vault Gate Base
    const baseGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.4, 24);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      metalness: 0.85,
      roughness: 0.25
    });
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.2;
    this.group.add(base);

    // 2. Lock Ring Core (Turns green when UNLOCKED, red when LOCKED)
    const ringGeo = new THREE.TorusGeometry(1.6, 0.15, 16, 48);
    this.ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88, // Unlocked = green
      emissive: 0x00aa55,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2
    });
    this.lockRing = new THREE.Mesh(ringGeo, this.ringMat);
    this.lockRing.rotation.x = Math.PI / 2;
    this.lockRing.position.y = 1.6;
    this.group.add(this.lockRing);

    // 3. Central Critical Section Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.4, 24);
    this.pillarMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x0088cc,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3
    });
    this.criticalPillar = new THREE.Mesh(pillarGeo, this.pillarMat);
    this.criticalPillar.position.y = 1.4;
    this.group.add(this.criticalPillar);

    // 4. Lock Status 3D Label
    this.statusCanvas = document.createElement('canvas');
    this.statusCanvas.width = 512;
    this.statusCanvas.height = 128;
    this.statusTex = new THREE.CanvasTexture(this.statusCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.statusTex, transparent: true });
    this.statusSprite = new THREE.Sprite(spriteMat);
    this.statusSprite.position.set(0, 3.2, 0);
    this.statusSprite.scale.set(2.0, 0.5, 1);
    this.group.add(this.statusSprite);

    this.drawStatusLabel('LOCK: UNLOCKED', '#00ff88');
  }

  drawStatusLabel(text, colorHex) {
    const ctx = this.statusCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = 'rgba(7, 13, 24, 0.9)';
    if (typeof ctx.roundRect === 'function') ctx.roundRect(10, 10, 492, 108, 16);
    else ctx.rect(10, 10, 492, 108);
    ctx.fill();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = colorHex;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 72);
    this.statusTex.needsUpdate = true;
  }

  initQueueTracks() {
    // 5. AQS FIFO Wait Queue Track
    const trackGeo = new THREE.BoxGeometry(0.8, 0.1, 4.0);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x222e44,
      metalness: 0.8,
      roughness: 0.4
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.4, 3.2);
    this.group.add(track);

    // Waiting Threads lining up
    this.queueThreads = [];
    for (let i = 0; i < 4; i++) {
      const threadGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const threadMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x0088cc,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });
      const tMesh = new THREE.Mesh(threadGeo, threadMat);
      tMesh.position.set(0, 0.75, 2.0 + i * 0.75);
      this.group.add(tMesh);
      this.queueThreads.push(tMesh);
    }
  }

  toggleLock() {
    this.isLocked = !this.isLocked;
    sound.playClick(this.isLocked ? 0.7 : 1.4);

    if (this.isLocked) {
      this.ringMat.color.setHex(0xff3344);
      this.ringMat.emissive.setHex(0xaa1122);
      this.drawStatusLabel('LOCK: ACQUIRED', '#ff3344');
    } else {
      this.isPinned = false;
      this.ringMat.color.setHex(0x00ff88);
      this.ringMat.emissive.setHex(0x00aa55);
      this.drawStatusLabel('LOCK: UNLOCKED', '#00ff88');
    }
    this.updateTelemetry();
  }

  setLockType(type) {
    this.lockType = type;
    sound.playModeSwitch(type === 'reentrant');
    this.updateTelemetry();
  }

  simulateIoInsideLock() {
    if (!this.isLocked) this.toggleLock();
    sound.playClick(0.5);

    if (this.lockType === 'synchronized') {
      // Pinning disaster!
      this.isPinned = true;
      this.drawStatusLabel('CRITICAL: CARRIER PINNED!', '#ff0033');
      this.ringMat.color.setHex(0xff0033);
      this.ringMat.emissive.setHex(0xff0000);
    } else {
      // ReentrantLock safe unmount
      this.isPinned = false;
      this.drawStatusLabel('SAFE: VIRTUAL THREAD PARKED', '#00f3ff');
      this.ringMat.color.setHex(0x00f3ff);
      this.ringMat.emissive.setHex(0x0099cc);
    }
    this.updateTelemetry();
  }

  updateTelemetry() {
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        state: this.isLocked ? 'HELD BY THREAD #42' : 'AVAILABLE (NO CONTENTION)',
        type: this.lockType === 'reentrant' ? 'ReentrantLock (AQS Queue)' : 'synchronized (JVM Monitor)',
        pinningStatus: this.isPinned ? 'DANGER: Carrier Thread Pinned!' : 'SAFE: Non-pinning (Carrier unmounted)',
        queueLength: this.isLocked ? '3 Threads Waiting (FIFO)' : '0 Threads Waiting'
      });
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(time, delta) {
    if (!this.group.visible) return;

    // Rotate lock ring slowly
    this.lockRing.rotation.z += delta * (this.isLocked ? 0.3 : 1.2);

    // Bob waiting queue threads
    this.queueThreads.forEach((t, i) => {
      t.position.y = 0.75 + Math.sin(time * 3 + i) * 0.05;
    });

    if (this.isPinned) {
      this.criticalPillar.position.x = (Math.random() - 0.5) * 0.04;
    } else {
      this.criticalPillar.position.x = 0;
    }
  }
}
