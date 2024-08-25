"use client";
import { useEffect } from "react";
import * as THREE from "three";
import { GUI } from "lil-gui";

const My3DComponent = () => {
  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("threejs-canvas").appendChild(renderer.domElement);

    // Add a basic mesh with a material
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Create the GUI and material parameters
    const gui = new GUI({ autoPlace: false });
    document.getElementById("gui-container").appendChild(gui.domElement);

    const materialParams = {
      diffuse: 0xffffff,
      reflection: 0,
      refraction: 0,
      bump: 0,
      reflectionGlossiness: 0.5,
      refractionGlossiness: 0.5,
      displacement: 0,
      environment: 0,
      translucent: 0,
      ior: 1.45,
      fresnelIOR: 1.33,
      opacity: 1,
      anisotropy: 0,
      anRotation: 0,
      fogColour: 0xffffff,
      selfIllumination: 0,
      gtrTailFallOff: 0,
      metalness: 0.5,
      coatAmount: 0,
      coatGlossiness: 0.5,
      coatIOR: 1.45,
      coatColour: 0xffffff,
      sheenColour: 0xffffff,
      sheenGlossiness: 0.5,
      coatBump: 0,
      thinFilmThickness: 0,
      translucentAmount: 0,
      thinFilmIOR: 1.45,
    };

    // Add controls to the GUI
    gui
      .addColor(materialParams, "diffuse")
      .name("Diffuse")
      .onChange((value) => {
        material.color.set(value);
      });
    gui
      .add(materialParams, "reflection")
      .name("Reflection")
      .onChange((value) => {
        material.reflectivity = value;
      });
    gui.add(materialParams, "refraction").name("Refraction");
    gui.add(materialParams, "bump").name("Bump");
    gui
      .add(materialParams, "reflectionGlossiness")
      .name("Reflection Glossiness");
    gui
      .add(materialParams, "refractionGlossiness")
      .name("Refraction Glossiness");
    gui.add(materialParams, "displacement").name("Displacement");
    gui.add(materialParams, "environment").name("Environment");
    gui.add(materialParams, "translucent").name("Translucent");
    gui.add(materialParams, "ior").name("IOR");
    gui.add(materialParams, "fresnelIOR").name("Fresnel IOR");
    gui
      .add(materialParams, "opacity")
      .name("Opacity")
      .onChange((value) => {
        material.opacity = value;
        material.transparent = value < 1;
      });
    gui.add(materialParams, "anisotropy").name("Anisotropy");
    gui.add(materialParams, "anRotation").name("An. Rotation");
    gui.addColor(materialParams, "fogColour").name("Fog Colour");
    gui.add(materialParams, "selfIllumination").name("Self Illumination");
    gui.add(materialParams, "gtrTailFallOff").name("GTR Tail Fall Off");
    gui
      .add(materialParams, "metalness")
      .name("Metalness")
      .onChange((value) => {
        material.metalness = value;
      });
    gui.add(materialParams, "coatAmount").name("Coat Amount");
    gui.add(materialParams, "coatGlossiness").name("Coat Glossiness");
    gui.add(materialParams, "coatIOR").name("Coat IOR");
    gui.addColor(materialParams, "coatColour").name("Coat Colour");
    gui.addColor(materialParams, "sheenColour").name("Sheen Colour");
    gui.add(materialParams, "sheenGlossiness").name("Sheen Glossiness");
    gui.add(materialParams, "coatBump").name("Coat Bump");
    gui.add(materialParams, "thinFilmThickness").name("Thin Film Thickness");
    gui.add(materialParams, "translucentAmount").name("Translucent Amount");
    gui.add(materialParams, "thinFilmIOR").name("Thin Film IOR");

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the cube for some visual feedback
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up on unmount
    return () => {
      gui.destroy();
      renderer.dispose();
      document
        .getElementById("threejs-canvas")
        .removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-screen">
      <div id="threejs-canvas" className="absolute inset-0"></div>
      <div id="gui-container" className="absolute top-0 right-0 p-4 z-10"></div>
    </div>
  );
};

export default My3DComponent;
