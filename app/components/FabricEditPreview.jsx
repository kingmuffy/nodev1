import React, { useEffect, useState, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";
import {
  TextureLoader,
  SRGBColorSpace,
  MeshPhysicalMaterial,
  DoubleSide,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { MapContext } from "../MapContext";

const FabricEditPreview = ({ parameters }) => {
  const [currentModel, setCurrentModel] = useState(null);
  const { connectedMaps, materialParams, updateMaterialParams } =
    useContext(MapContext);

  const modelPath = "/FabricTexture.fbx";

  useControls({
    bumpScale: {
      value: parameters.bumpScale,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => updateMaterialParams("bumpScale", value),
    },
    displacementScale: {
      value: parameters.displacementScale,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => updateMaterialParams("displacementScale", value),
    },
    emissiveIntensity: {
      value: materialParams.emissiveIntensity,
      min: 0,
      max: 5,
      step: 0.1,
      onChange: (value) => updateMaterialParams("emissiveIntensity", value),
    },
    metalness: {
      value: materialParams.metalness,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => updateMaterialParams("metalness", value),
    },
    roughness: {
      value: materialParams.roughness,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => updateMaterialParams("roughness", value),
    },
  });

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
                const textureLoader = loader.load(
                  `${fileOrUrl}?r=${Math.floor(Math.random() * 100000)}`, // Cache busting
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

                if (typeof fileOrUrl !== "string") {
                  textureLoader.dispose();
                }
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
      <Leva collapsed />
    </>
  );
};

export default FabricEditPreview;
