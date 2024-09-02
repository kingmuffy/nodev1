import React, { useCallback, useState, useContext, useEffect } from "react";
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
import { LightContext } from "../LightContext";
import {
  Snackbar,
  Alert,
  Button,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  const {
    lights,
    addLight,
    deleteLight,
    setLights,
    selectedLight,
    setSelectedLight,
  } = useContext(LightContext);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [loadProjectDialogOpen, setLoadProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]); // Store list of saved projects

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      position: { x: Math.random() * 250 + 100, y: Math.random() * 250 + 50 },
      type: "mapNode",
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, updateNodeData]);

  const openProjectDialog = () => {
    setProjectDialogOpen(true);
  };

  const closeProjectDialog = () => {
    setProjectDialogOpen(false);
  };

  const openLoadProjectDialog = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/projects");
      if (response.data.status === "success") {
        setProjects(response.data.projects);
        setLoadProjectDialogOpen(true);
      } else {
        setSnackbarMessage("Failed to load projects.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setSnackbarMessage("Error loading projects.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeLoadProjectDialog = () => {
    setLoadProjectDialogOpen(false);
  };
  const loadProject = async (projectId) => {
    try {
      setLoading(true);

      // Make the API call to fetch the project by ID
      const response = await axios.get(`/api/project/${projectId}`);

      if (response.data.status === "success") {
        // Clear existing lights
        setLights([]);

        // Handle potential null values in the loaded light settings
        const loadedLights = response.data.project.lightSettings.map(
          (light) => ({
            ...light,
            angle: light.angle ?? 0, // Default to 0 if null
            decay: light.decay ?? 1, // Default to 1 if null
          })
        );

        // Set the new lights from the project
        setLights(loadedLights);
        setSnackbarMessage("Light settings loaded successfully!");
      } else {
        setSnackbarMessage("Failed to load light settings.");
      }
    } catch (error) {
      console.error("Error loading light settings:", error);
      setSnackbarMessage("Error loading light settings.");
    } finally {
      setLoading(false);
      closeLoadProjectDialog(); // Close the dialog after loading
    }
  };

  const saveLightSettings = async () => {
    setLoading(true);
    try {
      const lightSettings = lights.map((light) => {
        const baseSettings = {
          lightType: light.type,
          intensity: light.intensity,
          castShadow: light.castShadow ?? true,
        };

        if (light.position) {
          baseSettings.position = JSON.stringify(light.position);
        }

        if (light.angle !== undefined) {
          baseSettings.angle = light.angle;
        }

        if (light.decay !== undefined) {
          baseSettings.decay = light.decay;
        }

        return baseSettings;
      });

      const response = await axios.post("/api/lights", {
        projectName,
        lightSettings,
      });

      if (response.data.status === "success") {
        setSnackbarMessage("Light settings saved successfully!");
      } else {
        setSnackbarMessage("Failed to save light settings.");
      }
    } catch (error) {
      console.error("Error saving light settings:", error);
      setSnackbarMessage("Error saving light settings.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
      closeProjectDialog(); // Close the project name dialog
    }
  };

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
            defaultEdgeOptions={edgeOptions}
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
          <select
            onChange={(e) => setSelectedLight(e.target.value)}
            value={selectedLight}
            style={{ marginBottom: "10px", width: "100%", color: "black" }}
          >
            <option value="Ambient Light">Ambient Light</option>
            <option value="Hemisphere Light">Hemisphere Light</option>
            <option value="Directional Light">Directional Light</option>
            <option value="Point Light">Point Light</option>
            <option value="Spot Light">Spot Light</option>
          </select>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={addLight}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              sx={{ marginBottom: "10px", marginRight: "8px" }}
            >
              Add Light
            </Button>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              sx={{ color: "white", marginBottom: "10px" }}
            >
              <MoreVertIcon />
            </IconButton>
          </div>
          {lights.length > 0 ? (
            <div>
              <h4>Lights:</h4>
              {lights.map((light, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <span>{light.type}</span>
                  <Button
                    onClick={() => deleteLight(light)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-700"
                    sx={{ marginLeft: "10px" }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No lights added yet.</p>
          )}
          <Button
            onClick={addNode}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            sx={{ marginRight: "7px" }}
          >
            CREATE NODE
          </Button>
          <Button
            onClick={handleSave}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "SAVE"}
          </Button>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={openProjectDialog}>Save Light Settings</MenuItem>
            <MenuItem onClick={openLoadProjectDialog}>
              Load Light Settings
            </MenuItem>
          </Menu>
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

      <Dialog open={projectDialogOpen} onClose={closeProjectDialog}>
        <DialogTitle>Enter Light Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProjectDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={saveLightSettings}
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadProjectDialogOpen} onClose={closeLoadProjectDialog}>
        <DialogTitle>Select a Project to Load</DialogTitle>
        <DialogContent>
          <List>
            {projects.map((project) => (
              <ListItem
                button
                onClick={() => loadProject(project.id)}
                key={project.id}
              >
                <ListItemText primary={project.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLoadProjectDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

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
