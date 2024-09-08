import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";

const LightComponent = ({ light, updateLightContext }) => {
  const lightRef = useRef();

  const simplifiedKey = `${light.type} - ${light.id.slice(0, 8)}`;

  const controls = useControls(simplifiedKey, {
    intensity: { value: light.intensity ?? 1, min: 0, max: 10 },
    position: {
      value: light.position ?? [0, 0, 0],
      min: -10,
      max: 10,
      step: 0.1,
    },
    ...(light.type.includes("Spot Light") && {
      angle: {
        value: light.angle ?? Math.PI / 6,
        min: 0,
        max: Math.PI / 2,
      },
      decay: {
        value: light.decay ?? 1,
        min: 0,
        max: 2,
      },
    }),
    ...(light.type.includes("Directional Light") ||
    light.type.includes("Point Light") ||
    light.type.includes("Spot Light")
      ? {
          castShadow: {
            value: light.castShadow !== undefined ? light.castShadow : true,
          },
        }
      : {}),
    ...(light.type.includes("Directional Light") ||
    light.type.includes("Spot Light")
      ? {
          targetPosition: {
            value: light.targetPosition ?? [0, 0, 0],
            min: -10,
            max: 10,
            step: 0.1,
          },
        }
      : {}),
  });

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.intensity = controls.intensity;
      lightRef.current.position.set(...controls.position);

      if (
        light.type.includes("Directional Light") ||
        light.type.includes("Point Light") ||
        light.type.includes("Spot Light")
      ) {
        lightRef.current.castShadow = controls.castShadow;
        lightRef.current.shadow.bias = -0.005;
        lightRef.current.shadow.camera.far = 50;
        lightRef.current.shadow.camera.near = 0.5;
        lightRef.current.shadow.mapSize.width = 1024;
        lightRef.current.shadow.mapSize.height = 1024;
      }

      if (light.type.includes("Spot Light")) {
        lightRef.current.angle = controls.angle;
        lightRef.current.decay = controls.decay;
      }

      if (
        light.type.includes("Directional Light") ||
        light.type.includes("Spot Light")
      ) {
        lightRef.current.target.position.set(...controls.targetPosition);
        lightRef.current.target.updateMatrixWorld();
      }

      if (updateLightContext) {
        updateLightContext(light.id, {
          ...light,
          intensity: controls.intensity,
          position: controls.position,
          angle: controls.angle,
          decay: controls.decay,
          castShadow: controls.castShadow,
          targetPosition: controls.targetPosition,
        });
      }
    }
  }, [
    light,
    controls.intensity,
    controls.position,
    controls.angle,
    controls.decay,
    controls.castShadow,
    controls.targetPosition,
    updateLightContext,
  ]);

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
          castShadow={controls.castShadow}
          shadow-bias={-0.005}
          shadow-camera-far={50}
          shadow-camera-near={0.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
      {light.type.includes("Point Light") && (
        <pointLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          castShadow={controls.castShadow}
          shadow-bias={-0.005}
          shadow-camera-far={50}
          shadow-camera-near={0.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
      {light.type.includes("Spot Light") && (
        <spotLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          angle={controls.angle}
          decay={controls.decay}
          castShadow={controls.castShadow}
          shadow-bias={-0.005}
          shadow-camera-far={50}
          shadow-camera-near={0.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
    </>
  );
};

export default LightComponent;
