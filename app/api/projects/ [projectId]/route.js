import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { projectId } = params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { lightSettings: true },
    });

    if (!project) {
      return NextResponse.json(
        { status: "error", message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", project }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
