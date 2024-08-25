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

const FabricPreview = () => {
  const [currentModel, setCurrentModel] = useState(null);
  const { connectedMaps } = useContext(MapContext);

  const modelPath = "/FabricTexture.fbx";

  // GUI controls for non-textural properties using Leva
  const {
    bumpScale,
    displacementScale,
    emissiveIntensity,
    metalness,
    roughness,
  } = useControls({
    bumpScale: { value: 0.3, min: 0, max: 1, step: 0.01 },
    displacementScale: { value: 0.1, min: 0, max: 1, step: 0.01 },
    emissiveIntensity: { value: 1.0, min: 0, max: 5, step: 0.1 },
    metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
  });

  // Load the model when the component mounts
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

  // Apply textures when nodes are connected or files are uploaded
  useEffect(() => {
    const applyMaterial = () => {
      if (currentModel && Object.keys(connectedMaps).length > 0) {
        const loader = new TextureLoader();

        currentModel.traverse((child) => {
          if (child.isMesh) {
            // Initialize the material config with default values
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
              metalness,
              roughness,
              bumpScale,
              displacementScale,
              emissiveIntensity,
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
                    case "AO": // Ambient Occlusion
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
  }, [
    currentModel,
    connectedMaps,
    bumpScale,
    displacementScale,
    emissiveIntensity,
    metalness,
    roughness,
  ]);

  return (
    <>
      <Canvas>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        {currentModel && <primitive object={currentModel} />}
        <OrbitControls />
      </Canvas>
      <Leva collapsed /> {/* Renders the Leva panel */}
    </>
  );
};

export default FabricPreview;
