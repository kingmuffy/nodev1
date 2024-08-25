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
