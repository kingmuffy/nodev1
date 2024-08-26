// MapContext.js
import React, { createContext, useState } from "react";

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [connectedMaps, setConnectedMaps] = useState({});
  const [materialParams, setMaterialParams] = useState({
    bumpScale: 0.3,
    displacementScale: 0.1,
    emissiveIntensity: 1.0,
    metalness: 0.5,
    roughness: 0.5,
  });

  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
  };

  const updateMaterialParams = (paramName, value) => {
    setMaterialParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  return (
    <MapContext.Provider
      value={{
        connectedMaps,
        updateConnectedMaps,
        materialParams,
        updateMaterialParams,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
