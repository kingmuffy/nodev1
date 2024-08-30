import React, { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const LightContext = createContext();

export const LightProvider = ({ children }) => {
  const [selectedLight, setSelectedLight] = useState("Ambient Light");
  const [lights, setLights] = useState([]);

  const addLight = () => {
    const defaultProperties = {
      "Ambient Light": [
        { id: uuidv4(), type: "Ambient Light 1", intensity: 1 },
        { id: uuidv4(), type: "Ambient Light 2", intensity: 1 },
        { id: uuidv4(), type: "Ambient Light 3", intensity: 1 },
        { id: uuidv4(), type: "Ambient Light 4", intensity: 1 },
      ],
      "Hemisphere Light": [
        {
          id: uuidv4(),
          type: "Hemisphere Light 1",
          intensity: 1,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 2",
          intensity: 1,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 3",
          intensity: 1,
        },
        {
          id: uuidv4(),
          type: "Hemisphere Light 4",
          intensity: 1,
        },
      ],
      "Directional Light": [
        {
          id: uuidv4(),
          type: "Directional Light 1",
          intensity: 1,
          position: [0, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Directional Light 2",
          intensity: 1,
          position: [0, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Directional Light 3",
          intensity: 1,
          position: [0, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Directional Light 4",
          intensity: 1,
          position: [0, 5, 5],
        },
      ],
      "Point Light": [
        {
          id: uuidv4(),
          type: "Point Light 1",
          intensity: 1,
          position: [5, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Point Light 2",
          intensity: 1,
          position: [5, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Point Light 3",
          intensity: 1,
          position: [5, 5, 5],
        },
        {
          id: uuidv4(),
          type: "Point Light 4",
          intensity: 1,
          position: [5, 5, 5],
        },
      ],
      "Spot Light": [
        {
          id: uuidv4(),
          type: "Spot Light 1",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
        },
        {
          id: uuidv4(),
          type: "Spot Light 2",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
        },
        {
          id: uuidv4(),
          type: "Spot Light 3",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
        },
        {
          id: uuidv4(),
          type: "Spot Light 4",
          intensity: 1,
          position: [5, 5, 5],
          angle: Math.PI / 6,
          decay: 2,
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

  const deleteLight = (lightToDelete) => {
    setLights(lights.filter((light) => light.id !== lightToDelete.id));
  };

  return (
    <LightContext.Provider
      value={{
        selectedLight,
        setSelectedLight,
        lights,
        addLight,
        deleteLight,
        setLights,
      }}
    >
      {children}
    </LightContext.Provider>
  );
};
