import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";

const useAmbientLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
  });
};

const useHemisphereLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
  });
};

const useDirectionalLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    position: {
      value: light.position || [0, 5, 5],
      min: -10,
      max: 10,
      step: 0.1,
    },
  });
};

const usePointLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    position: {
      value: light.position || [5, 5, 5],
      min: -10,
      max: 10,
      step: 0.1,
    },
  });
};

const useSpotLightControls = (light) => {
  return useControls(`${light.type} Controls`, {
    intensity: { value: light.intensity || 1, min: 0, max: 10 },
    position: {
      value: light.position || [5, 5, 5],
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

  const ambientLightControls = useAmbientLightControls(light);
  const hemisphereLightControls = useHemisphereLightControls(light);
  const directionalLightControls = useDirectionalLightControls(light);
  const pointLightControls = usePointLightControls(light);
  const spotLightControls = useSpotLightControls(light);

  let controls = {};
  if (light?.type.includes("Ambient Light")) {
    controls = ambientLightControls;
  } else if (light?.type.includes("Hemisphere Light")) {
    controls = hemisphereLightControls;
  } else if (light?.type.includes("Directional Light")) {
    controls = directionalLightControls;
  } else if (light?.type.includes("Point Light")) {
    controls = pointLightControls;
  } else if (light?.type.includes("Spot Light")) {
    controls = spotLightControls;
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
    1
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

      onUpdate(light, controls);
    }
  }, [
    controls.position,
    controls.angle,
    controls.decay,
    controls.intensity,
    light,
    onUpdate,
  ]);

  if (!light || !light.type) {
    console.error("Light or light type is undefined");
    return null;
  }

  switch (light.type) {
    case "Ambient Light 1":
    case "Ambient Light 2":
    case "Ambient Light 3":
    case "Ambient Light 4":
      return <ambientLight ref={lightRef} intensity={controls.intensity} />;
    case "Hemisphere Light 1":
    case "Hemisphere Light 2":
    case "Hemisphere Light 3":
    case "Hemisphere Light 4":
      return <hemisphereLight ref={lightRef} intensity={controls.intensity} />;
    case "Directional Light 1":
    case "Directional Light 2":
    case "Directional Light 3":
    case "Directional Light 4":
      return (
        <directionalLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
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
          castShadow
        />
      );
    default:
      return null;
  }
};

export default LightComponent;
