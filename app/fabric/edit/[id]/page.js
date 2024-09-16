"use client";
import React, { useEffect, useState } from "react";
import Split from "react-split";
import FabricEditPreview from "../../../components/FabricEditPreview";
import EditFabric from "./EditFabric";
import { MapProvider } from "../../../MapContext";
import { useRouter } from "next/navigation";
import axios from "axios";

const EditPage = ({ params }) => {
  const [parameters, setParameters] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const { id } = params;
        const response = await axios.get(`/api/getparameters?id=${id}`);
        if (response.data.status === "success") {
          setParameters(response.data.fabric);
        } else {
          console.error("Failed to fetch fabric parameters");
        }
      } catch (error) {
        console.error("Error fetching fabric parameters:", error);
      }
    };

    fetchParameters();
  }, [params]);

  if (!parameters) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <MapProvider initialMaterialParams={parameters}>
      <Split
        className="flex h-screen"
        sizes={[50, 50]}
        minSize={200}
        direction="horizontal"
      >
        <div className="flex justify-center items-center bg-gray-900">
          <FabricEditPreview parameters={parameters} />
        </div>
        <div className="flex flex-col h-full">
          <EditFabric parameters={parameters} />
        </div>
      </Split>
    </MapProvider>
  );
};

export default EditPage;
