import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);

  try {
    console.log("Uploading to S3:", fileName);
    await s3Client.send(command);
    const fileUrl = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
    console.log("Upload successful. File URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fabricId = searchParams.get("id");

    if (!fabricId) {
      console.error("Fabric ID is required");
      return NextResponse.json(
        { status: "error", message: "Fabric ID is required." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    console.log("Form Data received:", formData);

    const existingFabric = await prisma.fabricMap.findUnique({
      where: { id: parseInt(fabricId) },
    });

    if (!existingFabric) {
      console.error("Fabric not found:", fabricId);
      return NextResponse.json(
        { status: "error", message: "Fabric not found." },
        { status: 404 }
      );
    }

    const updatedFabricData = {
      bumpScale: parseFloat(formData.get("bumpScale")),
      displacementScale: parseFloat(formData.get("displacementScale")),
      emissiveIntensity: parseFloat(formData.get("emissiveIntensity")),
      metalness: parseFloat(formData.get("metalness")),
      roughness: parseFloat(formData.get("roughness")),
      fabricName: formData.get("fabricName"),
      fabricColor: formData.get("fabricColor"),
    };

    console.log("Initial updated fabric data:", updatedFabricData);

    const mapTypes = [
      "diffuseMapUrl",
      "reflectionMapUrl",
      "refractionMapUrl",
      "bumpMapUrl",
      "normalMapUrl",
      "displacementMapUrl",
      "specularMapUrl",
      "emissiveMapUrl",
      "opacityMapUrl",
      "aoMapUrl",
      "metalnessMapUrl",
      "roughnessMapUrl",
    ];

    for (const mapType of mapTypes) {
      const file = formData.get(mapType);
      if (file && file.size > 0) {
        console.log(`Processing file for ${mapType}:`, file.name);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}-${file.name}`;
        const contentType = file.type;

        const fileUrl = await uploadFileToS3(fileBuffer, fileName, contentType);
        updatedFabricData[mapType] = fileUrl;
      } else if (existingFabric[mapType]) {
        updatedFabricData[mapType] = existingFabric[mapType];
      } else {
        updatedFabricData[mapType] = null;
      }
    }

    console.log(
      "Final updated fabric data before saving to DB:",
      updatedFabricData
    );

    const updatedFabric = await prisma.fabricMap.update({
      where: { id: parseInt(fabricId) },
      data: updatedFabricData,
    });

    console.log("Updated Fabric Data:", updatedFabric);

    return NextResponse.json({ status: "success", fabric: updatedFabric });
  } catch (error) {
    console.error("Error handling PUT request:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update fabric data." },
      { status: 500 }
    );
  }
}
