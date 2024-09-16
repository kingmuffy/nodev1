import React, { createContext, useState } from "react";

export const MapContext = createContext();

export const MapProvider = ({ children, initialMaterialParams }) => {
  const [connectedMaps, setConnectedMaps] = useState({});

  const [materialParams, setMaterialParams] = useState({
    bumpScale: initialMaterialParams?.bumpScale || 0.0,
    displacementScale: initialMaterialParams?.displacementScale || 0.0,
    emissiveIntensity: initialMaterialParams?.emissiveIntensity || 0.0,
    metalness: initialMaterialParams?.metalness || 0.0,
    roughness: initialMaterialParams?.roughness || 1.0,
    displacementBias: initialMaterialParams?.displacementBias || 0.0, // New parameter
    flatShading: initialMaterialParams?.flatShading || false, // New parameter
    aoMapIntensity: initialMaterialParams?.aoMapIntensity || 0.0, // New parameter
    clearcoat: initialMaterialParams?.clearcoat || 0.0, // New parameter
    sheen: initialMaterialParams?.sheen || 0.0,
    normalScale: {
      x: initialMaterialParams?.normalScaleX || 1.0, // Store normalScale as an object
      y: initialMaterialParams?.normalScaleY || 1.0,
    },
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
