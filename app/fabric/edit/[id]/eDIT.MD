"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import ReactFlow, {
addEdge,
useNodesState,
useEdgesState,
Controls,
Background,
ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import MainNode from "../../../components/MainNode";
import MapNodeEdit from "../../../components/MapNodeEdit";
import { MapContext } from "../../../MapContext";
import { Snackbar, Alert, Button, TextField } from "@mui/material";

const mapNames = [
"Diffuse",
"Reflection",
"Refraction",
"Bump",
"Normal",
"Displacement",
"Specular",
"Emissive",
"Opacity",
"AO",
"Metalness",
"Roughness",
];

const nodeTypes = {
mainNode: MainNode,
mapNodeEdit: MapNodeEdit,
};

const EditFabric = ({ parameters }) => {
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
const {
connectedMaps,
materialParams,
updateConnectedMaps,
updateMaterialParams,
} = useContext(MapContext);

const [fabricName, setFabricName] = useState(parameters.fabricName || "");
const [fabricColor, setFabricColor] = useState(parameters.fabricColor || "");
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [confirmDelete, setConfirmDelete] = useState(null);
const [isLoaded, setIsLoaded] = useState(false);

const updateNodeData = useCallback(
(nodeId, file, thumbnail, label) => {
setNodes((nds) =>
nds.map((node) => {
if (node.id === nodeId) {
const updatedLabelArray = node.data.label.includes(label)
? node.data.label
: [...node.data.label, label];

            return {
              ...node,
              data: { ...node.data, file, thumbnail, label: updatedLabelArray },
            };
          }
          return node;
        })
      );
      updateConnectedMaps(label, file);
    },
    [setNodes, updateConnectedMaps]

);

useEffect(() => {
if (parameters && !isLoaded) {
Object.keys(materialParams).forEach((param) => {
if (parameters[param] !== undefined) {
updateMaterialParams(param, parameters[param]);
}
});

      const initialNodes = [
        {
          id: "main-node",
          type: "mainNode",
          data: { label: "Mesh Physical Material", maps: mapNames },
          position: { x: 400, y: 50 },
        },
      ];

      const newEdges = [];
      const nodeSpacingY = 150; // Vertical space between nodes
      let yOffset = 150; // Initial vertical offset for the first node

      Object.entries(parameters).forEach(([key, value], index) => {
        if (key.endsWith("MapUrl") && value) {
          const mapType =
            key.replace("MapUrl", "").charAt(0).toUpperCase() +
            key.replace("MapUrl", "").slice(1);

          updateConnectedMaps(mapType, value);

          const newNode = {
            id: `${mapType}-node`,
            type: "mapNodeEdit",
            position: {
              x: 100, // Fixed x-position for vertical stacking
              y: yOffset + index * nodeSpacingY,
            },

            data: {
              label: mapType,
              file: value,
              thumbnail: value,
              updateNodeData,
            },
          };

          initialNodes.push(newNode);

          const targetHandle = mapNames.indexOf(mapType).toString();
          newEdges.push({
            id: `${mapType}-edge`,
            source: `${mapType}-node`,
            target: "main-node",
            targetHandle: `handle-${targetHandle}`,
          });
        }
      });

      setNodes(initialNodes);
      setEdges(newEdges);
      setIsLoaded(true);
    }

}, [
parameters,
materialParams,
updateMaterialParams,
updateConnectedMaps,
isLoaded,
setNodes,
setEdges,
connectedMaps,
updateNodeData,
]);

const onConnect = useCallback(
(params) => {
const sourceNode = nodes.find((node) => node.id === params.source);

      if (!sourceNode?.data.file) {
        setSnackbarMessage("Upload a map before connecting nodes.");
        setSnackbarOpen(true);
        return;
      }

      const targetNode = nodes.find((node) => node.id === params.target);
      const mapLabel = targetNode?.data.maps[params.targetHandle.split("-")[1]];

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source) {
            const currentLabel = node.data.label || [];
            const newLabel = currentLabel.includes(mapLabel)
              ? currentLabel
              : [...currentLabel, mapLabel];
            return {
              ...node,
              data: { ...node.data, label: newLabel },
            };
          }
          return node;
        })
      );

      if (!sourceNode.data.label.includes(mapLabel)) {
        updateConnectedMaps(mapLabel, sourceNode.data.file);
      }
    },
    [setEdges, nodes, setNodes, updateConnectedMaps]

);

