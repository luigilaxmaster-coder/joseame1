/**
 * Wix Media Manager Service
 * Handles image uploads to Wix Media Manager and returns public URLs
 */

interface UploadResponse {
  url: string;
  mediaId?: string;
}

export class WixMediaService {
  /**
   * Upload an image file to Wix Media Manager
   * @param file - The image file to upload
   * @param memberId - Optional member ID for organizing uploads
   * @returns Promise with public URL and optional mediaId
   */
  static async uploadImage(file: File, memberId?: string): Promise<UploadResponse> {
    try {
      // Validate file before upload
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      if (memberId) {
        formData.append('memberId', memberId);
      }

      // Upload to Wix Media Manager via backend API
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to upload image');
      }

      const data = await response.json();
      return {
        url: data.url,
        mediaId: data.mediaId,
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }

  /**
   * Validate image file before upload
   * @param file - The file to validate
   * @returns Object with isValid boolean and error message if invalid
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos JPG, PNG, GIF o WebP',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo no debe exceder 10MB',
      };
    }

    return { isValid: true };
  }

  /**
   * Create a preview URL from a File object
   * @param file - The file to create preview for
   * @returns Data URL for preview
   */
  static createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
