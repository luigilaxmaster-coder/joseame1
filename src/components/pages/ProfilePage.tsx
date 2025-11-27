import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import { ArrowLeft, User, Mail, Calendar, Shield, Star, Upload, Heart, Trash2, Edit2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { ProfilePhotos, UserRatings } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';

function ProfilePage() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhotos[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Determine the back button destination based on user role
  const getBackButtonPath = () => {
    if (userRole === 'client') {
      return '/client/dashboard';
    } else if (userRole === 'joseador') {
      return '/joseador/dashboard';
    }
    return '/';
  };

  useEffect(() => {
    loadProfileData();
  }, [member?.loginEmail]);

  const loadProfileData = async () => {
    if (!member?.loginEmail) return;
    
    // Load profile photos
    const { items: photos } = await BaseCrudService.getAll<ProfilePhotos>('profilephotos');
    const userPhotos = photos.filter(p => p.uploaderId === member.loginEmail);
    setProfilePhotos(userPhotos.sort((a, b) => {
      const dateA = new Date(a.uploadDate || 0).getTime();
      const dateB = new Date(b.uploadDate || 0).getTime();
      return dateB - dateA;
    }));

    // Load user ratings
    const { items: ratings } = await BaseCrudService.getAll<UserRatings>('userratings');
    const userRatingsData = ratings.filter(r => r.ratedUserIdentifier === member.loginEmail);
    setUserRatings(userRatingsData);
    
    if (userRatingsData.length > 0) {
      const avg = userRatingsData.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / userRatingsData.length;
      setAverageRating(Math.round(avg * 10) / 10);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member?.loginEmail) return;

    // Validate file
    if (!isValidImageFile(file)) {
      setUploadError('Por favor, sube una imagen válida (JPEG, PNG, GIF o WebP) de menos de 10MB.');
      return;
    }

    setUploadError('');
    setIsUploadingPhoto(true);
    
    try {
      // Create preview URL for immediate display
      const preview = await createPreviewUrl(file);
      setPreviewUrl(preview);
      setSelectedFile(file);
    } catch (error) {
      setUploadError(getUploadErrorMessage(error));
      setIsUploadingPhoto(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !member?.loginEmail || !previewUrl) return;

    setIsUploadingPhoto(true);
    try {
      // Save photo to database with preview URL
      // In production, this would be replaced with actual Wix Media upload
      await BaseCrudService.create('profilephotos', {
        _id: crypto.randomUUID(),
        photo: previewUrl,
        caption: photoCaption || 'Sin descripción',
        uploadDate: new Date().toISOString(),
        likeCount: 0,
        uploaderId: member.loginEmail
      });

      // Reset form
      setPhotoCaption('');
      setPreviewUrl('');
      setSelectedFile(null);
      setUploadError('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload photos
      await loadProfileData();
    } catch (error) {
      setUploadError(getUploadErrorMessage(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    setPhotoCaption('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveDescription = async () => {
    setDescription(tempDescription);
    setIsEditingDescription(false);
    // In a real app, this would be saved to the member profile
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await BaseCrudService.delete('profilephotos', photoId);
      await loadProfileData();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleLikePhoto = async (photoId: string, currentLikes: number) => {
    try {
      await BaseCrudService.update('profilephotos', {
        _id: photoId,
        likeCount: currentLikes + 1
      });
      await loadProfileData();
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(getBackButtonPath())}
              className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} className="sm:hidden" />
              <ArrowLeft size={20} className="hidden sm:block" />
              <span className="font-paragraph text-sm sm:text-base">Volver</span>
            </button>
            
            {/* Role Switch Button - Compact for mobile */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (userRole === 'client') {
                  setUserRole('joseador');
                  navigate('/joseador/dashboard');
                } else {
                  setUserRole('client');
                  navigate('/client/dashboard');
                }
              }}
              className="p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all text-white flex-shrink-0"
              title={userRole === 'client' ? 'Cambiar a Joseador' : 'Cambiar a Cliente'}
            >
              <RefreshCw size={16} className="sm:hidden" />
              <RefreshCw size={18} className="hidden sm:block" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-white via-white to-background rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-xl overflow-hidden relative">
            {/* Decorative background elements - hidden on mobile for performance */}
            <div className="hidden sm:block absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20" />
            <div className="hidden sm:block absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-tr from-accent/10 to-support/10 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 mb-6 sm:mb-8">
                {/* Profile Photo */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative flex-shrink-0"
                >
                  {member?.profile?.photo?.url ? (
                    <Image src={member.profile.photo.url} alt={member.profile.nickname || 'Usuario'} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl object-cover border-4 border-primary shadow-lg" width={128} />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                      <User size={48} className="sm:hidden text-white" />
                      <User size={64} className="hidden sm:block text-white" />
                    </div>
                  )}
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                    {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                  </h1>
                  
                  {member?.profile?.title && (
                    <p className="font-paragraph text-sm sm:text-lg text-secondary font-semibold mb-3 sm:mb-4">
                      {member.profile.title}
                    </p>
                  )}

                  {/* Rating Display */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-4">
                    <div className="flex items-center gap-1 sm:gap-2 bg-yellow-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl">
                      <div className="flex gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`sm:w-[18px] sm:h-[18px] ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="font-heading font-bold text-foreground text-sm sm:text-base">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'Sin calificaciones'}
                      </span>
                      {userRatings.length > 0 && (
                        <span className="font-paragraph text-xs sm:text-sm text-muted-text">
                          ({userRatings.length})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Acerca de mí</h3>
                  {!isEditingDescription && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTempDescription(description);
                        setIsEditingDescription(true);
                      }}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Edit2 size={16} className="sm:w-[18px] sm:h-[18px] text-primary" />
                    </motion.button>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full p-3 sm:p-4 border border-border rounded-lg sm:rounded-xl font-paragraph text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveDescription}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-paragraph text-sm sm:text-base font-semibold rounded-lg flex items-center justify-center gap-2"
                      >
                        <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Guardar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditingDescription(false)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-border text-foreground font-paragraph text-sm sm:text-base font-semibold rounded-lg hover:bg-background transition-colors"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="font-paragraph text-sm sm:text-base text-foreground leading-relaxed">
                    {description || 'Sin descripción. Haz clic en editar para agregar una.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {member?.loginEmail && (
              <motion.div
                whileHover={{ y: -4 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Mail size={18} className="sm:w-[24px] sm:h-[24px] text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs sm:text-sm text-muted-text">Email</p>
                  <p className="font-paragraph text-xs sm:text-base text-foreground font-semibold truncate">{member.loginEmail}</p>
                </div>
              </motion.div>
            )}

            {member?.contact?.firstName && (
              <motion.div
                whileHover={{ y: -4 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="p-2 sm:p-3 bg-secondary/10 rounded-lg flex-shrink-0">
                  <User size={18} className="sm:w-[24px] sm:h-[24px] text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs sm:text-sm text-muted-text">Nombre Completo</p>
                  <p className="font-paragraph text-xs sm:text-base text-foreground font-semibold truncate">
                    {member.contact.firstName} {member.contact.lastName}
                  </p>
                </div>
              </motion.div>
            )}

            {member?._createdDate && (
              <motion.div
                whileHover={{ y: -4 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="p-2 sm:p-3 bg-accent/10 rounded-lg flex-shrink-0">
                  <Calendar size={18} className="sm:w-[24px] sm:h-[24px] text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs sm:text-sm text-muted-text">Miembro desde</p>
                  <p className="font-paragraph text-xs sm:text-base text-foreground font-semibold">
                    {new Date(member._createdDate).toLocaleDateString('es-DO')}
                  </p>
                </div>
              </motion.div>
            )}

            {member?.status && (
              <motion.div
                whileHover={{ y: -4 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="p-2 sm:p-3 bg-support/10 rounded-lg flex-shrink-0">
                  <Shield size={18} className="sm:w-[24px] sm:h-[24px] text-support" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs sm:text-sm text-muted-text">Estado de la Cuenta</p>
                  <p className="font-paragraph text-xs sm:text-base text-foreground font-semibold">
                    {member.status === 'APPROVED' ? 'Verificado' : 'Activo'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Photo Upload Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-xl">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6">Mi Galería</h3>
            
            {/* Error Message */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3"
              >
                <AlertCircle size={18} className="sm:w-[20px] sm:h-[20px] text-destructive flex-shrink-0 mt-0.5" />
                <p className="font-paragraph text-xs sm:text-sm text-destructive">{uploadError}</p>
              </motion.div>
            )}

            {/* Upload Form - Show preview or upload interface */}
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg sm:rounded-2xl border-2 border-primary/30"
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Preview Image */}
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-gray-200 h-48 sm:h-64 flex items-center justify-center">
                    <Image
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      width={400}
                    />
                  </div>

                  {/* Caption Input */}
                  <div>
                    <label className="block font-paragraph text-xs sm:text-sm font-semibold text-foreground mb-2">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Agrega una descripción para tu foto..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg font-paragraph text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmUpload}
                      disabled={isUploadingPhoto}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white font-paragraph text-sm sm:text-base font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                      {isUploadingPhoto ? 'Subiendo...' : 'Confirmar'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelUpload}
                      disabled={isUploadingPhoto}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border text-foreground font-paragraph text-sm sm:text-base font-semibold rounded-lg hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg sm:rounded-2xl border-2 border-dashed border-primary/30">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-full">
                    <Upload size={24} className="sm:w-[32px] sm:h-[32px] text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">Sube una foto a tu perfil</p>
                    <p className="font-paragraph text-xs sm:text-sm text-muted-text">Comparte momentos de tu trabajo</p>
                  </div>
                  <label className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white font-paragraph text-sm sm:text-base font-semibold rounded-lg cursor-pointer hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto ? 'Procesando...' : 'Seleccionar Foto'}
                    </motion.button>
                  </label>
                </div>
              </div>
            )}

            {/* Photos Grid - Instagram-style feed */}
            {profilePhotos.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                <h4 className="font-heading text-base sm:text-lg font-semibold text-foreground">Mis Fotos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {profilePhotos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative rounded-lg sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* Photo */}
                    <div className="relative h-48 sm:h-64 bg-gray-200 overflow-hidden">
                      <Image
                        src={photo.photo || ''}
                        alt={photo.caption || 'Foto del perfil'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        width={300}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 opacity-0 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLikePhoto(photo._id, photo.likeCount || 0)}
                          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <Heart size={20} className="sm:w-[24px] sm:h-[24px] text-red-500 fill-red-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePhoto(photo._id)}
                          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={20} className="sm:w-[24px] sm:h-[24px] text-destructive" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 bg-white">
                      <p className="font-paragraph text-xs sm:text-sm text-foreground mb-2 sm:mb-3 line-clamp-2">
                        {photo.caption}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Heart size={14} className="sm:w-[16px] sm:h-[16px] text-red-500 fill-red-500" />
                          <span className="font-paragraph text-xs sm:text-sm font-semibold text-foreground">
                            {photo.likeCount || 0}
                          </span>
                        </div>
                        <span className="font-paragraph text-xs text-muted-text">
                          {photo.uploadDate ? new Date(photo.uploadDate).toLocaleDateString('es-DO') : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="font-paragraph text-sm sm:text-base text-muted-text mb-2 sm:mb-4">Aún no has subido fotos</p>
                <p className="font-paragraph text-xs sm:text-sm text-muted-text">¡Sube tu primera foto para mostrar tu trabajo!</p>
              </div>
            )}
          </div>

          {/* Ratings Section */}
          {userRatings.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-xl">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6">Calificaciones</h3>
              <div className="space-y-3 sm:space-y-4">
                {userRatings.map((rating, index) => (
                  <motion.div
                    key={rating._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 sm:p-4 bg-background rounded-lg sm:rounded-xl border border-border"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <div className="min-w-0">
                        <p className="font-heading text-sm sm:text-base font-semibold text-foreground truncate">
                          {rating.reviewerIdentifier || 'Usuario anónimo'}
                        </p>
                        <p className="font-paragraph text-xs sm:text-sm text-muted-text">
                          {rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString('es-DO') : ''}
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`sm:w-[16px] sm:h-[16px] ${i < (rating.ratingValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-paragraph text-xs sm:text-base text-foreground">{rating.reviewText}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-xl">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6">
              Cambiar Rol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('client');
                  window.location.href = '/client/dashboard';
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white font-heading text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Ir a Dashboard Cliente
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('joseador');
                  window.location.href = '/joseador/dashboard';
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-secondary to-accent text-white font-heading text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Ir a Dashboard Joseador
              </motion.button>
            </div>
          </div>

          {/* Logout */}
          <div className="text-center pb-4 sm:pb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={actions.logout}
              className="px-6 sm:px-8 py-2 sm:py-3 border-2 border-destructive text-destructive font-heading text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-destructive hover:text-white transition-all"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;
