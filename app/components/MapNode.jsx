import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const MapNode = ({ id, data }) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        data.updateNodeData(id, file, reader.result, data.label);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        width: "150px",
        fontFamily: "Barlow, sans-serif",
        textAlign: "center",
        position: "relative",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "5px",
          fontSize: "14px",
        }}
      >
        {data.label || "Map Node"}
      </strong>
      <div
        style={{
          width: "80px",
          height: "80px",
          margin: "0 auto",
          marginBottom: "5px",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleImageClick}
      >
        {data.thumbnail ? (
          <img
            src={data.thumbnail}
            alt={data.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <img
            src="/placeholder-icon.png"
            alt="Placeholder"
            style={{ width: "50%", height: "50%" }}
          />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#40E0D0", borderRadius: "0%" }}
      />
    </div>
  );
};

MapNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    updateNodeData: PropTypes.func.isRequired,
    thumbnail: PropTypes.string,
  }).isRequired,
};

export default MapNode;
