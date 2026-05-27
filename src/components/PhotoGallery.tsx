import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { UserPhotoPosts } from '@/entities';
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<UserPhotoPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<UserPhotoPosts>('user-photo-posts', {}, { limit: 12, skip });
      setPhotos(prev => skip === 0 ? result.items : [...prev, ...result.items]);
      setHasNext(result.hasNext);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (photoId: string) => {
    const newLiked = new Set(likedPhotos);
    const photo = photos.find(p => p._id === photoId);
    
    if (!photo) return;

    if (newLiked.has(photoId)) {
      newLiked.delete(photoId);
    } else {
      newLiked.add(photoId);
    }
    
    setLikedPhotos(newLiked);

    try {
      const newLikes = (photo.likes || 0) + (newLiked.has(photoId) ? 1 : -1);
      await BaseCrudService.update<UserPhotoPosts>('user-photo-posts', {
        _id: photoId,
        likes: newLikes,
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      setLikedPhotos(likedPhotos);
    }
  };

  const loadMore = () => {
    setSkip(prev => prev + 12);
  };

  useEffect(() => {
    if (skip > 0) {
      loadPhotos();
    }
  }, [skip]);

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="font-heading text-3xl font-bold text-foreground">Gallery</h1>
          <p className="text-muted-text text-sm mt-1">Explore photos from our community</p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading && photos.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-text text-lg">No photos yet. Be the first to share!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {photo.photoUrl && (
                      <Image
                        src={photo.photoUrl}
                        alt={photo.caption || 'Gallery photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                      />
                    )}
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleLike(photo._id)}
                        className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            likedPhotos.has(photo._id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span className="text-xs font-medium">{photo.likes || 0}</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-xs font-medium">0</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-foreground text-sm">
                          {photo.username || 'Anonymous'}
                        </p>
                        {photo.caption && (
                          <p className="text-muted-text text-xs mt-1 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-text">
                      <button
                        onClick={() => handleLike(photo._id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedPhotos.has(photo._id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span>{photo.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>0</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNext && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-heading font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
