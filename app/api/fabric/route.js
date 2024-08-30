import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique file names
import { revalidatePath } from "next/cache";

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

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Form Data received:", formData);

    const fabricData = {
      diffuseMapUrl: null,
      reflectionMapUrl: null,
      refractionMapUrl: null,
      bumpMapUrl: null,
      normalMapUrl: null,
      displacementMapUrl: null,
      specularMapUrl: null,
      emissiveMapUrl: null,
      opacityMapUrl: null,
      aoMapUrl: null,
      metalnessMapUrl: null,
      roughnessMapUrl: null,
      bumpScale: parseFloat(formData.get("bumpScale")),
      displacementScale: parseFloat(formData.get("displacementScale")),
      emissiveIntensity: parseFloat(formData.get("emissiveIntensity")),
      metalness: parseFloat(formData.get("metalness")),
      roughness: parseFloat(formData.get("roughness")),
      displacementBias: parseFloat(formData.get("displacementBias")), // New field
      flatShading: formData.get("flatShading") === "true", // New field
      aoMapIntensity: parseFloat(formData.get("aoMapIntensity")), // New field
      clearcoat: parseFloat(formData.get("clearcoat")), // New field
      fabricName: formData.get("fabricName"), // Get fabric name
      fabricColor: formData.get("fabricColor"), // Get fabric color
    };

    console.log("Initial fabric data:", fabricData);

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
        fabricData[mapType] = fileUrl;
      } else {
        console.log(`No file uploaded for ${mapType}`);
      }
    }

    console.log("Final fabric data before saving to DB:", fabricData);

    const savedFabric = await prisma.fabricMap.create({
      data: fabricData,
    });
    revalidatePath("/fabric/list");

    console.log("Saved Fabric Data:", savedFabric);

    return NextResponse.json({ status: "success", fabric: savedFabric });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to upload fabric data." },
      { status: 500 }
    );
  }
}
