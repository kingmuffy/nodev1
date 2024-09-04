import React from "react";
import LightComponent from "./LightComponent";

const LightNew = ({ lights = [], onUpdate }) => {
  const updateLightContext = (lightId, updatedProperties) => {
    if (onUpdate) {
      onUpdate(lightId, updatedProperties);
    }
  };

  return (
    <>
      {lights.map((light) => (
        <LightComponent
          key={light.id}
          light={{ ...light, type: light.lightType }}
          updateLightContext={updateLightContext}
        />
      ))}
    </>
  );
};

export default LightNew;
