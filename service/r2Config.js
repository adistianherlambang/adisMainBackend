const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const accountId = process.env.R2_ACCOUNT_ID || "4ab1c43c7c69921e5dfa37af39d16207";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const rawEndpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
const endpoint = rawEndpoint.replace(/\/adistianr2\/?$/i, "").replace(/\/$/, "");

const s3Client = new S3Client({

  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

const bucketName = process.env.R2_BUCKET_NAME || "adistianr2";
const publicDevUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_DEV_URL || "https://pub-41497c6c6346456eb2da0b1b0daaf2d1.r2.dev").replace(/\/$/, "");


function checkR2Credentials() {
  if (!accessKeyId || accessKeyId === "your_r2_access_key_id") {
    throw new Error(
      "R2_ACCESS_KEY_ID belum diisi dengan benar di file .env. Dapatkan Access Key ID (32 karakter) dari Cloudflare Dashboard -> R2 -> Manage R2 API Tokens."
    );
  }
  if (!secretAccessKey || secretAccessKey === "your_r2_secret_access_key") {
    throw new Error(
      "R2_SECRET_ACCESS_KEY belum diisi dengan benar di file .env. Dapatkan Secret Access Key dari Cloudflare Dashboard -> R2 -> Manage R2 API Tokens."
    );
  }
}

module.exports = {
  s3Client,
  bucketName,
  publicDevUrl,
  checkR2Credentials,
};
