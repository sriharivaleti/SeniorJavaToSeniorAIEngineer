/**
 * The Loom Thread Reactor - Day 1 Centerpiece
 * Interactive 3D physical visualization of Platform Threads (1:1 OS Thread)
 * vs Project Loom Virtual Threads (M:N Carrier Threads).
 */

import * as THREE from 'three';
import { sound } from '../audio.js';

export class LoomReactor {
  constructor(scene, onTelemetryUpdate) {
    this.scene = scene;
    this.onTelemetryUpdate = onTelemetryUpdate;

    this.mode = 'virtual'; // 'platform' or 'virtual'
    this.targetThreadCount = 50000;
    this.isIoStalled = false;
    this.overheatIntensity = 0.0;

    this.carrierCores = 8;
    this.pistonMeshes = [];
    this.carrierMeshes = [];
    this.fiberParticles = null;
    this.fiberPositions = null;
    this.fiberVelocities = null;
    this.fiberStates = null; // 0: running, 1: parked on I/O

    this.group = new THREE.Group();
    this.initChamber();
    this.initPlatformPistons();
    this.initCarrierCores();
    this.initVirtualFibers();
    this.scene.add(this.group);

    this.updateTelemetry();
  }

  initChamber() {
    this.chamberGroup = new THREE.Group();
    this.chamberGroup.position.set(0, 1.15, 0);

    // 1. Lower Industrial Ring Base
    const ringGeo = new THREE.CylinderGeometry(2.8, 3.0, 0.4, 32);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x192132,
      metalness: 0.85,
      roughness: 0.25,
    });
    const lowerRing = new THREE.Mesh(ringGeo, metalMat);
    lowerRing.position.y = 0.2;
    this.chamberGroup.add(lowerRing);

    // 2. Brass Support Struts (8 columns)
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xcc9933,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.2, 16);
      const strut = new THREE.Mesh(strutGeo, brassMat);
      strut.position.set(Math.cos(angle) * 2.6, 2.3, Math.sin(angle) * 2.6);
      this.chamberGroup.add(strut);
    }

    // 3. Top Cap & Emitter Dome
    const topCapGeo = new THREE.CylinderGeometry(3.0, 2.8, 0.35, 32);
    const topCap = new THREE.Mesh(topCapGeo, metalMat);
    topCap.position.y = 4.4;
    this.chamberGroup.add(topCap);

    // 4. Transparent Glass Containment Cylinder
    const glassGeo = new THREE.CylinderGeometry(2.5, 2.5, 4.0, 32, 1, true);
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(glassGeo, this.glassMat);
    glass.position.y = 2.3;
    this.chamberGroup.add(glass);

    // 5. Central Magnetic Core Conduit
    const coreGeo = new THREE.CylinderGeometry(0.4, 0.4, 4.0, 24);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00aacc,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.5,
    });
    this.corePillar = new THREE.Mesh(coreGeo, this.coreMat);
    this.corePillar.position.y = 2.3;
    this.chamberGroup.add(this.corePillar);

    this.group.add(this.chamberGroup);
  }

  initPlatformPistons() {
    this.platformGroup = new THREE.Group();
    this.platformGroup.position.set(0, 1.15, 0);

    // 16 Heavy Steel OS Thread Cylinders arranged in a ring
    const pistonCount = 16;
    const radius = 1.6;
    for (let i = 0; i < pistonCount; i++) {
      const angle = (i / pistonCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const pGroup = new THREE.Group();
      pGroup.position.set(x, 0.4, z);

      // Heavy piston housing
      const housingGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.8, 16);
      const housingMat = new THREE.MeshStandardMaterial({
        color: 0x222a3a,
        metalness: 0.85,
        roughness: 0.3,
      });
      const housing = new THREE.Mesh(housingGeo, housingMat);
      housing.position.y = 0.4;
      pGroup.add(housing);

      // Moving Piston Rod
      const rodGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16);
      const rodMat = new THREE.MeshStandardMaterial({
        color: 0xff3344,
        emissive: 0x660011,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.2,
      });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.y = 1.4;
      pGroup.add(rod);

      this.pistonMeshes.push({ group: pGroup, rod, rodMat, phase: i * 0.4 });
      this.platformGroup.add(pGroup);
    }

    this.platformGroup.visible = false; // Starts in virtual mode
    this.group.add(this.platformGroup);
  }

  initCarrierCores() {
    this.carrierGroup = new THREE.Group();
    this.carrierGroup.position.set(0, 1.4, 0);

    // 8 Golden Carrier Thread Cores (ForkJoinPool worker threads) at the base
    const radius = 1.5;
    for (let i = 0; i < this.carrierCores; i++) {
      const angle = (i / this.carrierCores) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const coreGroup = new THREE.Group();
      coreGroup.position.set(x, 0.25, z);

      const coreGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.45, 12);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff8800,
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.25,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      coreGroup.add(core);

      // Glowing pulse ring around each carrier
      const ringGeo = new THREE.RingGeometry(0.26, 0.32, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.23;
      coreGroup.add(ring);

      this.carrierMeshes.push({ group: coreGroup, coreMat, ring });
      this.carrierGroup.add(coreGroup);
    }

    this.group.add(this.carrierGroup);
  }

  initVirtualFibers() {
    // 2,500 visual cyber-fibers representing up to 1,000,000 virtual threads
    this.fiberCount = 2400;
    const geometry = new THREE.BufferGeometry();
    this.fiberPositions = new Float32Array(this.fiberCount * 3);
    this.fiberColors = new Float32Array(this.fiberCount * 3);
    this.fiberVelocities = new Float32Array(this.fiberCount);
    this.fiberAngles = new Float32Array(this.fiberCount);
    this.fiberRadii = new Float32Array(this.fiberCount);

    for (let i = 0; i < this.fiberCount; i++) {
      const i3 = i * 3;
      const radius = 0.5 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      const y = 1.6 + Math.random() * 3.4;

      this.fiberPositions[i3] = Math.cos(angle) * radius;
      this.fiberPositions[i3 + 1] = y;
      this.fiberPositions[i3 + 2] = Math.sin(angle) * radius;

      this.fiberAngles[i] = angle;
      this.fiberRadii[i] = radius;
      this.fiberVelocities[i] = 1.5 + Math.random() * 3.0;

      // Cyan / Electric Blue cyber-fiber colors
      this.fiberColors[i3] = 0.0;
      this.fiberColors[i3 + 1] = 0.8 + Math.random() * 0.2;
      this.fiberColors[i3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.fiberPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.fiberColors, 3));

    this.fiberMaterial = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.fiberParticles = new THREE.Points(geometry, this.fiberMaterial);
    this.group.add(this.fiberParticles);
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    sound.playModeSwitch(this.mode === 'virtual');

    if (this.mode === 'platform') {
      this.platformGroup.visible = true;
      this.carrierGroup.visible = false;
      this.fiberParticles.visible = false;
      this.coreMat.color.setHex(0xff3344);
      this.coreMat.emissive.setHex(0xaa1122);
    } else {
      this.platformGroup.visible = false;
      this.carrierGroup.visible = true;
      this.fiberParticles.visible = true;
      this.coreMat.color.setHex(0x00f3ff);
      this.coreMat.emissive.setHex(0x00aacc);
    }
    this.updateTelemetry();
  }

  setThreadCount(count) {
    this.targetThreadCount = count;
    sound.playBurst(Math.min(2.0, count / 50000));
    this.updateTelemetry();
  }

  triggerIoStall() {
    this.isIoStalled = true;
    sound.playClick(0.6);
    setTimeout(() => {
      this.isIoStalled = false;
      this.updateTelemetry();
    }, 2500);
    this.updateTelemetry();
  }

  updateTelemetry() {
    const isVirtual = this.mode === 'virtual';
    const count = this.targetThreadCount;

    let ramUsageMb;
    let osThreads;
    let contextSwitchNs;
    let throughputOps;
    let statusText;
    let statusColor;

    if (isVirtual) {
      // Virtual threads: ~1KB to 2.5KB heap per parked virtual thread!
      ramUsageMb = Math.round((count * 0.002) + 48); // e.g. 100k threads = ~248 MB
      osThreads = this.carrierCores; // Strictly pinned to ForkJoinPool carrier pool size!
      contextSwitchNs = this.isIoStalled ? '~18 ns (Heap copy)' : '~12 ns';
      throughputOps = this.isIoStalled ? '820,000 ops/s (Non-blocking)' : '1,450,000 ops/s';
      statusText = this.isIoStalled ? 'PARKED ON I/O (CARRIER FREED)' : 'HIGH THROUGHPUT M:N CONCURRENCY';
      statusColor = '#00f3ff';
      this.overheatIntensity = 0.0;
    } else {
      // Platform threads: 1MB stack per thread (default -Xss1m)
      ramUsageMb = Math.round(count * 1.05 + 64);
      osThreads = Math.min(count, 32768);
      contextSwitchNs = this.isIoStalled ? '~4,200 ns (Kernel Stalled)' : '~1,850 ns (OS Trap)';
      throughputOps = this.isIoStalled ? '450 ops/s (ALL THREADS BLOCKED)' : `${Math.round(Math.max(10, 80000 - count * 1.5))} ops/s`;

      if (count >= 10000) {
        statusText = 'CRITICAL: NATIVE OOM THRESHOLD EXCEEDED!';
        statusColor = '#ff2244';
        this.overheatIntensity = 1.0;
      } else if (this.isIoStalled) {
        statusText = 'THREAD POOL EXHAUSTED (I/O STALL)';
        statusColor = '#ffaa00';
        this.overheatIntensity = 0.5;
      } else {
        statusText = 'HEAVY 1:1 OS KERNEL THREADS';
        statusColor = '#ff6633';
        this.overheatIntensity = 0.1;
      }
    }

    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        mode: this.mode,
        count,
        ramUsageMb,
        osThreads,
        contextSwitchNs,
        throughputOps,
        statusText,
        statusColor,
        isIoStalled: this.isIoStalled,
        overheated: this.overheatIntensity > 0.6
      });
    }
  }

  update(time, delta) {
    // Pulse central core
    const corePulse = 0.8 + Math.sin(time * 6) * 0.2;
    this.coreMat.emissiveIntensity = corePulse;

    if (this.mode === 'platform') {
      // Platform pistons: heavy mechanical strokes
      const speed = this.isIoStalled ? 0.3 : (this.overheatIntensity > 0.6 ? 8.0 : 2.5);
      this.pistonMeshes.forEach((p, i) => {
        if (this.isIoStalled) {
          // Stalled: frozen at top
          p.rod.position.y = 2.1;
          p.rodMat.color.setHex(0xffaa00);
        } else {
          const stroke = Math.sin(time * speed + p.phase);
          p.rod.position.y = 1.4 + stroke * 0.65;
          if (this.overheatIntensity > 0.6) {
            p.rodMat.color.setHex(Math.sin(time * 12 + i) > 0 ? 0xff2222 : 0x440000);
          } else {
            p.rodMat.color.setHex(0xff3344);
          }
        }
      });

      // Overheat camera vibration effect
      if (this.overheatIntensity > 0.6) {
        this.platformGroup.position.x = (Math.random() - 0.5) * 0.05;
        this.platformGroup.position.z = (Math.random() - 0.5) * 0.05;
      } else {
        this.platformGroup.position.x = 0;
        this.platformGroup.position.z = 0;
      }
    } else {
      // Virtual Threads: Stream of agile fibers orbiting around carriers
      this.carrierMeshes.forEach((c, i) => {
        const pulse = 1.0 + Math.sin(time * 8 + i) * 0.25;
        c.ring.scale.set(pulse, pulse, pulse);
        c.coreMat.emissiveIntensity = 0.6 + Math.sin(time * 5 + i) * 0.4;
      });

      // Update cyber-fiber particles
      const pos = this.fiberParticles.geometry.attributes.position.array;
      const col = this.fiberParticles.geometry.attributes.color.array;
      const speedMult = this.isIoStalled ? 0.4 : 1.2;

      for (let i = 0; i < this.fiberCount; i++) {
        const i3 = i * 3;

        // Spiral upward
        this.fiberAngles[i] += delta * this.fiberVelocities[i] * speedMult;
        pos[i3] = Math.cos(this.fiberAngles[i]) * this.fiberRadii[i];
        pos[i3 + 2] = Math.sin(this.fiberAngles[i]) * this.fiberRadii[i];

        pos[i3 + 1] += delta * (this.fiberVelocities[i] * 0.8) * speedMult;
        if (pos[i3 + 1] > 4.2) {
          // Recycle back down to carrier base
          pos[i3 + 1] = 1.45;
          this.fiberRadii[i] = 0.5 + Math.random() * 1.8;
        }

        // Color coding: cyan when executing, gold when parked on I/O
        if (this.isIoStalled && i % 3 === 0) {
          col[i3] = 1.0; col[i3 + 1] = 0.8; col[i3 + 2] = 0.0; // Amber parked
        } else {
          col[i3] = 0.0; col[i3 + 1] = 0.95; col[i3 + 2] = 1.0; // Electric cyan
        }
      }
      this.fiberParticles.geometry.attributes.position.needsUpdate = true;
      this.fiberParticles.geometry.attributes.color.needsUpdate = true;
    }
  }
}

