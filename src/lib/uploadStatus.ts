// lib/uploadStatus.ts
type Status = "processing" | "ready" | "error";

const statusMap = new Map<string, Status>();

export function setUploadStatus(namespace: string, status: Status) {
  statusMap.set(namespace, status);
}

export function getUploadStatus(namespace: string): Status | undefined {
  return statusMap.get(namespace);
}
