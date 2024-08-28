import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const MapNodeEdit = ({ id, data }) => {
  const fileInputRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(
    data.thumbnail || "/placeholder-icon.png"
  );
  const [label, setLabel] = useState(data.label || "Map Node");

  useEffect(() => {
    if (data.thumbnail) {
      setThumbnail(data.thumbnail);
    }
    if (data.label) {
      setLabel(data.label);
    }
  }, [data.thumbnail, data.label]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result);
        data.updateNodeData(id, file, reader.result, data.label);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
        backgroundColor: "#2D2D2D",
        border: "1px solid #444",
        borderRadius: "12px",
        width: "200px",
        fontFamily: "Barlow, sans-serif",
        color: "#FFFFFF",
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          textAlign: "left",
          fontSize: "14px",
          paddingLeft: "8px",
        }}
      >
        <strong>{label}</strong>
      </div>
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#555",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleImageClick}
      >
        <img
          src={thumbnail}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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
        style={{ background: "#40E0D0", borderRadius: "50%" }}
      />
    </div>
  );
};

MapNodeEdit.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    updateNodeData: PropTypes.func.isRequired,
    thumbnail: PropTypes.string,
  }).isRequired,
};

export default MapNodeEdit;
