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
import { MapContext } from "../MapContext"; // Import the context
import { Snackbar, Alert, Button } from "@mui/material"; // Import MUI components

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

const ControlPanel = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { updateConnectedMaps } = useContext(MapContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const updateNodeData = useCallback(
    (nodeId, file, thumbnail, label) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedLabelArray = node.data.label.includes(label)
              ? node.data.label // If the label exists, keep the array unchanged
              : [...node.data.label, label]; // Otherwise, add the label

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

      // Prevent connection if no file is uploaded to the source node
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

      // Update connected maps only if the label hasn't already been added by upload
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

      updateConnectedMaps(mapLabel, null); // Remove the associated map

      // Update the node label by removing the disconnected map
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
      // Find and remove edges connected to this node
      const connectedEdges = edges.filter(
        (edge) => edge.source === node.id || edge.target === node.id
      );

      connectedEdges.forEach((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        const mapLabel = targetNode?.data.maps[edge.targetHandle.split("-")[1]];
        updateConnectedMaps(mapLabel, null); // Remove the associated map
      });

      setEdges((eds) =>
        eds.filter((edge) => edge.source !== node.id && edge.target !== node.id)
      );

      // Remove the node itself
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
      position: { x: Math.random() * 250 + 100, y: Math.random() * 250 + 50 },
      type: "mapNode",
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, updateNodeData]);

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
            onEdgeDoubleClick={onEdgeDoubleClick} // Handle edge double-click to remove
            onNodeContextMenu={onNodeContextMenu} // Handle right-click to delete node
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <div className="fixed top-0 right-0 w-64 p-4 bg-gray-900 text-white z-50">
          <button
            onClick={addNode}
            className="p-2 bg-blue-500 rounded hover:bg-blue-700"
          >
            Create Node
          </button>
        </div>
      </ReactFlowProvider>

      {/* Snackbar for notifications */}
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

      {/* Confirmation dialog for deleting a node */}
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
