import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";

// Custom hooks for each type of light
const useAmbientLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    color: { value: light.color || "#ffffff" },
  });
};

const useHemisphereLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    skyColor: { value: light.skyColor || "#ffffff" },
    groundColor: { value: light.groundColor || "#444444" },
  });
};

const useDirectionalPointSpotLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    color: { value: light.color || "#ffffff" },
    position: {
      value: light.position || [0, 5, 5],
      min: -10,
      max: 10,
      step: 0.1,
    },
    angle: { value: light.angle || Math.PI / 6, min: 0, max: Math.PI / 2 },
    decay: { value: light.decay || 2, min: 0, max: 2 },
  });
};

const LightComponent = ({ light, onUpdate }) => {
  const lightRef = useRef();

  // Call all hooks unconditionally
  const ambientLightControls = useAmbientLightControls(light);
  const hemisphereLightControls = useHemisphereLightControls(light);
  const directionalPointSpotLightControls =
    useDirectionalPointSpotLightControls(light);

  // Determine the controls to use based on light type
  let controls = {};
  if (light?.type.includes("Ambient Light")) {
    controls = ambientLightControls;
  } else if (light?.type.includes("Hemisphere Light")) {
    controls = hemisphereLightControls;
  } else if (
    light?.type.includes("Directional Light") ||
    light?.type.includes("Point Light") ||
    light?.type.includes("Spot Light")
  ) {
    controls = directionalPointSpotLightControls;
  }

  useHelper(
    lightRef,
    light?.type.includes("Hemisphere Light")
      ? THREE.HemisphereLightHelper
      : light?.type.includes("Directional Light")
      ? THREE.DirectionalLightHelper
      : light?.type.includes("Point Light")
      ? THREE.PointLightHelper
      : light?.type.includes("Spot Light")
      ? THREE.SpotLightHelper
      : null,
    1,
    new THREE.Color(controls.color)
  );

  useEffect(() => {
    if (lightRef.current) {
      const pos = controls.position || [0, 0, 0];

      if (
        light?.type.includes("Directional Light") ||
        light?.type.includes("Point Light") ||
        light?.type.includes("Spot Light")
      ) {
        lightRef.current.position.set(...pos);
      }
      if (light?.type.includes("Spot Light")) {
        lightRef.current.angle = controls.angle || Math.PI / 6;
        lightRef.current.decay = controls.decay || 2;
      }

      lightRef.current.intensity = controls.intensity;
      lightRef.current.color = new THREE.Color(controls.color);

      if (light?.type.includes("Hemisphere Light")) {
        lightRef.current.skyColor = new THREE.Color(controls.skyColor);
        lightRef.current.groundColor = new THREE.Color(controls.groundColor);
      }

      onUpdate(light, controls);
    }
  }, [
    controls.position,
    controls.angle,
    controls.decay,
    controls.intensity,
    controls.color,
    controls.skyColor,
    controls.groundColor,
    light,
    onUpdate,
  ]);

  if (!light || !light.type) {
    console.error("Light or light type is undefined");
    return null;
  }

  // Render the appropriate light component
  switch (light.type) {
    case "Ambient Light 1":
    case "Ambient Light 2":
    case "Ambient Light 3":
    case "Ambient Light 4":
      return (
        <ambientLight
          ref={lightRef}
          intensity={controls.intensity}
          color={controls.color}
        />
      );
    case "Hemisphere Light 1":
    case "Hemisphere Light 2":
    case "Hemisphere Light 3":
    case "Hemisphere Light 4":
      return (
        <hemisphereLight
          ref={lightRef}
          intensity={controls.intensity}
          skyColor={controls.skyColor}
          groundColor={controls.groundColor}
        />
      );
    case "Directional Light 1":
    case "Directional Light 2":
    case "Directional Light 3":
    case "Directional Light 4":
      return (
        <directionalLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          color={controls.color}
          castShadow
        />
      );
    case "Point Light 1":
    case "Point Light 2":
    case "Point Light 3":
    case "Point Light 4":
      return (
        <pointLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          color={controls.color}
          castShadow
        />
      );
    case "Spot Light 1":
    case "Spot Light 2":
    case "Spot Light 3":
    case "Spot Light 4":
      return (
        <spotLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          angle={controls.angle}
          decay={controls.decay}
          color={controls.color}
          castShadow
        />
      );
    default:
      return null;
  }
};

export default LightComponent;
