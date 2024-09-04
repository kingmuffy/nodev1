import React, { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const LightContext = createContext();

export const LightProvider = ({ children }) => {
  const [selectedLight, setSelectedLight] = useState("Ambient Light");
  const [lights, setLights] = useState([]);

  // Function to add a new light
  const addLight = () => {
    const defaultProperties = {
      "Ambient Light": [
        {
          id: uuidv4(),
          type: "Ambient Light 1",
          lightType: "Ambient Light 1",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Ambient Light 2",
          lightType: "Ambient Light 2",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Ambient Light 3",
          lightType: "Ambient Light 3",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Ambient Light 4",
          lightType: "Ambient Light 4",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
      ],
      "Hemisphere Light": [
        {
          id: uuidv4(),
          type: "Hemisphere Light 1",
          lightType: "Hemisphere Light 1",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 2",
          lightType: "Hemisphere Light 2",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 3",
          lightType: "Hemisphere Light 3",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 4",
          lightType: "Hemisphere Light 4",
          intensity: 1,
          position: [0, 0, 0],
          angle: null,
          decay: null,
        },
      ],
      "Directional Light": [
        {
          id: uuidv4(),
          type: "Directional Light 1",
          lightType: "Directional Light 1",
          intensity: 1,
          position: [0, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Directional Light 2",
          lightType: "Directional Light 2",
          intensity: 1,
          position: [0, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Directional Light 3",
          lightType: "Directional Light 3",
          intensity: 1,
          position: [0, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Directional Light 4",
          lightType: "Directional Light 4",
          intensity: 1,
          position: [0, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
      ],
      "Point Light": [
        {
          id: uuidv4(),
          type: "Point Light 1",
          lightType: "Point Light 1",
          intensity: 1,
          position: [5, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Point Light 2",
          lightType: "Point Light 2",
          intensity: 1,
          position: [5, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Point Light 3",
          lightType: "Point Light 3",
          intensity: 1,
          position: [5, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Point Light 4",
          lightType: "Point Light 4",
          intensity: 1,
          position: [5, 5, 5],
          angle: null,
          decay: null,
          castShadow: true,
        },
      ],
      "Spot Light": [
        {
          id: uuidv4(),
          type: "Spot Light 1",
          lightType: "Spot Light 1",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Spot Light 2",
          lightType: "Spot Light 2",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Spot Light 3",
          lightType: "Spot Light 3",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
          castShadow: true,
        },
        {
          id: uuidv4(),
          type: "Spot Light 4",
          lightType: "Spot Light 4",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
          castShadow: true,
        },
      ],
    };

    const currentLights = lights.filter((light) =>
      light.type.startsWith(selectedLight)
    );

    if (currentLights.length < 4) {
      setLights([
        ...lights,
        defaultProperties[selectedLight][currentLights.length],
      ]);
    } else {
      console.warn("Maximum number of lights for this type reached");
    }
  };

  // Function to delete a light
  const deleteLight = (lightToDelete) => {
    setLights(lights.filter((light) => light.id !== lightToDelete.id));
  };

  // Function to update light properties
  const updateLight = (id, updatedProperties) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, ...updatedProperties } : light
      )
    );
  };

  // Function to reset lights when loading a new project
  const resetLights = (newLights) => {
    setLights(newLights);
  };

  return (
    <LightContext.Provider
      value={{
        selectedLight,
        setSelectedLight,
        lights,
        setLights,
        addLight,
        deleteLight,
        updateLight,
        resetLights, // Added to reset lights when loading a new project
      }}
    >
      {children}
    </LightContext.Provider>
  );
};
