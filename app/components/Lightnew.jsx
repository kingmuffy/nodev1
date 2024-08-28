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
    spotOn1,
    spotIntensity1,
    spotPosition1,
    spotAngle1,
    spotDecay1,
    spotOn2,
    spotIntensity2,
    spotPosition2,
    spotAngle2,
    spotDecay2,
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
    "Spot Light 1": folder({
      spotOn1: true,
      spotIntensity1: { value: 1, min: 0, max: 10, step: 0.1 },
      spotPosition1: { value: [5, 10, 5], step: 1 },
      spotAngle1: { value: Math.PI / 6, min: 0, max: Math.PI / 2 },
      spotDecay1: { value: 2, min: 0, max: 5, step: 0.1 },
    }),
    "Spot Light 2": folder({
      spotOn2: true,
      spotIntensity2: { value: 1, min: 0, max: 10, step: 0.1 },
      spotPosition2: { value: [-5, 10, -5], step: 1 },
      spotAngle2: { value: Math.PI / 6, min: 0, max: Math.PI / 2 },
      spotDecay2: { value: 2, min: 0, max: 5, step: 0.1 },
    }),
  });

  const hemiLightRef = useRef();
  const dirLightRef = useRef();
  const pointLightRef1 = useRef();
  const pointLightRef2 = useRef();
  const spotLightRef1 = useRef();
  const spotLightRef2 = useRef();

  // Adding colored helpers
  useHelper(hemiLightRef, THREE.HemisphereLightHelper, hemiOn ? 1 : 0, "cyan");
  useHelper(dirLightRef, THREE.DirectionalLightHelper, dirOn ? 1 : 0, "green");
  useHelper(pointLightRef1, THREE.PointLightHelper, pointOn1 ? 1 : 0, "red");
  useHelper(pointLightRef2, THREE.PointLightHelper, pointOn2 ? 1 : 0, "blue");
  useHelper(spotLightRef1, THREE.SpotLightHelper, spotOn1 ? 1 : 0, "yellow");
  useHelper(spotLightRef2, THREE.SpotLightHelper, spotOn2 ? 1 : 0, "purple");

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

  useEffect(() => {
    if (spotLightRef1.current) {
      spotLightRef1.current.position.set(...spotPosition1);
      spotLightRef1.current.angle = spotAngle1;
      spotLightRef1.current.decay = spotDecay1; // Set decay for Spot Light 1
    }
  }, [spotPosition1, spotAngle1, spotDecay1]);

  useEffect(() => {
    if (spotLightRef2.current) {
      spotLightRef2.current.position.set(...spotPosition2);
      spotLightRef2.current.angle = spotAngle2;
      spotLightRef2.current.decay = spotDecay2; // Set decay for Spot Light 2
    }
  }, [spotPosition2, spotAngle2, spotDecay2]);

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
      {spotOn1 && (
        <spotLight
          ref={spotLightRef1}
          intensity={spotIntensity1}
          position={spotPosition1}
          angle={spotAngle1}
          decay={spotDecay1} // Decay for Spot Light 1
          castShadow
        />
      )}
      {spotOn2 && (
        <spotLight
          ref={spotLightRef2}
          intensity={spotIntensity2}
          position={spotPosition2}
          angle={spotAngle2}
          decay={spotDecay2} // Decay for Spot Light 2
          castShadow
        />
      )}
    </>
  );
};

export default Lightnew;
