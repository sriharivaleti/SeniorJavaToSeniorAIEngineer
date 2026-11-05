/**
 * Industrial Cyber-Lab Environment
 * Inspired by things-workshop.com: Dark tactile studio workbench,
 * brass & titanium accents, cybernetic grid floor, and ambient dust motes.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class LabEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.particles = null;
    this.initLighting();
    this.initFloor();
    this.initWorkbench();
    this.initAmbientParticles();
  }

  initLighting() {
    // Soft cool ambient base
    const ambient = new THREE.AmbientLight(0x0a101d, 1.2);
    this.scene.add(ambient);

    // Main studio key light (crisp highlights on metallic surfaces)
    const keyLight = new THREE.DirectionalLight(0xd6eaff, 2.5);
    keyLight.position.set(12, 22, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Warm amber rim light from the rear left (tactile industrial feel)
    const rimLight = new THREE.DirectionalLight(0xff9933, 1.8);
    rimLight.position.set(-15, 12, -15);
    this.scene.add(rimLight);

    // Cyan accent fill light from the right
    const cyanFill = new THREE.PointLight(0x00f3ff, 2.2, 25);
    cyanFill.position.set(8, 6, -6);
    this.scene.add(cyanFill);

    // Ground bounce light
    const bounceLight = new THREE.HemisphereLight(0x16243b, 0x05080f, 0.6);
    this.scene.add(bounceLight);
  }

  initFloor() {
    // Large dark metallic floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b12,
      roughness: 0.85,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Cybernetic Grid overlay
    const gridHelper = new THREE.GridHelper(80, 80, 0x00f3ff, 0x16273a);
    gridHelper.position.y = 0.0;
    this.scene.add(gridHelper);

    // Circular glowing ring on the ground
    const ringGeo = new THREE.RingGeometry(11.8, 12.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);
  }

  initWorkbench() {
    this.workbenchGroup = new THREE.Group();

    // Central Heavy Industrial Workbench Base (Matte dark titanium finish)
    const baseGeo = new THREE.CylinderGeometry(9.5, 10.5, 0.7, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.75,
      roughness: 0.35,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.35;
    base.receiveShadow = true;
    base.castShadow = true;
    this.workbenchGroup.add(base);

    // Brass / Titanium chamfered rim
    const rimGeo = new THREE.TorusGeometry(9.55, 0.12, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xcc9933, // Industrial Brass
      metalness: 0.9,
      roughness: 0.25,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.7;
    this.workbenchGroup.add(rim);

    // Inner glowing ring channel
    const channelGeo = new THREE.TorusGeometry(7.0, 0.06, 16, 64);
    const channelMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.7
    });
    const channel = new THREE.Mesh(channelGeo, channelMat);
    channel.rotation.x = Math.PI / 2;
    channel.position.y = 0.71;
    this.workbenchGroup.add(channel);

    // Central Reactor Pedestal (Octagonal platform)
    const pedestalGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.45, 8);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x151c2c,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.9;
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    this.workbenchGroup.add(pedestal);

    // Reactor Pedestal Brass Accent Ring
    const pedRimGeo = new THREE.TorusGeometry(3.62, 0.08, 16, 32);
    const pedRim = new THREE.Mesh(pedRimGeo, rimMat);
    pedRim.rotation.x = Math.PI / 2;
    pedRim.position.y = 1.13;
    this.workbenchGroup.add(pedRim);

    this.scene.add(this.workbenchGroup);
  }

  initAmbientParticles() {
    // Ambient dust motes / glowing holo-particles
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 14;
      positions[i + 2] = (Math.random() - 0.5) * 30;

      // Mix of faint cyan and amber
      const isAmber = Math.random() > 0.75;
      colors[i] = isAmber ? 1.0 : 0.0;
      colors[i + 1] = isAmber ? 0.7 : 0.95;
      colors[i + 2] = isAmber ? 0.2 : 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta) {
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 0.25;
        if (positions[i] > 14) positions[i] = 0.2;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
