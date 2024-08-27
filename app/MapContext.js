import React, { createContext, useState } from "react";

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [connectedMaps, setConnectedMaps] = useState({});
  const [materialParams, setMaterialParams] = useState({
    bumpScale: 0.0,
    displacementScale: 0.0,
    emissiveIntensity: 0.0,
    metalness: 0.0,
    roughness: 1.0,
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
