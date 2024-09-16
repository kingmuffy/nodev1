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
          sizes={[50, 50]}
          minSize={200}
          direction="horizontal"
          gutterSize={8}
        >
          <div className="flex justify-center items-center bg-gray-900">
            <FabricPreview />
          </div>
          <div className="flex flex-col h-full">
            <ControlPanel />
          </div>
        </Split>
      </MapProvider>
    </LightProvider>
  );
}
