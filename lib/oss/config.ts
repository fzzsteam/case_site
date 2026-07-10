import "server-only";

export function getOssConfig() {
  const region = process.env.OSS_REGION;
  const bucket = process.env.OSS_BUCKET;
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
  if (!region || !bucket || !accessKeyId || !accessKeySecret) throw new Error("OSS is not configured");
  return { region, bucket, accessKeyId, accessKeySecret, secure: true } as const;
}
