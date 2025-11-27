/**
 * File Upload Service
 * Handles file uploads to Wix Media using the Wix Files API
 */

export interface UploadedFile {
  url: string;
  fileId: string;
}

/**
 * Uploads a file to Wix Media
 * @param file - The file to upload
 * @returns Promise with the uploaded file URL and ID
 */
export async function uploadFileToWix(file: File): Promise<UploadedFile> {
  try {
    // Create FormData for the file
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Wix Media
    // Using the Wix Files API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return {
      url: data.url,
      fileId: data.fileId,
    };
  } catch (error) {
    console.error('Error uploading file to Wix:', error);
    throw error;
  }
}

/**
 * Converts a File to a data URL for temporary preview
 * @param file - The file to convert
 * @returns Promise with the data URL
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns Boolean indicating if the file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}

/**
 * Gets a human-readable error message for upload failures
 * @param error - The error that occurred
 * @returns A user-friendly error message
 */
export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Upload failed')) {
      return 'Error al subir la foto. Por favor, intenta de nuevo.';
    }
    return error.message;
  }
  return 'Ocurrió un error desconocido al subir la foto.';
}
