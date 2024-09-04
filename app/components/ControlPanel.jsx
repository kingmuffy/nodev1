import React, { useCallback, useState, useContext, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { Checkbox, ListItemIcon } from "@mui/material";

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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
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
  const {
    lights,
    addLight,
    deleteLight,
    setLights,
    selectedLight,
    setSelectedLight,
    resetLights,
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
  const loadDefaultLightSettings = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/projects/default");

      if (response.data.status === "success") {
        resetLights();

        const loadedLights = response.data.project.lightSettings.map(
          (light) => ({
            ...light,
            id: uuidv4(),
          })
        );

        setLights(loadedLights);
        setSnackbarMessage("Default light settings loaded successfully!");
      } else {
        setSnackbarMessage("Failed to load default light settings.");
      }
    } catch (error) {
      console.error("Error loading default light settings:", error);
      setSnackbarMessage("Error loading default light settings.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };
  useEffect(() => {
    loadDefaultLightSettings();
  }, []);
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

      const response = await axios.get(`/api/project/${projectId}`);

      if (response.data.status === "success") {
        setLights([]);
        resetLights();

        const loadedLights = response.data.project.lightSettings.map(
          (light) => ({
            ...light,
            angle: light.angle ?? 0,
            decay: light.decay ?? 1,
            id: uuidv4(),
          })
        );

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
      closeLoadProjectDialog();
    }
  };

  // Function to set a project as default
  const setDefaultProject = async (projectId) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/projects/set-default`, {
        projectId,
      });

      if (response.data.status === "success") {
        setSnackbarMessage("Project set as default successfully!");
      } else {
        setSnackbarMessage("Failed to set project as default.");
      }
    } catch (error) {
      console.error("Error setting default project:", error);
      setSnackbarMessage("Error setting default project.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (projectId) => {
    setDefaultProject(projectId);
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
      closeProjectDialog();
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
            <Button
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              sx={{ color: "white", marginBottom: "10px" }}
              variant="contained"
            >
              Light Options
            </Button>
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
      <Dialog
        open={loadProjectDialogOpen}
        onClose={closeLoadProjectDialog}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800 px-6 py-4 border-b border-gray-200">
            Select a Project to Load
          </DialogTitle>
          <DialogContent className="px-6 py-4">
            <List className="space-y-2">
              {projects.map((project) => (
                <ListItem
                  component="button"
                  onClick={() => loadProject(project.id)}
                  key={project.id}
                  className="px-4 py-2 rounded-lg hover:bg-blue-100 focus:bg-blue-100 focus:outline-none transition-colors"
                >
                  <ListItemText
                    primary={
                      <>
                        <span className="font-medium">{project.name}</span>
                        <span className="text-gray-500 text-sm">
                          {" "}
                          — {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    }
                    secondary={
                      <div className="flex items-center">
                        <ListItemIcon>
                          <Checkbox
                            checked={project.isDefault}
                            onChange={() => handleCheckboxChange(project.id)}
                            color="primary"
                            inputProps={{
                              "aria-label": "Default status checkbox",
                            }}
                          />
                        </ListItemIcon>
                        <span
                          className={`text-sm ml-2 ${
                            project.isDefault
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {project.isDefault ? "Default" : "Not Default"}
                        </span>
                      </div>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions className="px-6 py-4 border-t border-gray-200">
            <Button
              onClick={closeLoadProjectDialog}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700 transition-colors"
            >
              Cancel
            </Button>
          </DialogActions>
        </div>
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
