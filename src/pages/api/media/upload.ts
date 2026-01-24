/**
 * Media Upload API Endpoint
 * Handles image uploads to Wix Media Manager
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request is multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memberId = formData.get('memberId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Use Wix Media Manager API to upload
    const mediaUrl = await uploadToWixMedia(buffer, file.name, file.type, memberId);

    return new Response(
      JSON.stringify({
        url: mediaUrl,
        mediaId: `media-${Date.now()}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Upload failed',
      }),
      { status: 500 }
    );
  }
};

/**
 * Upload file to Wix Media Manager
 * Converts to data URL for storage in CMS
 */
async function uploadToWixMedia(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  memberId?: string
): Promise<string> {
  try {
    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: mimeType });
    
    // Convert to data URL for storage
    const dataUrl = await blobToDataUrl(blob);
    
    return dataUrl;
  } catch (error) {
    console.error('Error uploading to Wix Media:', error);
    throw new Error('Failed to process image upload');
  }
}

/**
 * Convert blob to data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
