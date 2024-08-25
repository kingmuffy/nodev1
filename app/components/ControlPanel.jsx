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

// Expand the mapNames array to include all necessary texture maps
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
  const { updateConnectedMaps } = useContext(MapContext); // Use context

  const updateNodeData = useCallback(
    (nodeId, file, thumbnail, label) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedLabelArray = Array.isArray(node.data.label)
              ? [...node.data.label, label]
              : [label];
            return {
              ...node,
              data: { ...node.data, file, thumbnail, label: updatedLabelArray },
            };
          }
          return node;
        })
      );
      updateConnectedMaps(label, file); // Update context
    },
    [setNodes, updateConnectedMaps]
  );

  const onConnect = useCallback(
    (params) => {
      const targetNode = nodes.find((node) => node.id === params.target);
      const mapLabel = targetNode?.data.maps[params.targetHandle.split("-")[1]];

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source) {
            const currentLabel = node.data.label || [];
            const newLabel = [...currentLabel, mapLabel];
            return {
              ...node,
              data: { ...node.data, label: newLabel },
            };
          }
          return node;
        })
      );

      // Update connected maps context
      updateConnectedMaps(
        mapLabel,
        nodes.find((n) => n.id === params.source)?.data.file
      );
    },
    [setEdges, nodes, setNodes, updateConnectedMaps]
  );

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
    </div>
  );
};

export default ControlPanel;
