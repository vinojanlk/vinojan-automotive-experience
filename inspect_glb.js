import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import path from 'path';

async function inspectModel(filePath) {
  const loader = new GLTFLoader();
  const buffer = fs.readFileSync(filePath);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(buffer, path.dirname(filePath) + '/', resolve, reject);
  });
  const scene = gltf.scene;

  console.log('--- Model:', filePath);
  console.log('Scene hierarchy:');
  function printNode(node, indent = '') {
    console.log(`${indent}${node.name || '(no name)'} [${node.type}]`);
    node.children.forEach((c) => printNode(c, indent + '  '));
  }
  printNode(scene);
  console.log('Root transform (pos, rot deg, scale):', {
    position: scene.position.toArray(),
    rotation: scene.rotation.toArray().map(r => THREE.MathUtils.radToDeg(r)),
    scale: scene.scale.toArray(),
  });

  // Compute world bounding box
  const meshes = [];
  scene.traverse((obj) => {
    if (obj.isMesh) meshes.push(obj);
  });
  const worldBox = new THREE.Box3();
  const tempBox = new THREE.Box3();
  meshes.forEach((mesh) => {
    mesh.updateWorldMatrix(true, false);
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    tempBox.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    worldBox.union(tempBox);
  });
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  worldBox.getSize(size);
  worldBox.getCenter(center);
  console.log('BoundingBox min:', worldBox.min.toArray());
  console.log('BoundingBox max:', worldBox.max.toArray());
  console.log('BoundingBox size:', size.toArray());
  console.log('BoundingBox center:', center.toArray());
}

(async () => {
  const base = path.resolve('.');
  await inspectModel(path.join(base, 'public/models/car.glb'));
  await inspectModel(path.join(base, 'public/models/cover.glb'));
})();
