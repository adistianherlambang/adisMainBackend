const {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");
const { s3Client, bucketName, publicDevUrl, checkR2Credentials } = require("./r2Config");

/**
 * Upload file/gambar ke Cloudflare R2 dengan nama folder fleksibel
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - Buffer file yang akan diupload
 * @param {string} params.originalName - Nama asli file (misal: "foto.jpg")
 * @param {string} params.mimeType - MIME type file (misal: "image/jpeg")
 * @param {string} [params.folderName="smpm"] - Nama folder tujuan di Cloudflare R2
 * @param {string} [params.customName] - Nama custom file (opsional)
 */
async function uploadImageToR2({ fileBuffer, originalName, mimeType, folderName = "smpm", customName = null }) {
  checkR2Credentials();

  const cleanFolder = (folderName || "").replace(/^\/+|\/+$/g, "");
  const ext = path.extname(originalName) || "";
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = customName
    ? (customName.endsWith(ext) ? customName : `${customName}${ext}`)
    : `${Date.now()}_${baseName}${ext}`;

  const key = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

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
    folderName: cleanFolder,
    url: `${publicDevUrl}/${key}`,
    bucket: bucketName,
  };
}

/**
 * Ambil daftar file dari folder tertentu di R2
 * @param {string} [folderName="smpm"] - Nama folder di R2 (misal: "smpm")
 */
async function listR2Images(folderName = "smpm") {
  checkR2Credentials();

  const cleanFolder = (folderName || "").replace(/^\/+|\/+$/g, "");
  const prefix = cleanFolder ? `${cleanFolder}/` : "";

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  const contents = response.Contents || [];

  return contents
    .filter((item) => item.Key !== prefix)
    .map((item) => {
      const fileName = prefix ? item.Key.replace(prefix, "") : item.Key;
      return {
        key: item.Key,
        fileName,
        folderName: cleanFolder,
        size: item.Size,
        lastModified: item.LastModified,
        url: `${publicDevUrl}/${item.Key}`,
      };
    });
}

/**
 * Hapus file dari folder tertentu di R2
 * @param {string} folderName - Nama folder di R2 (misal: "smpm")
 * @param {string} fileName - Nama file (misal: "123_foto.jpg")
 */
async function deleteR2Image(folderName = "smpm", fileName) {
  checkR2Credentials();

  const cleanFolder = (folderName || "").replace(/^\/+|\/+$/g, "");
  const key = fileName.startsWith(`${cleanFolder}/`)
    ? fileName
    : (cleanFolder ? `${cleanFolder}/${fileName}` : fileName);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
  return { success: true, key };
}

/**
 * Ambil stream file dari folder tertentu di R2
 * @param {string} folderName - Nama folder di R2 (misal: "smpm")
 * @param {string} fileName - Nama file
 */
async function getR2ImageStream(folderName = "smpm", fileName) {
  checkR2Credentials();

  const cleanFolder = (folderName || "").replace(/^\/+|\/+$/g, "");
  const key = fileName.startsWith(`${cleanFolder}/`)
    ? fileName
    : (cleanFolder ? `${cleanFolder}/${fileName}` : fileName);

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

/**
 * Ambil stream file dari R2 langsung berdasarkan full Key (misal: "smpm/123_foto.png")
 * @param {string} key - Key file di R2
 */
async function getR2ObjectByKey(key) {
  checkR2Credentials();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType || "image/png",
    contentLength: response.ContentLength,
  };
}

module.exports = {
  uploadImageToR2,
  listR2Images,
  deleteR2Image,
  getR2ImageStream,
  getR2ObjectByKey,
};

