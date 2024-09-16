"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getFolderWithFbxas(folderId) {
  try {
    const fabrics = await prisma.fabricMap.findMany({
      select: {
        fabricName: true,
        fabricColor: true,
        createdAt: true,
        id: true,
      },
    });

    return fabrics || [];
  } catch (error) {
    console.error("Failed to get Folder and its Fbxas:", error);
    return [];
  }
}
