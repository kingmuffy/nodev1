import React from "react";
import fabrics from "../../../act/getfabrics";
import FabricComp from "./FabricComp";

const Page = async () => {
  const fabric = await fabrics();

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Fabric Collection
        </h1>
        <p className="text-gray-600 mb-8">
          Explore the collection of fabrics with detailed information about each
          one. You can sort and filter the fabrics based on various attributes.
        </p>
        <div className="bg-white shadow rounded-lg p-6">
          <FabricComp fabric={fabric} />
        </div>
      </div>
    </div>
  );
};

export default Page;
