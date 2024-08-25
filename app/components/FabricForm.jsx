import React from "react";

const mapNames = [
  "Diffuse",
  "Reflection",
  "Refraction",
  "Bump",
  "Reflection Glossiness",
  "Refraction Glossiness",
  "Displacement",
  "Environment",
  "Translucent",
  "IOR",
  "Fresnel IOR",
  "Opacity",
  "Anisotropy",
  "An. Rotation",
  "Fog Colour",
  "Self Illumination",
  "GTR Tail Fall Off",
  "Metalness",
  "Coat Amount",
  "Coat Glossiness",
  "Coat IOR",
  "Coat Colour",
  "Sheen Colour",
  "Sheen Glossiness",
  "Coat Bump",
  "Thin Film Thickness",
  "Translucent Amount",
  "Thin Film IOR",
];

const FabricForm = ({ selectedMap, setSelectedMap, addNode }) => (
  <div style={{ width: "250px", padding: "20px", backgroundColor: "#f4f4f4" }}>
    <select
      style={{ width: "100%", marginBottom: "10px" }}
      value={selectedMap}
      onChange={(e) => setSelectedMap(e.target.value)}
    >
      <option value="">Select a Map</option>
      {mapNames.map((map, index) => (
        <option key={index} value={map}>
          {map}
        </option>
      ))}
    </select>
    <button
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#40E0D0",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      onClick={addNode}
    >
      Create Node
    </button>
  </div>
);

export default FabricForm;
