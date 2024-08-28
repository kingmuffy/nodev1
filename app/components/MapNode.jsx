import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import ImageIcon from "@mui/icons-material/Image"; // Importing an icon from MUI Icons

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
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "5px 10px",
        fontFamily: "Barlow, sans-serif",
        width: "200px", // Adjusted width for better label-thumbnail spacing
        position: "relative",
      }}
    >
      <strong
        style={{
          flex: 1,
          textAlign: "left",
          fontSize: "14px",
          paddingRight: "10px",
          whiteSpace: "nowrap", // Prevent label from wrapping
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data.label || "Map Node"}
      </strong>
      <div
        style={{
          width: "50px", // Smaller thumbnail size for a sleek look
          height: "50px",
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
          <ImageIcon style={{ width: "50%", height: "50%", color: "#ccc" }} />
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
        style={{ background: "#40E0D0", borderRadius: "50%" }}
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
