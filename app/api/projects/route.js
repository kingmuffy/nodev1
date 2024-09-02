import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
    return new Response(JSON.stringify({ status: "success", projects }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Failed to fetch projects." }),
      {
        status: 500,
      }
    );
  }
}
