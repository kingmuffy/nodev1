import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // Extract the 'id' from the query parameters

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Fabric ID is required." },
        { status: 400 }
      );
    }

    const parameters = await prisma.fabricMap.findUnique({
      where: {
        id: id,
      },
    });

    if (!parameters) {
      return NextResponse.json(
        { status: "error", message: "Fabric not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", fabric: parameters });
  } catch (error) {
    console.error("Error fetching fabric parameters:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch fabric parameters." },
      { status: 500 }
    );
  }
}
