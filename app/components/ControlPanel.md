import React, { useCallback, useState, useContext } from "react";
import ReactFlow, {
addEdge,
useNodesState,
useEdgesState,
Controls,
Background,
ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import MainNode from "./MainNode";
import MapNode from "./MapNode";
import { MapContext } from "../MapContext";
import {
Snackbar,
Alert,
Button,
TextField,
CircularProgress,
} from "@mui/material";
import axios from "axios";

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

const initialNodes = [
{
id: "main-node",
type: "mainNode",
data: { label: "Mesh Physical Material", maps: mapNames },
position: { x: 400, y: 50 },
},
];

const initialEdges = [];

const nodeTypes = {
mainNode: MainNode,
mapNode: MapNode,
};

const edgeOptions = {
style: { strokeWidth: 4 },
};

const ControlPanel = () => {
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const { connectedMaps, materialParams, updateConnectedMaps } =
useContext(MapContext);

const [fabricName, setFabricName] = useState("");
const [fabricColor, setFabricColor] = useState("");
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [confirmDelete, setConfirmDelete] = useState(null);
const [loading, setLoading] = useState(false);

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
position: { x: Math.random() _ 250 + 100, y: Math.random() _ 250 + 50 },
type: "mapNode",
};
setNodes((nds) => nds.concat(newNode));
}, [nodes, setNodes, updateNodeData]);

const handleSave = async () => {
setLoading(true);
try {
const formData = new FormData();

      formData.append("fabricName", fabricName);
      formData.append("fabricColor", fabricColor);

      for (const [mapType, file] of Object.entries(connectedMaps)) {
        if (file) {
          const formKey = `${mapType.toLowerCase()}MapUrl`;
          formData.append(formKey, file);
        }
      }

      for (const [paramName, value] of Object.entries(materialParams)) {
        formData.append(paramName, value);
      }

      const response = await axios.post("/api/fabric", formData);

      if (response.data.status === "success") {
        setSnackbarMessage("Fabric data saved successfully!");
      } else {
        setSnackbarMessage("Failed to save fabric data.");
      }
    } catch (error) {
      console.error("Error saving fabric data:", error);
      setSnackbarMessage("Error saving fabric data.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }

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
defaultEdgeOptions={edgeOptions} // Use defaultEdgeOptions for edge styles >
<Controls />
<Background />
</ReactFlow>
</div>
{/_ Reposition the control panel to the bottom right _/}
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
className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
sx={{ marginRight: "7px" }} >
CREATE NODE
</Button>
<Button
            onClick={handleSave}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
{loading ? <CircularProgress size={20} color="inherit" /> : "SAVE"}
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

export default ControlPanel;
