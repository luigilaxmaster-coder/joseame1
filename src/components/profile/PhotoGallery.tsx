/**
 * Photo Gallery Component
 * Displays user's uploaded photos
 */

import React, { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { PhotoCrudService } from '@/lib/photo-crud-service';
import { UserPhotos } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PhotoGalleryProps {
  type?: 'profile' | 'portfolio';
  onPhotoDeleted?: () => void;
}

export default function PhotoGallery({ type = 'profile', onPhotoDeleted }: PhotoGalleryProps) {
  const { member, isAuthenticated } = useMember();
  const [photos, setPhotos] = useState<UserPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && member?._id) {
      loadPhotos();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, member?._id]);

  const loadPhotos = async () => {
    if (!member?._id) return;
    setIsLoading(true);
    try {
      const memberPhotos = await PhotoCrudService.getMemberPhotos(member._id, type);
      setPhotos(memberPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) return;

    setDeletingId(photoId);
    try {
      await PhotoCrudService.deletePhoto(photoId);
      setPhotos(photos.filter((p) => p._id !== photoId));
      onPhotoDeleted?.();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay fotos {type === 'profile' ? 'de perfil' : 'de portafolio'} aún</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo._id} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={photo.photoUrl || ''}
              alt={photo.altText || 'Foto de usuario'}
              className="w-full h-full object-cover"
              width={200}
              height={200}
            />
          </div>

          {/* Delete button on hover */}
          <Button
            onClick={() => handleDelete(photo._id)}
            disabled={deletingId === photo._id}
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar foto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Photo info */}
          <div className="text-xs text-gray-500 mt-1">
            {photo.createdAt && (
              <p>{new Date(photo.createdAt).toLocaleDateString('es-ES')}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
