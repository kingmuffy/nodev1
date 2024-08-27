import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default async function getParameterById(params) {
  try {
    const { id } = params;
    const parameters = await prisma.fabricMap.findUnique({
      where: {
        id: id,
      },
    });

    if (!parameters) return null;
    return parameters;
  } catch (error) {
    throw new Error(error);
  }
}
