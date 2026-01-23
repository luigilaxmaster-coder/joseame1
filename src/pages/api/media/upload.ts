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

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
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
    // This would typically use the Wix backend SDK
    // For now, we'll use a placeholder that simulates the upload
    const mediaUrl = await uploadToWixMedia(buffer, file.name, file.type);

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
 * This is a placeholder implementation
 * In production, use the actual Wix Media Manager API
 */
async function uploadToWixMedia(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  // In a real implementation, you would:
  // 1. Use the Wix Media Manager API
  // 2. Upload the file
  // 3. Get the public URL
  // 4. Return the URL

  // For now, we'll create a data URL (this is for development)
  // In production, implement actual Wix Media Manager integration
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);

  // In production, replace this with actual Wix Media Manager upload
  // Example: const response = await wixMediaManager.upload(blob);
  // return response.publicUrl;

  // For now, return a placeholder that will work with the service
  // This should be replaced with actual Wix Media Manager integration
  return url;
}
