import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import {
  TextureLoader,
  SRGBColorSpace,
  MeshPhysicalMaterial,
  DoubleSide,
  DirectionalLightHelper,
  SpotLightHelper,
  PointLightHelper,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { MapContext } from "../MapContext";
import { GUI } from "lil-gui";
import { Leva, useControls } from "leva";

const FabricPreview = () => {
  const [currentModel, setCurrentModel] = useState(null);
  const { connectedMaps, materialParams, updateMaterialParams } =
    useContext(MapContext);
  const guiRef = useRef(null);
  const directionalLightRef = useRef(null);
  const spotLightRef = useRef(null);
  const pointLightRef = useRef(null);

  const modelPath = "/Tetrad-Ruben-Midi-Standard.fbx";

  const {
    ambientLightOn,
    ambientIntensity,
    ambientColor,
    directionalLightOn,
    directionalIntensity,
    directionalPosition,
    spotLightOn,
    spotIntensity,
    spotPosition,
    spotAngle,
    pointLightOn,
    pointIntensity,
    pointPosition,
    hemisphereLightOn,
    hemisphereSkyColor,
    hemisphereGroundColor,
    hemisphereIntensity,
  } = useControls("Lights", {
    ambientLightOn: true,
    ambientIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    ambientColor: "#ffffff",
    directionalLightOn: true,
    directionalIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
    directionalPosition: { value: [10, 10, 5], step: 1 },
    spotLightOn: true,
    spotIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
    spotPosition: { value: [10, 10, 10], step: 1 },
    spotAngle: { value: Math.PI / 4, min: 0, max: Math.PI / 2 },
    pointLightOn: true,
    pointIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
    pointPosition: { value: [0, 10, 0], step: 1 },
    hemisphereLightOn: true,
    hemisphereSkyColor: "#ffffff",
    hemisphereGroundColor: "#444444",
    hemisphereIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
  });

  useEffect(() => {
    const guiContainer = guiRef.current;
    const gui = new GUI({ container: guiContainer });

    const params = {
      bumpScale: materialParams.bumpScale || 0,
      displacementScale: materialParams.displacementScale || 0,
      emissiveIntensity: materialParams.emissiveIntensity || 0,
      metalness: materialParams.metalness || 0,
      roughness: materialParams.roughness || 0,
      displacementBias: materialParams.displacementBias || 0,
      flatShading: materialParams.flatShading || false,
      aoMapIntensity: materialParams.aoMapIntensity || 0,
      clearcoat: materialParams.clearcoat || 0,
    };

    gui
      .add(params, "bumpScale", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("bumpScale", value));
    gui
      .add(params, "displacementScale", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("displacementScale", value));
    gui
      .add(params, "emissiveIntensity", 0, 5)
      .step(0.01)
      .onChange((value) => updateMaterialParams("emissiveIntensity", value));
    gui
      .add(params, "metalness", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("metalness", value));
    gui
      .add(params, "roughness", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("roughness", value));
    gui
      .add(params, "displacementBias", -1, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("displacementBias", value));
    gui
      .add(params, "flatShading")
      .onChange((value) => updateMaterialParams("flatShading", value));
    gui
      .add(params, "aoMapIntensity", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("aoMapIntensity", value));
    gui
      .add(params, "clearcoat", 0, 1)
      .step(0.01)
      .onChange((value) => updateMaterialParams("clearcoat", value));

    gui.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    return () => {
      gui.destroy();
    };
  }, [materialParams, updateMaterialParams]);

  useEffect(() => {
    const loadModel = async () => {
      if (currentModel) {
        currentModel.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.isMaterial) {
              child.material.dispose();
            }
          }
        });
        setCurrentModel(null);
      }

      const loadedModel = await new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        loader.load(modelPath, resolve, undefined, reject);
      });

      setCurrentModel(loadedModel);
    };

    loadModel();
  }, [modelPath]);

  useEffect(() => {
    const applyMaterial = () => {
      if (currentModel) {
        const loader = new TextureLoader();

        currentModel.traverse((child) => {
          if (child.isMesh) {
            const materialConfig = {
              map: null,
              bumpMap: null,
              normalMap: null,
              envMap: null,
              roughnessMap: null,
              displacementMap: null,
              specularMap: null,
              emissiveMap: null,
              alphaMap: null,
              aoMap: null,
              metalnessMap: null,
              roughnessMap: null,
              ...materialParams,
              side: DoubleSide,
            };

            Object.entries(connectedMaps).forEach(([mapType, file]) => {
              if (file) {
                loader.load(URL.createObjectURL(file), (texture) => {
                  texture.colorSpace = SRGBColorSpace;
                  texture.needsUpdate = true;

                  switch (mapType) {
                    case "Diffuse":
                      materialConfig.map = texture;
                      break;
                    case "Bump":
                      materialConfig.bumpMap = texture;
                      break;
                    case "Normal":
                      materialConfig.normalMap = texture;
                      break;
                    case "Reflection":
                      materialConfig.envMap = texture;
                      break;
                    case "Refraction":
                      materialConfig.roughnessMap = texture;
                      break;
                    case "Displacement":
                      materialConfig.displacementMap = texture;
                      break;
                    case "Specular":
                      materialConfig.specularMap = texture;
                      break;
                    case "Emissive":
                      materialConfig.emissiveMap = texture;
                      break;
                    case "Opacity":
                      materialConfig.alphaMap = texture;
                      break;
                    case "AO":
                      materialConfig.aoMap = texture;
                      break;
                    case "Metalness":
                      materialConfig.metalnessMap = texture;
                      break;
                    case "Roughness":
                      materialConfig.roughnessMap = texture;
                      break;
                    default:
                      break;
                  }

                  child.material = new MeshPhysicalMaterial(materialConfig);
                  child.material.needsUpdate = true;
                });
              }
            });
          }
        });
      }
    };

    applyMaterial();
  }, [currentModel, connectedMaps, materialParams]);

  return (
    <>
      <Canvas style={{ background: "#808080" }}>
        {ambientLightOn && (
          <ambientLight intensity={ambientIntensity} color={ambientColor} />
        )}
        {directionalLightOn && (
          <>
            <TransformControls>
              <directionalLight
                ref={directionalLightRef}
                intensity={directionalIntensity}
                position={directionalPosition}
              />
            </TransformControls>
            {directionalLightRef.current && (
              <primitive
                object={new DirectionalLightHelper(directionalLightRef.current)}
              />
            )}
          </>
        )}
        {spotLightOn && (
          <>
            <TransformControls>
              <spotLight
                ref={spotLightRef}
                intensity={spotIntensity}
                position={spotPosition}
                angle={spotAngle}
              />
            </TransformControls>
            {spotLightRef.current && (
              <primitive object={new SpotLightHelper(spotLightRef.current)} />
            )}
          </>
        )}
        {pointLightOn && (
          <>
            <TransformControls>
              <pointLight
                ref={pointLightRef}
                intensity={pointIntensity}
                position={pointPosition}
              />
            </TransformControls>
            {pointLightRef.current && (
              <primitive object={new PointLightHelper(pointLightRef.current)} />
            )}
          </>
        )}
        {hemisphereLightOn && (
          <hemisphereLight
            intensity={hemisphereIntensity}
            skyColor={hemisphereSkyColor}
            groundColor={hemisphereGroundColor}
          />
        )}
        {currentModel && <primitive object={currentModel} />}
        <OrbitControls />
      </Canvas>
      <div
        ref={guiRef}
        style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}
      />
      <Leva collapsed />
    </>
  );
};

export default FabricPreview;
