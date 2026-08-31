const {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");
const { s3Client, bucketName, publicDevUrl } = require("./r2Config");

const FOLDER_PREFIX = "smpm";

/**
 * Upload gambar ke Cloudflare R2 dalam folder smpm/
 */
async function uploadImageToR2(fileBuffer, originalName, mimeType, customName = null) {
  const ext = path.extname(originalName) || "";
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = customName
    ? (customName.endsWith(ext) ? customName : `${customName}${ext}`)
    : `${Date.now()}_${baseName}${ext}`;

  const key = `${FOLDER_PREFIX}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return {
    key,
    fileName,
    url: `${publicDevUrl}/${key}`,
    bucket: bucketName,
  };
}

/**
 * Mengambil daftar gambar dari folder smpm/ di R2
 */
async function listSMPMImages() {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: `${FOLDER_PREFIX}/`,
  });

  const response = await s3Client.send(command);
  const contents = response.Contents || [];

  return contents
    .filter((item) => item.Key !== `${FOLDER_PREFIX}/`)
    .map((item) => {
      const fileName = item.Key.replace(`${FOLDER_PREFIX}/`, "");
      return {
        key: item.Key,
        fileName,
        size: item.Size,
        lastModified: item.LastModified,
        url: `${publicDevUrl}/${item.Key}`,
      };
    });
}

/**
 * Menghapus gambar dari folder smpm/ di R2
 */
async function deleteSMPMImage(fileName) {
  const key = fileName.startsWith(`${FOLDER_PREFIX}/`) ? fileName : `${FOLDER_PREFIX}/${fileName}`;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
  return { success: true, key };
}

/**
 * Mengambil stream gambar dari R2
 */
async function getSMPMImageStream(fileName) {
  const key = fileName.startsWith(`${FOLDER_PREFIX}/`) ? fileName : `${FOLDER_PREFIX}/${fileName}`;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}

module.exports = {
  uploadImageToR2,
  listSMPMImages,
  deleteSMPMImage,
  getSMPMImageStream,
};
