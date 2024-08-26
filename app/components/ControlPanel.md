import React, { useCallback, useState } from "react";
import ReactFlow, {
addEdge,
useNodesState,
useEdgesState,
Controls,
Background,
ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import MapNode from "./MapNode";
import MainNode from "./MainNode";

const mapNames = [
"Diffuse",
"Reflection",
"Refraction",
"Bump",
// Add other map types as necessary
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

const ControlPanel = ({ onUpdateMaterialParams }) => {
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

const updateNodeData = useCallback(
(nodeId, file, thumbnail, label) => {
setNodes((nds) =>
nds.map((node) => {
if (node.id === nodeId) {
return { ...node, data: { ...node.data, file, thumbnail, label } };
}
return node;
})
);
onUpdateMaterialParams((prevParams) => ({
...prevParams,
[label]: file,
}));
},
[setNodes, onUpdateMaterialParams]
);

const onConnect = useCallback(
(params) => {
const sourceNode = nodes.find((node) => node.id === params.source);
const targetNode = nodes.find((node) => node.id === params.target);

      if (targetNode && sourceNode) {
        updateNodeData(
          sourceNode.id,
          sourceNode.data.file,
          sourceNode.data.thumbnail,
          targetNode.data.label
        );
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, nodes, updateNodeData]

);

const addNode = useCallback(() => {
const newNode = {
id: `node-${nodes.length + 1}`,
data: { label: "", thumbnail: null, updateNodeData }, // Empty label initially
position: { x: Math.random() _ 250 + 100, y: Math.random() _ 250 + 50 },
type: "mapNode",
};
setNodes((nds) => nds.concat(newNode));
}, [nodes, setNodes, updateNodeData]);

return (

<div className="flex h-full">
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

// Define the texture maps
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

// Define initial nodes
const initialNodes = [
{
id: "main-node",
type: "mainNode",
data: { label: "Mesh Physical Material", maps: mapNames },
position: { x: 400, y: 50 },
},
];

// Define initial edges
const initialEdges = [];

// Define node types
const nodeTypes = {
mainNode: MainNode,
mapNode: MapNode,
};

const ControlPanel = () => {
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const { updateConnectedMaps } = useContext(MapContext); // Use context

// Update node data with new file and label
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

// Handle connection between nodes
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

      updateConnectedMaps(
        mapLabel,
        nodes.find((n) => n.id === params.source)?.data.file
      );
    },
    [setEdges, nodes, setNodes, updateConnectedMaps]

);

// Handle double-click on edge to remove it
const onEdgeDoubleClick = useCallback(
(event, edge) => {
event.stopPropagation();
setEdges((eds) => eds.filter((e) => e.id !== edge.id));

      const targetNode = nodes.find((node) => node.id === edge.target);
      const mapLabel = targetNode?.data.maps[edge.targetHandle.split("-")[1]];

      updateConnectedMaps(mapLabel, null); // Remove the associated map
    },
    [setEdges, nodes, updateConnectedMaps]

);

// Handle right-click on node to delete it
const onNodeContextMenu = useCallback(
(event, node) => {
event.preventDefault();
setNodes((nds) => nds.filter((n) => n.id !== node.id));
setEdges((eds) =>
eds.filter((e) => e.source !== node.id && e.target !== node.id)
);

      // Clear the maps associated with this node
      if (node.data.label) {
        node.data.label.forEach((label) => {
          updateConnectedMaps(label, null);
        });
      }
    },
    [setNodes, setEdges, updateConnectedMaps]

);

// Add a new node
const addNode = useCallback(() => {
const newNode = {
id: `node-${nodes.length + 1}`,
data: { label: [], thumbnail: null, updateNodeData },
position: { x: Math.random() _ 250 + 100, y: Math.random() _ 250 + 50 },
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
fitView >
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
