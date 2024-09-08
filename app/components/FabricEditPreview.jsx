import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  TextureLoader,
  SRGBColorSpace,
  MeshPhysicalMaterial,
  DoubleSide,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { MapContext } from "../MapContext";
import { GUI } from "lil-gui";

const FabricEditPreview = ({ parameters }) => {
  const [currentModel, setCurrentModel] = useState(null);
  const { connectedMaps, materialParams, updateMaterialParams } =
    useContext(MapContext);
  const guiRef = useRef(null);

  const modelPath = "/FabricTexture.fbx";

  useEffect(() => {
    const guiContainer = guiRef.current;
    const gui = new GUI({ container: guiContainer });

    const params = {
      bumpScale: parameters.bumpScale || 0,
      displacementScale: parameters.displacementScale || 0,
      emissiveIntensity: parameters.emissiveIntensity || 0,
      metalness: parameters.metalness || 0,
      roughness: parameters.roughness || 0,
      displacementBias: parameters.displacementBias || 0,
      flatShading: parameters.flatShading || false,
      aoMapIntensity: parameters.aoMapIntensity || 0,
      clearcoat: parameters.clearcoat || 0,
    };

    gui
      .add(params, "bumpScale", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.bumpScale = value;
        updateMaterialParams("bumpScale", value);
      });

    gui
      .add(params, "displacementScale", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.displacementScale = value;
        updateMaterialParams("displacementScale", value);
      });

    gui
      .add(params, "emissiveIntensity", 0, 5)
      .step(0.01)
      .onChange((value) => {
        params.emissiveIntensity = value;
        updateMaterialParams("emissiveIntensity", value);
      });

    gui.add;

    gui
      .add(params, "metalness", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.metalness = value;
        updateMaterialParams("metalness", value);
      });

    gui
      .add(params, "roughness", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.roughness = value;
        updateMaterialParams("roughness", value);
      });

    gui
      .add(params, "displacementBias", -1, 1)
      .step(0.01)
      .onChange((value) => {
        params.displacementBias = value;
        updateMaterialParams("displacementBias", value);
      });

    gui.add(params, "flatShading").onChange((value) => {
      params.flatShading = value;
      updateMaterialParams("flatShading", value);
    });

    gui
      .add(params, "aoMapIntensity", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.aoMapIntensity = value;
        updateMaterialParams("aoMapIntensity", value);
      });

    gui
      .add(params, "clearcoat", 0, 1)
      .step(0.01)
      .onChange((value) => {
        params.clearcoat = value;
        updateMaterialParams("clearcoat", value);
      });

    gui.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    return () => {
      gui.destroy();
    };
  }, [parameters, updateMaterialParams]);

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

            Object.entries(connectedMaps).forEach(([mapType, fileOrUrl]) => {
              if (fileOrUrl) {
                loader.load(
                  `${fileOrUrl}?r=${Math.floor(Math.random() * 100000)}`,
                  (texture) => {
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
                  }
                );
              } else {
                switch (mapType) {
                  case "Diffuse":
                    materialConfig.map = null;
                    break;
                  case "Bump":
                    materialConfig.bumpMap = null;
                    break;
                  case "Normal":
                    materialConfig.normalMap = null;
                    break;
                  case "Reflection":
                    materialConfig.envMap = null;
                    break;
                  case "Refraction":
                    materialConfig.roughnessMap = null;
                    break;
                  case "Displacement":
                    materialConfig.displacementMap = null;
                    break;
                  case "Specular":
                    materialConfig.specularMap = null;
                    break;
                  case "Emissive":
                    materialConfig.emissiveMap = null;
                    break;
                  case "Opacity":
                    materialConfig.alphaMap = null;
                    break;
                  case "AO":
                    materialConfig.aoMap = null;
                    break;
                  case "Metalness":
                    materialConfig.metalnessMap = null;
                    break;
                  case "Roughness":
                    materialConfig.roughnessMap = null;
                    break;
                  default:
                    break;
                }

                child.material.needsUpdate = true;
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
      <Canvas>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        {currentModel && <primitive object={currentModel} />}
        <OrbitControls />
      </Canvas>
      {/* GUI container */}
      <div
        ref={guiRef}
        style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}
      ></div>
    </>
  );
};

export default FabricEditPreview;
