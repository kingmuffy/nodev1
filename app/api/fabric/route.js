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
    await s3Client.send(command);
    return `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { maps, materialParams } = await request.json();

    const uploadedMaps = await Promise.all(
      maps.map(async (map) => {
        const fileBuffer = Buffer.from(map.data.split(",")[1], "base64");
        const fileName = `${uuidv4()}-${map.name}`;
        const fileUrl = await uploadFileToS3(fileBuffer, fileName, map.type);
        return {
          type: map.type,
          url: fileUrl,
        };
      })
    );

    const fabricData = {
      materialParams,
      maps: uploadedMaps,
    };

    const savedFabric = await prisma.fabriccreate.create({
      data: fabricData,
    });

    return NextResponse.json({ status: "success", fabric: savedFabric });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to upload fabric data." },
      { status: 500 }
    );
  }
}
