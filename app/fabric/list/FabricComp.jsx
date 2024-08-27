"use client";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

const FabricComp = ({ fabric }) => {
  const router = useRouter();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("fabricName");

  // Ensure fabric is an array
  const rows = useMemo(() => {
    if (!Array.isArray(fabric)) {
      return []; // Return an empty array if fabric is not an array
    }

    return fabric.map((item) => ({
      id: item.id,
      fabricName: item.fabricName || "N/A",
      //   fabricType: item.fabricType || "N/A",
      fabricColor: item.fabricColor || "N/A",
      createdAt: item.createdAt
        ? format(new Date(item.createdAt), "MM/dd/yyyy")
        : "N/A",
    }));
  }, [fabric]);

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    {
      field: "fabricName",
      headerName: "Fabric Name",
      width: 150,
      sortable: true,
      onHeaderClick: () => handleRequestSort("fabricName"),
    },
    {
      field: "fabricColor",
      headerName: "Fabric Color",
      width: 150,
      sortable: true,
      onHeaderClick: () => handleRequestSort("fabricColor"),
    },

    {
      field: "createdAt",
      headerName: "Created At",
      width: 130,
    },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRowClick = (params) => {
    router.push(`/fabric/edit/${params.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Fabric List
        </h1>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 20]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
};

export default FabricComp;
