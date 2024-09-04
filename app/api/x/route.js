import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, res) {
  try {
    // Hard-code the project ID for testing
    const hardCodedProjectId = "66d85a872aff36eb1f4f5bd7";

    // Fetch the project by ID directly
    const defaultProject = await prisma.project.findUnique({
      where: { id: hardCodedProjectId },
      include: { lightSettings: true }, // Include light settings
    });

    // Check if the project exists
    if (!defaultProject) {
      return res
        .status(404)
        .json({ status: "error", message: "Project not found." });
    }

    // Return the project with light settings
    return res.status(200).json({ status: "success", project: defaultProject });
  } catch (error) {
    console.error("Error fetching project by ID:", error.stack); // Capture full stack trace
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch project." });
  }
}
