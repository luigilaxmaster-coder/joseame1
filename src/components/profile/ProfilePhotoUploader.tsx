/**
 * Profile Photo Uploader Component
 * Handles image selection, validation, upload, and preview
 */

import React, { useRef, useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { WixMediaService } from '@/lib/wix-media-service';
import { PhotoCrudService } from '@/lib/photo-crud-service';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Upload, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';

type UploadState = 'idle' | 'validating' | 'uploading' | 'saving' | 'done' | 'error';

interface ProfilePhotoUploaderProps {
  onPhotoUploadSuccess?: (photoUrl: string) => void;
  onPhotoUploadError?: (error: string) => void;
}

export default function ProfilePhotoUploader({
  onPhotoUploadSuccess,
  onPhotoUploadError,
}: ProfilePhotoUploaderProps) {
  const { member, isAuthenticated } = useMember();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState('validating');
    setError('');

    // Validate file
    const validation = WixMediaService.validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido');
      setState('error');
      setSelectedFile(null);
      setPreview('');
      return;
    }

    // Create preview
    try {
      const previewUrl = await WixMediaService.createPreviewUrl(file);
      setPreview(previewUrl);
      setSelectedFile(file);
      setState('idle');
    } catch (err) {
      setError('Error al crear preview');
      setState('error');
      setSelectedFile(null);
      setPreview('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !member?._id) {
      setError('Archivo o sesión no disponible');
      setState('error');
      return;
    }

    try {
      setState('uploading');
      setUploadProgress(30);

      // Upload to Wix Media Manager
      const uploadResponse = await WixMediaService.uploadImage(selectedFile);
      setUploadProgress(70);

      // Save to UserProfiles
      setState('saving');
      await PhotoCrudService.upsertUserProfile(member._id, uploadResponse.url);
      setUploadProgress(85);

      // Create record in UserPhotos
      await PhotoCrudService.createPhotoRecord(
        member._id,
        uploadResponse.url,
        'profile',
        selectedFile.size
      );
      setUploadProgress(100);

      // Success state
      setState('done');
      setSelectedFile(null);
      setPreview('');

      // Reset after 2 seconds
      setTimeout(() => {
        setState('idle');
        setUploadProgress(0);
        onPhotoUploadSuccess?.(uploadResponse.url);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir la foto';
      setError(errorMessage);
      setState('error');
      setUploadProgress(0);
      onPhotoUploadError?.(errorMessage);
    }
  };

  const handleButtonClick = () => {
    if (preview && selectedFile) {
      handleUpload();
    } else {
      fileInputRef.current?.click();
    }
  };

  const isLoading = state === 'validating' || state === 'uploading' || state === 'saving';
  const isDisabled = !isAuthenticated || isLoading;
  const showPreview = preview && selectedFile;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isDisabled}
          className="hidden"
          aria-label="Seleccionar foto de perfil"
        />

        {/* Preview */}
        {showPreview && (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
            <Image src={preview} alt="Preview de la foto seleccionada" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleButtonClick}
          disabled={isDisabled}
          className="w-full"
          variant={state === 'done' ? 'default' : 'outline'}
        >
          {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
          {state === 'done' && <Check className="mr-2 h-4 w-4" />}
          {state === 'done'
            ? '¡Foto subida!'
            : showPreview
              ? 'Subir Foto'
              : '+ Seleccionar Foto'}
        </Button>

        {/* Progress bar */}
        {isLoading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Not authenticated message */}
        {!isAuthenticated && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Inicia sesión para subir fotos</p>
          </div>
        )}

        {/* File info */}
        {showPreview && selectedFile && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Archivo:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
