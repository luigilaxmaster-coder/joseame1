import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import { ArrowLeft, User, Mail, Calendar, Shield, Star, Upload, Heart, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <button 
            onClick={() => navigate(getBackButtonPath())}
            className="inline-flex items-center gap-2 text-muted-text hover:text-primary transition-colors font-paragraph font-semibold"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Profile Header Card - Enhanced */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36 blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                {/* Profile Photo */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="relative"
                >
                  {member?.profile?.photo?.url ? (
                    <Image src={member.profile.photo.url} alt={member.profile.nickname || 'Usuario'} className="w-40 h-40 rounded-3xl object-cover border-4 border-white shadow-2xl" width={160} />
                  ) : (
                    <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                      <User size={80} className="text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <Star size={20} className="text-white fill-white" />
                  </div>
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 text-white">
                  <h1 className="font-heading text-5xl font-bold mb-2">
                    {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                  </h1>
                  
                  {member?.profile?.title && (
                    <p className="font-paragraph text-xl font-semibold mb-4 text-white/90">
                      {member.profile.title}
                    </p>
                  )}

                  {/* Rating Display */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < Math.floor(averageRating) ? 'fill-yellow-300 text-yellow-300' : 'text-white/40'}
                          />
                        ))}
                      </div>
                      <span className="font-heading font-bold text-white">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'Sin calificaciones'}
                      </span>
                      {userRatings.length > 0 && (
                        <span className="font-paragraph text-sm text-white/80">
                          ({userRatings.length})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl font-bold text-white">Acerca de mí</h3>
                  {!isEditingDescription && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTempDescription(description);
                        setIsEditingDescription(true);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} className="text-white" />
                    </motion.button>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full p-4 border border-white/30 rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-white bg-white/10 backdrop-blur-sm text-white placeholder-white/50 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveDescription}
                        className="flex-1 px-4 py-2 bg-white text-primary font-paragraph font-semibold rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Check size={18} />
                        Guardar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditingDescription(false)}
                        className="flex-1 px-4 py-2 border-2 border-white text-white font-paragraph font-semibold rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="font-paragraph text-white/90 leading-relaxed text-lg">
                    {description || 'Sin descripción. Haz clic en editar para agregar una.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info - Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {member?.loginEmail && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-xl">
                  <Mail size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-muted-text font-semibold">Email</p>
                  <p className="font-paragraph text-foreground font-bold text-lg">{member.loginEmail}</p>
                </div>
              </motion.div>
            )}

            {member?.contact?.firstName && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-gradient-to-br from-secondary to-support rounded-xl">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-muted-text font-semibold">Nombre Completo</p>
                  <p className="font-paragraph text-foreground font-bold text-lg">
                    {member.contact.firstName} {member.contact.lastName}
                  </p>
                </div>
              </motion.div>
            )}

            {member?._createdDate && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-gradient-to-br from-accent to-support2 rounded-xl">
                  <Calendar size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-muted-text font-semibold">Miembro desde</p>
                  <p className="font-paragraph text-foreground font-bold text-lg">
                    {new Date(member._createdDate).toLocaleDateString('es-DO')}
                  </p>
                </div>
              </motion.div>
            )}

            {member?.status && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-support/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-gradient-to-br from-support to-support2 rounded-xl">
                  <Shield size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-paragraph text-sm text-muted-text font-semibold">Estado de la Cuenta</p>
                  <p className="font-paragraph text-foreground font-bold text-lg">
                    {member.status === 'APPROVED' ? 'Verificado' : 'Activo'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Photo Upload Section - Enhanced */}
          <div className="bg-white rounded-3xl p-8 border-2 border-primary/20 shadow-2xl overflow-hidden relative">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <h3 className="font-heading text-3xl font-bold text-foreground mb-8">Mi Galería de Fotos</h3>
              
              {/* Error Message */}
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-sm text-destructive">{uploadError}</p>
                </motion.div>
              )}

              {/* Upload Form - Show preview or upload interface */}
              {previewUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border-2 border-primary/40"
                >
                  <div className="space-y-4">
                    {/* Preview Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-80 flex items-center justify-center shadow-lg">
                      <Image
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        width={400}
                      />
                    </div>

                    {/* Caption Input */}
                    <div>
                      <label className="block font-paragraph text-sm font-bold text-foreground mb-3">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Agrega una descripción para tu foto..."
                        className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmUpload}
                        disabled={isUploadingPhoto}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        {isUploadingPhoto ? 'Subiendo...' : 'Confirmar y Subir'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelUpload}
                        disabled={isUploadingPhoto}
                        className="flex-1 px-4 py-3 border-2 border-primary/30 text-foreground font-paragraph font-bold rounded-xl hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="mb-8 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border-3 border-dashed border-primary/40 hover:border-primary/60 transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-5 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg"
                    >
                      <Upload size={40} className="text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-heading font-bold text-foreground mb-2 text-xl">Sube una foto a tu perfil</p>
                      <p className="font-paragraph text-muted-text">Comparte momentos de tu trabajo y destaca tu portafolio</p>
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
                        className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-bold rounded-xl cursor-pointer hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? 'Procesando...' : '+ Seleccionar Foto'}
                      </motion.button>
                    </label>
                  </div>
                </div>
              )}

              {/* Photos Grid - Enhanced Gallery */}
              {profilePhotos.length > 0 ? (
                <div className="space-y-8">
                  <div>
                    <h4 className="font-heading text-2xl font-bold text-foreground mb-6">Mis Fotos ({profilePhotos.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profilePhotos.map((photo, index) => (
                        <motion.div
                          key={photo._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-white"
                        >
                          {/* Photo */}
                          <div className="relative h-72 bg-gray-200 overflow-hidden">
                            <Image
                              src={photo.photo || ''}
                              alt={photo.caption || 'Foto del perfil'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              width={300}
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300 flex items-end justify-center gap-4 p-4 opacity-0 group-hover:opacity-100">
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLikePhoto(photo._id, photo.likeCount || 0)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Heart size={24} className="text-red-500 fill-red-500" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeletePhoto(photo._id)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={24} className="text-destructive" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 bg-white">
                            <p className="font-paragraph text-sm text-foreground mb-3 line-clamp-2 font-semibold">
                              {photo.caption}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                                <Heart size={16} className="text-red-500 fill-red-500" />
                                <span className="font-paragraph text-sm font-bold text-red-500">
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
                </div>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4 p-4 bg-primary/10 rounded-full"
                  >
                    <Upload size={40} className="text-primary" />
                  </motion.div>
                  <p className="font-heading text-lg font-bold text-foreground mb-2">Aún no has subido fotos</p>
                  <p className="font-paragraph text-muted-text">¡Sube tu primera foto para mostrar tu trabajo y destacar tu perfil!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ratings Section - Enhanced */}
          {userRatings.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border-2 border-secondary/20 shadow-2xl">
              <h3 className="font-heading text-3xl font-bold text-foreground mb-8">Calificaciones y Reseñas</h3>
              <div className="space-y-4">
                {userRatings.map((rating, index) => (
                  <motion.div
                    key={rating._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-2xl border-2 border-secondary/20 hover:border-secondary/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-heading font-bold text-foreground text-lg">
                          {rating.reviewerIdentifier || 'Usuario anónimo'}
                        </p>
                        <p className="font-paragraph text-sm text-muted-text">
                          {rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString('es-DO') : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < (rating.ratingValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-paragraph text-foreground leading-relaxed">{rating.reviewText}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection - Enhanced */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 border-2 border-primary/20 shadow-xl">
            <h3 className="font-heading text-3xl font-bold text-foreground mb-8">
              Cambiar Rol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('client');
                  window.location.href = '/client/dashboard';
                }}
                className="w-full px-6 py-6 bg-gradient-to-br from-primary to-secondary text-white font-heading font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all text-lg"
              >
                👤 Ir a Dashboard Cliente
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('joseador');
                  window.location.href = '/joseador/dashboard';
                }}
                className="w-full px-6 py-6 bg-gradient-to-br from-secondary to-accent text-white font-heading font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all text-lg"
              >
                🔧 Ir a Dashboard Joseador
              </motion.button>
            </div>
          </div>

          {/* Logout */}
          <div className="text-center pb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={actions.logout}
              className="px-10 py-4 border-3 border-destructive text-destructive font-heading font-bold rounded-2xl hover:bg-destructive hover:text-white transition-all text-lg shadow-lg hover:shadow-xl"
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
