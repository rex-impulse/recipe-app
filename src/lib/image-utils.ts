import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxWidthOrHeight: 1200,
    maxSizeMB: 1,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.8,
  };
  return imageCompression(file, options);
}

export async function uploadImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  file: File,
  bucket: string = "recipe-images"
): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressed, { contentType: "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
