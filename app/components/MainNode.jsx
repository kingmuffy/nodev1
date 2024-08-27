import React from "react";
import { Handle, Position } from "reactflow";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const mapInfo = {
  Diffuse: "Diffuse maps define the base color of the material.",
  Reflection: "Reflection maps control how reflective the surface is.",
  Refraction: "Refraction maps define how light bends through the material.",
  Bump: "Bump maps add surface detail without changing geometry.",
  Normal: "Normal maps add more detailed surface orientation.",
  Displacement: "Displacement maps actually move the surface geometry.",
  Specular: "Specular maps define the shininess and highlight size.",
  Emissive: "Emissive maps make the material appear self-lit.",
  Opacity: "Opacity maps control transparency.",
  AO: "Ambient Occlusion maps add shading based on environment occlusion.",
  Metalness: "Metalness maps control how metallic the surface looks.",
  Roughness: "Roughness maps define how rough or smooth the surface is.",
};

const MainNode = ({ data }) => (
  <div
    style={{
      padding: "15px",
      backgroundColor: "#f9f9f9",
      border: "1px solid #ddd",
      borderRadius: "8px",
      width: "300px",
      fontFamily: "Barlow, sans-serif",
      position: "relative",
    }}
  >
    <strong
      style={{
        display: "block",
        marginBottom: "15px",
        fontSize: "16px",
        textAlign: "center",
      }}
    >
      {data.label}
    </strong>
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {data.maps.map((map, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px",
            position: "relative",
          }}
        >
          <span
            style={{ fontSize: "12px", display: "flex", alignItems: "center" }}
          >
            {map}
            <Tooltip title={mapInfo[map]} arrow>
              <InfoOutlinedIcon
                style={{
                  marginLeft: "5px",
                  fontSize: "12px", // Reduced the font size
                  color: "#2196f3",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id={`handle-${index}`}
            style={{
              background: "#40E0D0",
              width: "10px",
              height: "10px",
              borderRadius: "0%",
              position: "absolute",
              left: "-15px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

export default MainNode;
