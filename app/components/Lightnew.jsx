import React from "react";
import LightComponent from "./LightComponent";

const LightNew = ({ lights, onUpdate }) => {
  return (
    <>
      {lights.map((light) => (
        <LightComponent key={light.id} light={light} onUpdate={onUpdate} />
      ))}
    </>
  );
};

export default LightNew;
