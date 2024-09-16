"use client";
import React, { useEffect, useContext, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";
import {
  TextureLoader,
  SRGBColorSpace,
  MeshPhysicalMaterial,
  DoubleSide,
} from "three";
import { MapContext } from "../MapContext";
import { GUI } from "lil-gui";
import LightNew from "./Lightnew";
import { LightContext } from "../LightContext";
import axios from "axios";

const FabricPreview = () => {
  const { lights, updateLight } = useContext(LightContext);
  const {
    connectedMaps,
    materialParams = {},
    updateMaterialParams,
  } = useContext(MapContext);
  const [currentModel, setCurrentModel] = useState(null);
  const guiRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const modelPath = "/Tetrad-Ruben-Midi-Standard.fbx";

  const saveLightSettings = async () => {
    setLoading(true);
    try {
      const lightSettings = lights.map((light) => ({
        lightType: light.type,
        intensity: light.intensity,
        position: JSON.stringify(light.position || [0, 0, 0]),
        angle: light.angle ?? null,
        decay: light.decay ?? null,
        castShadow: light.castShadow ?? true,
      }));

      const response = await axios.post("/api/lights", { lightSettings });

      if (response.data.status === "success") {
        setSnackbarMessage("Light settings saved successfully!");
      } else {
        setSnackbarMessage("Failed to save light settings.");
      }
    } catch (error) {
      console.error("Error saving light settings:", error);
      setSnackbarMessage("Error saving light settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const guiContainer = guiRef.current;
    const gui = new GUI({ container: guiContainer });

    const defaultMaterialParams = {
      bumpScale: 0,
      sheenEnabled: false,
      sheenIntensity: 1,
      sheenRoughness: 0.5,
      sheenColor: "#ffffff",
      displacementScale: 0,
      emissiveIntensity: 0,
      metalness: 0,
      roughness: 0,
      displacementBias: 0,
      flatShading: false,
      aoMapIntensity: 0,
      clearcoat: 0,
      normalScale: new THREE.Vector2(1, 1),
      diffuseTiling: new THREE.Vector2(1, 1),
    };

    const params = { ...defaultMaterialParams, ...materialParams };

    const updateModelAndContext = (paramName, value) => {
      if (currentModel) {
        currentModel.traverse((child) => {
          if (child.isMesh) {
            if (paramName === "normalScale" && child.material.normalMap) {
              if (
                !child.material.normalScale ||
                !(child.material.normalScale instanceof THREE.Vector2)
              ) {
                child.material.normalScale = new THREE.Vector2(1, 1);
              }
              child.material.normalScale.set(value.x, value.y);
            } else if (paramName === "diffuseTiling" && child.material.map) {
              child.material.map.repeat.set(value.x, value.y);
              child.material.map.needsUpdate = true;
            } else if (paramName.startsWith("sheen")) {
              if (params.sheenEnabled) {
                child.material.sheen = true;
                if (paramName === "sheenColor") {
                  child.material.sheenColor = new THREE.Color(value);
                } else if (paramName === "sheenRoughness") {
                  child.material.sheenRoughness = value;
                } else if (paramName === "sheenIntensity") {
                  child.material.sheenIntensity = value;
                }
              } else {
                child.material.sheen = false;
              }
              child.material.needsUpdate = true;
            } else {
              child.material[paramName] = value;
              child.material.needsUpdate = true;
            }
          }
        });
      }
      updateMaterialParams(paramName, value);
    };

    gui
      .add(params, "bumpScale", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("bumpScale", value);
      });

    gui.add(params, "sheenEnabled").onChange((value) => {
      updateModelAndContext("sheenEnabled", value);
    });

    gui
      .add(params, "sheenIntensity", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("sheenIntensity", value);
      });

    gui
      .add(params, "sheenRoughness", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("sheenRoughness", value);
      });

    gui.addColor(params, "sheenColor").onChange((value) => {
      updateModelAndContext("sheenColor", value);
    });

    gui
      .add(params, "displacementScale", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("displacementScale", value);
      });

    gui
      .add(params, "emissiveIntensity", 0, 5)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("emissiveIntensity", value);
      });

    gui
      .add(params, "metalness", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("metalness", value);
      });

    gui
      .add(params, "roughness", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("roughness", value);
      });

    gui
      .add(params, "displacementBias", -1, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("displacementBias", value);
      });

    gui.add(params, "flatShading").onChange((value) => {
      updateModelAndContext("flatShading", value);
    });

    gui
      .add(params, "aoMapIntensity", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("aoMapIntensity", value);
      });

    gui
      .add(params, "clearcoat", 0, 1)
      .step(0.01)
      .onChange((value) => {
        updateModelAndContext("clearcoat", value);
      });

    gui
      .add(params.normalScale, "x", 0, 3)
      .step(0.01)
      .name("normalScaleX")
      .onChange((value) => {
        updateModelAndContext("normalScale", {
          x: value,
          y: params.normalScale.y,
        });
      });

    gui
      .add(params.normalScale, "y", 0, 3)
      .step(0.01)
      .name("normalScaleY")
      .onChange((value) => {
        updateModelAndContext("normalScale", {
          x: params.normalScale.x,
          y: value,
        });
      });

    gui
      .add(params.diffuseTiling, "x", 0.1, 10)
      .step(0.1)
      .name("Diffuse Tiling X")
      .onChange((value) => {
        updateModelAndContext("diffuseTiling", {
          x: value,
          y: params.diffuseTiling.y,
        });
      });

    gui
      .add(params.diffuseTiling, "y", 0.1, 10)
      .step(0.1)
      .name("Diffuse Tiling Y")
      .onChange((value) => {
        updateModelAndContext("diffuseTiling", {
          x: params.diffuseTiling.x,
          y: value,
        });
      });

    gui.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    return () => {
      gui.destroy();
    };
  }, [materialParams, updateMaterialParams, currentModel]);

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
      if (currentModel && Object.keys(connectedMaps).length > 0) {
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
              anisotropyMap: null,
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
                  texture.wrapS = THREE.RepeatWrapping;
                  texture.wrapT = THREE.RepeatWrapping;
                  texture.needsUpdate = true;

                  switch (mapType) {
                    case "Diffuse":
                      const { diffuseTiling = { x: 1, y: 1 } } = materialParams;
                      texture.repeat.set(diffuseTiling.x, diffuseTiling.y);
                      materialConfig.map = texture;
                      break;
                    case "Bump":
                      materialConfig.bumpMap = texture;
                      break;
                    case "Normal":
                      materialConfig.normalMap = texture;
                      break;
                    case "Environment":
                      materialConfig.envMap = texture;
                      break;
                    case "Refraction":
                      materialConfig.roughnessMap = texture;
                      break;
                    case "Displacement":
                      materialConfig.displacementMap = texture;
                      break;
                    case "anisotropyMap":
                      materialConfig.anisotropyMap = texture;
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

                  child.material = new MeshPhysicalMaterial({
                    ...materialConfig,
                    sheen: materialParams.sheenEnabled,
                    shadowSide: DoubleSide,
                  });
                  child.material.needsUpdate = true;
                });
              }
            });

            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    };

    applyMaterial();
  }, [currentModel, connectedMaps, materialParams]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ backgroundColor: "#efefef" }}
      >
        <LightNew lights={lights} onUpdate={updateLight} />
        {currentModel && <primitive object={currentModel} />}
        <gridHelper args={[100, 100, "#ffffff", "#555555"]} />
        <OrbitControls />
      </Canvas>

      <div
        ref={guiRef}
        style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}
      ></div>
    </>
  );
};

export default FabricPreview;
