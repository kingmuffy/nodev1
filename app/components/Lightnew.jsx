import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import { useControls, folder } from "leva";

const Lightnew = () => {
  const {
    ambientOn,
    ambientIntensity,
    hemiOn,
    hemiIntensity,
    dirOn,
    dirIntensity,
    dirCastShadow,
    dirPosition,
    dirOnLeft,
    dirIntensityLeft,
    dirLeftCastShadow,
    dirPositionLeft,
    dirOnRight,
    dirIntensityRight,
    dirRightCastShadow,
    dirPositionRight,
    spotOn1,
    spotIntensity1,
    spot1CastShadow,
    spotPosition1,
    spotOn2,
    spotIntensity2,
    spot2CastShadow,
    spotPosition2,
    spotOn3,
    spotIntensity3,
    spot3CastShadow,
    spotPosition3,
    spotOn4,
    spotIntensity4,
    spot4CastShadow,
    spotPosition4,
    spotOn5,
    spotIntensity5,
    spot5CastShadow,
    spotPosition5,
    pointOn,
    pointIntensity,
    pointCastShadow,
    pointPosition,
  } = useControls({
    "Ambient Light": folder({
      ambientOn: true,
      ambientIntensity: { value: 1, min: 0, max: 10, step: 0.1 },
    }),
    "Hemisphere Light": folder({
      hemiOn: true,
      hemiIntensity: { value: 1, min: 0, max: 10, step: 0.1 },
    }),
    "Directional Light": folder({
      dirOn: true,
      dirIntensity: { value: 2, min: 0, max: 10, step: 0.1 },
      dirCastShadow: true,
      dirPosition: { value: [2, 10, 21], step: 1 },
    }),
    "Directional Light Left": folder({
      dirOnLeft: true,
      dirIntensityLeft: { value: 1.5, min: 0, max: 10, step: 0.1 },
      dirLeftCastShadow: true,
      dirPositionLeft: { value: [-12, 4, 15], step: 1 },
    }),
    "Directional Light Right": folder({
      dirOnRight: true,
      dirIntensityRight: { value: 1.5, min: 0, max: 10, step: 0.1 },
      dirRightCastShadow: true,
      dirPositionRight: { value: [10, 15, 0], step: 1 },
    }),
    "Spot Light 1": folder({
      spotOn1: true,
      spotIntensity1: { value: 1, min: 0, max: 10, step: 0.1 },
      spot1CastShadow: true,
      spotPosition1: { value: [3, 2, 3], step: 1 },
    }),
    "Spot Light 2": folder({
      spotOn2: true,
      spotIntensity2: { value: 1, min: 0, max: 10, step: 0.1 },
      spot2CastShadow: true,
      spotPosition2: { value: [-3, 2, 3], step: 1 },
    }),
    "Spot Light 3": folder({
      spotOn3: true,
      spotIntensity3: { value: 1, min: 0, max: 10, step: 0.1 },
      spot3CastShadow: true,
      spotPosition3: { value: [3, 2, 3], step: 1 },
    }),
    "Spot Light 4": folder({
      spotOn4: true,
      spotIntensity4: { value: 1, min: 0, max: 10, step: 0.1 },
      spot4CastShadow: true,
      spotPosition4: { value: [-6, 2, 3], step: 1 },
    }),
    "Spot Light 5": folder({
      spotOn5: true,
      spotIntensity5: { value: 1, min: 0, max: 10, step: 0.1 },
      spot5CastShadow: true,
      spotPosition5: { value: [6, 2, 3], step: 1 },
    }),
    "Point Light": folder({
      pointOn: true,
      pointIntensity: { value: 1, min: 0, max: 10, step: 0.1 },
      pointCastShadow: true,
      pointPosition: { value: [25, 5, -5], step: 1 },
    }),
  });

  const dirLightRef = useRef();
  const dirLightLeftRef = useRef();
  const dirLightRightRef = useRef();
  const spotLightRef1 = useRef();
  const spotLightRef2 = useRef();
  const spotLightRef3 = useRef();
  const spotLightRef4 = useRef();
  const spotLightRef5 = useRef();
  const pointLightRef = useRef();

  useEffect(() => {
    if (dirOn) {
      useHelper(dirLightRef, THREE.DirectionalLightHelper, 1);
    }
  }, [dirOn]);

  useEffect(() => {
    if (dirOnLeft) {
      useHelper(dirLightLeftRef, THREE.DirectionalLightHelper, 1);
    }
  }, [dirOnLeft]);

  useEffect(() => {
    if (dirOnRight) {
      useHelper(dirLightRightRef, THREE.DirectionalLightHelper, 1);
    }
  }, [dirOnRight]);

  useEffect(() => {
    if (spotOn1) {
      useHelper(spotLightRef1, THREE.SpotLightHelper);
    }
  }, [spotOn1]);

  useEffect(() => {
    if (spotOn2) {
      useHelper(spotLightRef2, THREE.SpotLightHelper);
    }
  }, [spotOn2]);

  useEffect(() => {
    if (spotOn3) {
      useHelper(spotLightRef3, THREE.SpotLightHelper);
    }
  }, [spotOn3]);

  useEffect(() => {
    if (spotOn4) {
      useHelper(spotLightRef4, THREE.SpotLightHelper);
    }
  }, [spotOn4]);

  useEffect(() => {
    if (spotOn5) {
      useHelper(spotLightRef5, THREE.SpotLightHelper);
    }
  }, [spotOn5]);

  useEffect(() => {
    if (pointOn) {
      useHelper(pointLightRef, THREE.PointLightHelper, 1);
    }
  }, [pointOn]);

  return (
    <>
      {ambientOn && <ambientLight intensity={ambientIntensity} />}
      {hemiOn && <hemisphereLight intensity={hemiIntensity} />}
      {dirOn && (
        <>
          <directionalLight
            ref={dirLightRef}
            intensity={dirIntensity}
            position={dirPosition}
            castShadow={dirCastShadow}
            shadow-bias={DSB}
            shadow-mapSize-width={DSM}
            shadow-mapSize-height={DSM}
          />
        </>
      )}
      {dirOnLeft && (
        <>
          <directionalLight
            ref={dirLightLeftRef}
            intensity={dirIntensityLeft}
            position={dirPositionLeft}
            castShadow={dirLeftCastShadow}
            shadow-bias={DLSB}
            shadow-mapSize-width={DLSM}
            shadow-mapSize-height={DLSM}
          />
        </>
      )}
      {dirOnRight && (
        <>
          <directionalLight
            ref={dirLightRightRef}
            intensity={dirIntensityRight}
            position={dirPositionRight}
            castShadow={dirRightCastShadow}
            shadow-bias={DRSB}
            shadow-mapSize-width={DRSM}
            shadow-mapSize-height={DRSM}
          />
        </>
      )}
      {spotOn1 && (
        <>
          <spotLight
            ref={spotLightRef1}
            intensity={spotIntensity1}
            position={spotPosition1}
            castShadow={spot1CastShadow}
            shadow-bias={SSB1}
            shadow-mapSize-width={SSM1}
            shadow-mapSize-height={SSM1}
          />
        </>
      )}
      {spotOn2 && (
        <>
          <spotLight
            ref={spotLightRef2}
            intensity={spotIntensity2}
            position={spotPosition2}
            castShadow={spot2CastShadow}
            shadow-bias={SSB2}
            shadow-mapSize-width={SSM2}
            shadow-mapSize-height={SSM2}
          />
        </>
      )}
      {spotOn3 && (
        <>
          <spotLight
            ref={spotLightRef3}
            intensity={spotIntensity3}
            position={spotPosition3}
            castShadow={spot3CastShadow}
            shadow-bias={SSB3}
            shadow-mapSize-width={SSM3}
            shadow-mapSize-height={SSM3}
          />
        </>
      )}
      {spotOn4 && (
        <>
          <spotLight
            ref={spotLightRef4}
            intensity={spotIntensity4}
            position={spotPosition4}
            castShadow={spot4CastShadow}
            shadow-bias={SSB4}
            shadow-mapSize-width={SSM4}
            shadow-mapSize-height={SSM4}
          />
        </>
      )}
      {spotOn5 && (
        <>
          <spotLight
            ref={spotLightRef5}
            intensity={spotIntensity5}
            position={spotPosition5}
            castShadow={spot5CastShadow}
            shadow-bias={SSB5}
            shadow-mapSize-width={SSM5}
            shadow-mapSize-height={SSM5}
          />
        </>
      )}
      {pointOn && (
        <>
          <pointLight
            ref={pointLightRef}
            intensity={pointIntensity}
            position={pointPosition}
            castShadow={pointCastShadow}
            shadow-bias={PSB}
            shadow-mapSize-width={PSM}
            shadow-mapSize-height={PSM}
          />
        </>
      )}
    </>
  );
};

export default Lightnew;
