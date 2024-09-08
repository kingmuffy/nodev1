import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(request) {
  try {
    const { projectName, lightSettings } = await request.json();

    // Sanitize light settings
    const sanitizedSettings = lightSettings.map((light) => ({
      lightType: light.lightType,
      intensity: light.intensity,
      position: light.position ? JSON.parse(light.position) : [0, 0, 0],
      targetPosition: light.targetPosition
        ? JSON.parse(light.targetPosition)
        : [0, 0, 0],
      angle: light.angle ?? null,
      decay: light.decay ?? null,
      castShadow: light.castShadow ?? false,
    }));

    // Create a new project with the light settings
    const createdProject = await prisma.project.create({
      data: {
        name: projectName,
        lightSettings: {
          create: sanitizedSettings,
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        createdProject,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving light settings:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to save light settings.",
        details: error.message,
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
