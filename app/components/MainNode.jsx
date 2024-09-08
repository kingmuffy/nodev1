import React from "react";
import { Handle, Position } from "reactflow";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const mapInfo = {
  Diffuse: "Defines the base color of the material.",
  Reflection: "Controls the reflectivity of the surface.",
  Refraction: "Determines how light bends through the material.",
  Bump: "Adds surface detail without changing geometry.",
  Normal: "Enhances surface detail using normal vectors.",
  Displacement: "Modifies the surface geometry for added detail.",
  anisotropyMap: "Determines the shininess and highlight size.",
  Emissive: "Makes the material appear self-illuminated.",
  Opacity: "Controls the transparency of the material.",
  AO: "Adds shading based on occlusion by surrounding objects.",
  Metalness: "Gives the surface a metallic appearance.",
  Roughness: "Determines the smoothness of the surface.",
};

const MainNode = ({ data }) => (
  <div
    style={{
      padding: "12px 15px",
      backgroundColor: "#f5f5f5",
      border: "1px solid #ddd",
      borderRadius: "12px",
      width: "280px",
      color: "#333",
      fontFamily: "Barlow, sans-serif",
      position: "relative",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
    }}
  >
    <strong
      style={{
        display: "block",
        marginBottom: "12px",
        fontSize: "15px",
        textAlign: "center",
        color: "#555",
      }}
    >
      {data.label}
    </strong>
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {data.maps.map((map, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom:
              index !== data.maps.length - 1 ? "1px solid #e0e0e0" : "none", // Subtle divider
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              color: "#333",
            }}
          >
            {map}
            <Tooltip title={mapInfo[map]} arrow>
              <InfoOutlinedIcon
                style={{
                  marginLeft: "5px",
                  fontSize: "14px",
                  color: "#888",
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
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              position: "absolute",
              left: "-12px",
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
