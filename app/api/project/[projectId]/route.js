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

    return NextResponse.json({ status: "success", project });
  } catch (error) {
    console.error("Error loading project:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to load project" },
      { status: 500 }
    );
  }
}
export const revalidate = 0;
