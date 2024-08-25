import React, { useCallback, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Diffuse Map" },
    position: { x: 100, y: 100 },
  },
  {
    id: "2",
    type: "output",
    data: { label: "Reflection Map" },
    position: { x: 400, y: 100 },
  },
];

const initialEdges = [];

const ReactFlowComponent = ({ onNodeConnect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      onNodeConnect(params); // Trigger on connect
    },
    [setEdges, onNodeConnect]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineStyle={{ stroke: "#ddd", strokeWidth: 2 }}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowComponent;
