import React, { createContext, useState } from "react";

// Create the context
export const MapContext = createContext();

// Create a provider component
export const MapProvider = ({ children }) => {
  const [connectedMaps, setConnectedMaps] = useState({});

  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
  };

  return (
    <MapContext.Provider value={{ connectedMaps, updateConnectedMaps }}>
      {children}
    </MapContext.Provider>
  );
};
