import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";

const useLightControls = (light) => {
  const controlSettings = {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    position: {
      value: light.position || [0, 0, 0],
      min: -10,
      max: 10,
      step: 0.1,
    },
  };

  // Add angle and decay controls only for lights that need them
  if (light.type.includes("Spot Light")) {
    controlSettings.angle = {
      value: light.angle || Math.PI / 6,
      min: 0,
      max: Math.PI / 2,
    };
    controlSettings.decay = { value: light.decay || 2, min: 0, max: 2 };
  }

  return useControls(`${light.type} Controls`, controlSettings);
};

const LightComponent = ({ light, updateLightContext }) => {
  const lightRef = useRef();

  // Use a single hook for all lights
  const controls = useLightControls(light);
  let applicableProps = {
    intensity: controls.intensity,
    position: controls.position,
  };

  if (light.type.includes("Spot Light")) {
    applicableProps = {
      ...applicableProps,
      angle: controls.angle,
      decay: controls.decay,
    };
  }

  useHelper(
    lightRef,
    light.type.includes("Hemisphere Light")
      ? THREE.HemisphereLightHelper
      : light.type.includes("Directional Light")
      ? THREE.DirectionalLightHelper
      : light.type.includes("Point Light")
      ? THREE.PointLightHelper
      : light.type.includes("Spot Light")
      ? THREE.SpotLightHelper
      : null,
    1
  );

  useEffect(() => {
    if (lightRef.current) {
      const pos = controls?.position || [0, 0, 0];

      // Set the position and other properties based on light type
      if (
        light.type.includes("Directional Light") ||
        light.type.includes("Point Light") ||
        light.type.includes("Spot Light")
      ) {
        lightRef.current.position.set(...pos);
      }

      if (light.type.includes("Spot Light")) {
        lightRef.current.angle = controls.angle;
        lightRef.current.decay = controls.decay;
      }

      lightRef.current.intensity = controls.intensity;
      // lightRef.current.castShadow = true;

      if (updateLightContext) {
        updateLightContext(light.id, {
          ...light,
          ...applicableProps,
        });
      }
    }
  }, [
    controls.position,
    controls.angle,
    controls.decay,
    controls.intensity,
    light,
    updateLightContext,
  ]);

  return (
    <>
      {light.type.includes("Ambient Light") && (
        <ambientLight ref={lightRef} intensity={controls.intensity} />
      )}
      {light.type.includes("Hemisphere Light") && (
        <hemisphereLight ref={lightRef} intensity={controls.intensity} />
      )}
      {light.type.includes("Directional Light") && (
        <directionalLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-bias={-0.005}
        />
      )}
      {light.type.includes("Point Light") && (
        <pointLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          // castShadow
        />
      )}
      {light.type.includes("Spot Light") && (
        <spotLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          angle={controls.angle}
          decay={controls.decay}
          // castShadow
        />
      )}
    </>
  );
};

export default LightComponent;
