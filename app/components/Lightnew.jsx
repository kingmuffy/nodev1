import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls, folder } from "leva";

const Lightnew = () => {
  const {
    hemiOn,
    hemiIntensity,
    hemiSkyColor,
    hemiGroundColor,
    dirOn,
    dirIntensity,
    dirPosition,
    pointOn1,
    pointIntensity1,
    pointPosition1,
    pointOn2,
    pointIntensity2,
    pointPosition2,
  } = useControls({
    "Hemisphere Light": folder({
      hemiOn: true,
      hemiIntensity: { value: 1, min: 0, max: 10, step: 0.1 },
      hemiSkyColor: "#ffffff",
      hemiGroundColor: "#444444",
    }),
    "Directional Light": folder({
      dirOn: true,
      dirIntensity: { value: 2, min: 0, max: 10, step: 0.1 },
      dirPosition: { value: [2, 10, 5], step: 1 },
    }),
    "Point Light 1": folder({
      pointOn1: true,
      pointIntensity1: { value: 1, min: 0, max: 10, step: 0.1 },
      pointPosition1: { value: [5, 5, 5], step: 1 },
    }),
    "Point Light 2": folder({
      pointOn2: true,
      pointIntensity2: { value: 1, min: 0, max: 10, step: 0.1 },
      pointPosition2: { value: [-5, 5, -5], step: 1 },
    }),
  });

  const hemiLightRef = useRef();
  const dirLightRef = useRef();
  const pointLightRef1 = useRef();
  const pointLightRef2 = useRef();

  useHelper(hemiLightRef, THREE.HemisphereLightHelper, 1);
  useHelper(dirLightRef, THREE.DirectionalLightHelper, 1);
  useHelper(pointLightRef1, THREE.PointLightHelper, 1);
  useHelper(pointLightRef2, THREE.PointLightHelper, 1);

  // Update the helpers when the light positions change
  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.position.set(...dirPosition);
    }
  }, [dirPosition]);

  useEffect(() => {
    if (pointLightRef1.current) {
      pointLightRef1.current.position.set(...pointPosition1);
    }
  }, [pointPosition1]);

  useEffect(() => {
    if (pointLightRef2.current) {
      pointLightRef2.current.position.set(...pointPosition2);
    }
  }, [pointPosition2]);

  return (
    <>
      {hemiOn && (
        <hemisphereLight
          ref={hemiLightRef}
          intensity={hemiIntensity}
          skyColor={hemiSkyColor}
          groundColor={hemiGroundColor}
        />
      )}
      {dirOn && (
        <directionalLight
          ref={dirLightRef}
          intensity={dirIntensity}
          position={dirPosition}
          castShadow
        />
      )}
      {pointOn1 && (
        <pointLight
          ref={pointLightRef1}
          intensity={pointIntensity1}
          position={pointPosition1}
          castShadow
        />
      )}
      {pointOn2 && (
        <pointLight
          ref={pointLightRef2}
          intensity={pointIntensity2}
          position={pointPosition2}
          castShadow
        />
      )}
    </>
  );
};

export default Lightnew;
