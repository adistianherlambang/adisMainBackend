const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const accountId = process.env.R2_ACCOUNT_ID || "4ab1c43c7c69921e5dfa37af39d16207";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

const bucketName = process.env.R2_BUCKET_NAME || "adistianr2";
const publicDevUrl = (process.env.R2_PUBLIC_DEV_URL || "https://pub-41497c6c6346456eb2da0b1b0daaf2d1.r2.dev").replace(/\/$/, "");

module.exports = {
  s3Client,
  bucketName,
  publicDevUrl,
};
