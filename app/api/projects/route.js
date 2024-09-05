export const revalidate = 0;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        isDefault: true,
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
