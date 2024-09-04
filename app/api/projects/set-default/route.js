import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { projectId } = await req.json();

    await prisma.project.updateMany({
      data: { isDefault: false },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { isDefault: true },
    });

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating default project:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Failed to update project." }),
      {
        status: 500,
      }
    );
  }
}
