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
import Lightnew from "./Lightnew"; // Importing the Lightnew component

const FabricPreview = () => {
const [currentModel, setCurrentModel] = useState(null);
const [lights, setLights] = useState([]); // State to hold the lights
const [selectedLight, setSelectedLight] = useState("Ambient Light"); // State for selected light type
const { connectedMaps, materialParams, updateMaterialParams } =
useContext(MapContext);
const guiRef = useRef(null); // Ref for GUI container

const modelPath = "/Tetrad-Ruben-Midi-Standard.fbx";

const addLight = () => {
const defaultProperties = {
"Ambient Light": {
type: "Ambient Light",
intensity: 1,
color: "#ffffff",
},
"Hemisphere Light": {
type: "Hemisphere Light",
intensity: 1,
skyColor: "#ffffff",
groundColor: "#444444",
},
"Directional Light": {
type: "Directional Light",
intensity: 1,
position: [0, 5, 5],
color: "#ffffff",
},
"Point Light": {
type: "Point Light",
intensity: 1,
position: [5, 5, 5],
color: "#ffffff",
},
"Spot Light": {
type: "Spot Light",
intensity: 1,
position: [5, 5, 5],
angle: Math.PI / 6,
decay: 2,
color: "#ffffff",
},
};

    setLights([...lights, defaultProperties[selectedLight]]);

};

const deleteLight = (lightToDelete) => {
setLights((prevLights) =>
prevLights.filter((light) => light !== lightToDelete)
);
};

useEffect(() => {
const guiContainer = guiRef.current;
const gui = new GUI({ container: guiContainer }); // Render GUI in the specific container

    const defaultMaterialParams = {
      bumpScale: 0,
      displacementScale: 0,
      emissiveIntensity: 0,
      metalness: 0,
      roughness: 0,
      displacementBias: 0,
      flatShading: false,
      aoMapIntensity: 0,
      clearcoat: 0,
    };

    const params = { ...defaultMaterialParams, ...materialParams };

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
<div
style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1001,
        }} >
<select
onChange={(e) => setSelectedLight(e.target.value)}
value={selectedLight} >
<option value="Ambient Light">Ambient Light</option>
<option value="Hemisphere Light">Hemisphere Light</option>
<option value="Directional Light">Directional Light</option>
<option value="Point Light">Point Light</option>
<option value="Spot Light">Spot Light</option>
</select>
<button onClick={addLight} style={{ marginLeft: "10px" }}>
Add Light
</button>
</div>
<Canvas style={{ backgroundColor: "#808080" }}>
<Lightnew lights={lights} onDeleteLight={deleteLight} />
{currentModel && <primitive object={currentModel} />}
<gridHelper args={[100, 100, "#ffffff", "#555555"]} />
<OrbitControls />
</Canvas>
<div
ref={guiRef}
style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }} ></div>
</>
);
};

export default FabricPreview;
