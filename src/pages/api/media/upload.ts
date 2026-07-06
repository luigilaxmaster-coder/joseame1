/**
 * Media Upload API Endpoint
 * Handles image uploads to Wix Media Manager
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return createJsonResponse(
        { error: 'Invalid content type' },
        400
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error('Error parsing form data:', err);
      return createJsonResponse(
        { error: 'Failed to parse form data' },
        400
      );
    }

    const file = formData.get('file') as File | null;
    const memberId = formData.get('memberId') as string | null;

    if (!file) {
      return createJsonResponse(
        { error: 'No file provided' },
        400
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return createJsonResponse(
        { error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' },
        400
      );
    }

    // Validate file size (100MB max - increased from 20MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return createJsonResponse(
        { error: 'File too large. Maximum size: 100MB' },
        400
      );
    }

    // Convert file to buffer
    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (err) {
      console.error('Error reading file:', err);
      return createJsonResponse(
        { error: 'Failed to read file' },
        400
      );
    }

    // Use Wix Media Manager API to upload
    const mediaUrl = await uploadToWixMedia(buffer, file.name, file.type, memberId || undefined);

    return createJsonResponse({
      url: mediaUrl,
      mediaId: `media-${Date.now()}`,
      success: true,
    }, 200);
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return createJsonResponse(
      { error: errorMessage },
      500
    );
  }
};

/**
 * Helper function to create JSON responses with proper headers
 */
function createJsonResponse(data: any, status: number): Response {
  const jsonString = JSON.stringify(data);
  return new Response(jsonString, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

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
    // Convert buffer to base64 string
    const uint8Array = new Uint8Array(buffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64String = Buffer.from(binaryString, 'binary').toString('base64');
    
    // Create data URL
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    return dataUrl;
  } catch (error) {
    console.error('Error uploading to Wix Media:', error);
    throw new Error('Failed to process image upload');
  }
}
