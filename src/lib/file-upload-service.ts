/**
 * File Upload Service
 * Handles file uploads with data URL storage for profile photos
 */

export interface UploadedFile {
  url: string;
  fileId: string;
}

/**
 * Converts a File to a data URL for storage and preview
 * Supports all common image formats
 * @param file - The file to convert
 * @returns Promise with the data URL
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('Failed to read file'));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validates if a file is a valid image
 * Checks file type and size
 * @param file - The file to validate
 * @returns Boolean indicating if the file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check file type
  if (!validTypes.includes(file.type)) {
    return false;
  }

  // Check file size
  if (file.size > maxSize) {
    return false;
  }

  // Check file name has valid extension
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  return hasValidExtension;
}

/**
 * Gets a human-readable error message for upload failures
 * @param error - The error that occurred
 * @returns A user-friendly error message
 */
export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('file reading')) {
      return 'Error al leer el archivo. Por favor, intenta con otro archivo.';
    }
    if (message.includes('aborted')) {
      return 'La carga fue cancelada. Por favor, intenta de nuevo.';
    }
    if (message.includes('upload failed')) {
      return 'Error al subir la foto. Por favor, intenta de nuevo.';
    }
    if (message.includes('network')) {
      return 'Error de conexión. Por favor, verifica tu conexión a internet.';
    }
    
    return error.message;
  }
  
  return 'Ocurrió un error desconocido al subir la foto. Por favor, intenta de nuevo.';
}

/**
 * Compresses an image file to reduce size
 * @param file - The file to compress
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - Quality from 0 to 1
 * @returns Promise with the compressed image as a blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const img = new Image();
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Calculate new dimensions
              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Failed to compress image'));
                  }
                },
                file.type || 'image/jpeg',
                quality
              );
            } catch (error) {
              reject(error);
            }
          };

          img.onerror = () => {
            reject(new Error('Failed to load image'));
          };

          img.src = event.target?.result as string;
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}
