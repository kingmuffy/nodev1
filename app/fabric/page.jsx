"use client";
import Split from "react-split";
import FabricPreview from "../components/FabricPreview";
import ControlPanel from "../components/ControlPanel";
import { MapProvider } from "../MapContext";
import { LightProvider } from "../LightContext";

export default function Page() {
  return (
    <LightProvider>
      <MapProvider>
        <Split
          className="flex h-screen"
          sizes={[50, 50]} // Ensure the two panels are equal by default
          minSize={200} // The minimum size for each panel
          direction="horizontal" // Horizontally split the screen
          gutterSize={4} // The size of the gutter between the panels
        >
          <div className="flex justify-center items-center bg-gray-900">
            {/* FabricPreview panel */}
            <FabricPreview />
          </div>
          <div className="flex flex-col h-full">
            {/* ControlPanel panel */}
            <ControlPanel />
          </div>
        </Split>
      </MapProvider>
    </LightProvider>
  );
}
