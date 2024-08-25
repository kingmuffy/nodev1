"use client";
import { useEffect } from "react";
import * as THREE from "three";

const ModelPreview = ({ materialParams }) => {
  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight); // 70% width to match the layout
    document.getElementById("model-preview").appendChild(renderer.domElement);

    // Add a light to the scene
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Create a sphere and apply the material
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial(materialParams);
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 3;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.01; // Rotate the sphere for better visibility
      renderer.render(scene, camera);
    };

    animate();

    // Update material when parameters change
    return () => {
      renderer.dispose();
      document.getElementById("model-preview").removeChild(renderer.domElement);
    };
  }, [materialParams]);

  return <div id="model-preview"></div>;
};

export default ModelPreview;