const onEdgeDoubleClick = useCallback(
(event, edge) => {
event.stopPropagation();
setEdges((eds) => eds.filter((e) => e.id !== edge.id));

      const targetNode = nodes.find((node) => node.id === edge.target);
      const mapLabel = targetNode?.data.maps[edge.targetHandle.split("-")[1]];

      updateConnectedMaps(mapLabel, null);

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === edge.source) {
            return {
              ...node,
              data: {
                ...node.data,
                label: node.data.label.filter((lbl) => lbl !== mapLabel),
              },
            };
          }
          return node;
        })
      );

      setSnackbarMessage("Node disconnected");
      setSnackbarOpen(true);
    },
    [setEdges, nodes, updateConnectedMaps]

);

const handleDeleteNode = useCallback(
(node) => {
const connectedEdges = edges.filter(
(edge) => edge.source === node.id || edge.target === node.id
);

      connectedEdges.forEach((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        const mapLabel = targetNode?.data.maps[edge.targetHandle.split("-")[1]];
        updateConnectedMaps(mapLabel, null);
      });

      setEdges((eds) =>
        eds.filter((edge) => edge.source !== node.id && edge.target !== node.id)
      );

      setNodes((nds) => nds.filter((n) => n.id !== node.id));

      setSnackbarMessage("Node deleted");
      setSnackbarOpen(true);
    },
    [setNodes, setEdges, nodes, edges, updateConnectedMaps]

);

const onNodeContextMenu = useCallback((event, node) => {
event.preventDefault();
setConfirmDelete(node);
}, []);

const handleConfirmDelete = useCallback(() => {
if (confirmDelete) {
handleDeleteNode(confirmDelete);
setConfirmDelete(null);
}
}, [confirmDelete, handleDeleteNode]);

const handleSnackbarClose = useCallback(() => {
setSnackbarOpen(false);
}, []);

const addNode = useCallback(() => {
const newNode = {
id: `node-${nodes.length + 1}`,
data: { label: [], thumbnail: null, updateNodeData },
position: { x: 100, y: nodes.length \* 50 + 10 },
type: "mapNodeEdit",
};
setNodes((nds) => nds.concat(newNode));
}, [nodes, setNodes, updateNodeData]);

const handleSave = () => {
setSnackbarMessage("Save editing currently disabled");
setSnackbarOpen(true);
};

return (
<div className="flex h-full" onContextMenu={(e) => e.preventDefault()}>
<ReactFlowProvider>
<div className="flex-auto bg-gray-800 relative">
<ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            fitView
          >
<Controls />
<Background />
</ReactFlow>
</div>
<div className="fixed bottom-0 right-0 w-64 p-4 bg-gray-900 text-white z-50">
<TextField
label="Fabric Name"
variant="filled"
value={fabricName}
onChange={(e) => setFabricName(e.target.value)}
fullWidth
sx={{
              marginBottom: "1rem",
              backgroundColor: "white",
              borderRadius: "4px",
            }}
/>
<TextField
label="Fabric Color"
variant="filled"
value={fabricColor}
onChange={(e) => setFabricColor(e.target.value)}
fullWidth
sx={{
              marginBottom: "1rem",
              backgroundColor: "white",
              borderRadius: "4px",
            }}
/>
<Button
onClick={addNode}
className="p-2 bg-blue-500 rounded hover:bg-blue-700"
sx={{ marginBottom: "0.5rem" }} >
Create Node
</Button>
<Button
            onClick={handleSave}
            className="p-2 bg-green-500 rounded hover:bg-green-700"
          >
Save
</Button>
</div>
</ReactFlowProvider>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this node?</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
              <Button variant="outlined" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

);
};

export default EditFabric;
