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
      {lights && lights.length > 0 ? (
        lights.map((light) => {
          if (!light || !light.id || !light.lightType) {
            console.error("Invalid light data:", light);
            return null;
          }

          const mappedLight = {
            ...light,
            type: light.lightType,
          };

          const filteredLight = Object.fromEntries(
            Object.entries(mappedLight).filter(([key, value]) => value !== null)
          );

          return (
            <LightComponent
              key={filteredLight.id}
              light={filteredLight}
              updateLightContext={updateLightContext}
            />
          );
        })
      ) : (
        <></>
      )}
    </>
  );
};

export default LightNew;
