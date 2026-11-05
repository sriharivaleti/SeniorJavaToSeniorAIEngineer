/**
 * Holographic Pillar Terminals
 * Represents the 8 Core Pillars on the Industrial Cyber-Lab Workbench.
 * Supports hover glows, tactile clicks, sound effects, and modal inspection.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { CURRICULUM_PILLARS } from '../data/curriculum.js';
import { sound } from '../audio.js';

export class HoloDeck {
  constructor(scene, onSelectPillar) {
    this.scene = scene;
    this.onSelectPillar = onSelectPillar;
    this.terminals = [];
    this.hoveredTerminal = null;
    this.interactiveMeshes = [];

    this.initTerminals();
  }

  initTerminals() {
    this.group = new THREE.Group();
    const count = CURRICULUM_PILLARS.length;
    const radius = 6.8;

    CURRICULUM_PILLARS.forEach((pillar, index) => {
      // Circular distribution around the workbench perimeter
      const angle = (index / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const terminalGroup = new THREE.Group();
      terminalGroup.position.set(x, 0.72, z);
      // Turn terminal inward towards center
      terminalGroup.lookAt(0, 0.72, 0);

      // 1. Industrial Pedestal Base
      const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.35, 16);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x181f2f,
        metalness: 0.8,
        roughness: 0.35,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = 0.175;
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      terminalGroup.add(pedestal);

      // 2. Brass Accent Rim
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xcc9933,
        metalness: 0.9,
        roughness: 0.2,
      });
      const rimGeo = new THREE.TorusGeometry(0.56, 0.035, 8, 24);
      const rim = new THREE.Mesh(rimGeo, brassMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.35;
      terminalGroup.add(rim);

      // 3. Glowing Holographic Emitter Core
      const emitterGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16);
      const emitterMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pillar.color),
        transparent: true,
        opacity: 0.85
      });
      const emitter = new THREE.Mesh(emitterGeo, emitterMat);
      emitter.position.y = 0.36;
      terminalGroup.add(emitter);

      // 4. Floating Holographic Polyhedron (Interactive click target)
      let holoGeo;
      if (index % 3 === 0) holoGeo = new THREE.OctahedronGeometry(0.32, 0);
      else if (index % 3 === 1) holoGeo = new THREE.IcosahedronGeometry(0.32, 0);
      else holoGeo = new THREE.DodecahedronGeometry(0.30, 0);

      const holoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pillar.color),
        emissive: new THREE.Color(pillar.color),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.3,
        wireframe: false,
        transparent: true,
        opacity: 0.88,
      });
      const holoMesh = new THREE.Mesh(holoGeo, holoMat);
      holoMesh.position.y = 0.85;
      holoMesh.userData = { pillar, type: 'pillar', terminalGroup };
      terminalGroup.add(holoMesh);
      this.interactiveMeshes.push(holoMesh);

      // 5. Wireframe Cage around Hologram
      const wireGeo = new THREE.WireframeGeometry(holoGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
      });
      const wireLine = new THREE.LineSegments(wireGeo, wireMat);
      holoMesh.add(wireLine);

      // 6. Floating Holographic Label Badge
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(7, 13, 24, 0.85)';
      ctx.roundRect(10, 10, 492, 108, 20);
      ctx.fill();
      ctx.strokeStyle = pillar.color;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pillar.icon} ${pillar.title}`, 256, 56);

      ctx.fillStyle = pillar.color;
      ctx.font = '22px monospace';
      ctx.fillText(pillar.subtitle, 256, 92);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.y = 1.45;
      sprite.scale.set(1.5, 0.38, 1);
      terminalGroup.add(sprite);

      // 7. Active Beacon Pulse for Pillar 1 (Day 1 Active)
      if (pillar.id === 'modern-java') {
        const beaconRingGeo = new THREE.RingGeometry(0.7, 0.82, 32);
        const beaconRingMat = new THREE.MeshBasicMaterial({
          color: 0x00f3ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        });
        const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
        beaconRing.rotation.x = -Math.PI / 2;
        beaconRing.position.y = 0.05;
        terminalGroup.add(beaconRing);
        terminalGroup.beaconRing = beaconRing;
      }

      this.group.add(terminalGroup);
      this.terminals.push({
        group: terminalGroup,
        mesh: holoMesh,
        pillar,
        initialY: 0.85,
        rotSpeed: 0.5 + Math.random() * 0.5
      });
    });

    this.scene.add(this.group);
  }

  handlePointerMove(raycaster) {
    const intersects = raycaster.intersectObjects(this.interactiveMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredTerminal !== hit) {
        if (this.hoveredTerminal) this.resetHover(this.hoveredTerminal);
        this.hoveredTerminal = hit;
        this.setHover(hit);
        sound.playHover();
      }
      return hit.userData.pillar;
    } else {
      if (this.hoveredTerminal) {
        this.resetHover(this.hoveredTerminal);
        this.hoveredTerminal = null;
      }
      return null;
    }
  }

  handleClick(raycaster) {
    const intersects = raycaster.intersectObjects(this.interactiveMeshes);
    if (intersects.length > 0) {
      const pillar = intersects[0].object.userData.pillar;
      sound.playClick(1.2);
      if (this.onSelectPillar) this.onSelectPillar(pillar);
      return pillar;
    }
    return null;
  }

  setHover(mesh) {
    mesh.scale.set(1.25, 1.25, 1.25);
    mesh.material.emissiveIntensity = 1.3;
    document.body.style.cursor = 'pointer';
  }

  resetHover(mesh) {
    mesh.scale.set(1.0, 1.0, 1.0);
    mesh.material.emissiveIntensity = 0.6;
    document.body.style.cursor = 'default';
  }

  update(time, delta) {
    this.terminals.forEach((term, i) => {
      // Gentle floating bob
      term.mesh.position.y = term.initialY + Math.sin(time * 2 + i) * 0.08;
      // Rotation
      term.mesh.rotation.y += delta * term.rotSpeed;
      term.mesh.rotation.x = Math.sin(time * 0.5 + i) * 0.2;

      // Pulse active beacon
      if (term.group.beaconRing) {
        const s = 1.0 + Math.sin(time * 4) * 0.15;
        term.group.beaconRing.scale.set(s, s, s);
      }
    });
  }
}
