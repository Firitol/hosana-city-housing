import { put, del, list } from '@vercel/blob';

export async function uploadFile(
  filename: string,
  file: Buffer,
  contentType: string
) {
  try {
    const blob = await put(`documents/${Date.now()}-${filename}`, file, {
      access: 'public',
      contentType,
    });
    return blob.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(url: string) {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export async function listFiles(prefix?: string) {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (error) {
    console.error('List error:', error);
    return [];
  }
}
