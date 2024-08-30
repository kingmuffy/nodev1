import React from "react";
import LightComponent from "./LightComponent";

const LightNew = ({ lights, onUpdate }) => {
  return (
    <>
      {lights.length > 0 ? (
        lights.map((light, index) => (
          <LightComponent key={index} light={light} onUpdate={onUpdate} />
        ))
      ) : (
        <div>No lights added yet.</div>
      )}
    </>
  );
};

export default LightNew;
