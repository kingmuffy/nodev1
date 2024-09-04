export const revalidate = 0;

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, res) {
  try {
    const defaultProject = await prisma.project.findFirst({
      where: { isDefault: true },
      include: { lightSettings: true },
    });

    if (!defaultProject) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No default project found.",
        }),
        { status: 404 }
      );
    }

    if (!defaultProject) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Project not found.",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        project: defaultProject,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching project by ID:", error.stack);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch project.",
      }),
      { status: 500 }
    );
  }
}
