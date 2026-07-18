export async function uploadFile(kind: "cover" | "video", file: File, onProgress?: (percent: number) => void): Promise<string> {
  const urlResponse = await fetch("/api/admin/media/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, kind }) });
  if (!urlResponse.ok) throw new Error("Failed to get upload url");
  const { uploadUrl, objectPath, contentType } = (await urlResponse.json()) as { uploadUrl: string; objectPath: string; contentType: string };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  return objectPath;
}

export function detectVideoOrientation(file: File): Promise<"landscape" | "portrait"> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.videoWidth >= video.videoHeight ? "landscape" : "portrait");
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read video metadata"));
    };
    video.src = url;
  });
}
