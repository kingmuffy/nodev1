import React from "react";
import { Handle, Position } from "reactflow";

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
          <span style={{ fontSize: "12px" }}>{map}</span>
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
