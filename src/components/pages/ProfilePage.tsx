import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import { ArrowLeft, User, Mail, Calendar, Shield, Star, Upload, Heart, Trash2, Edit2, Check, AlertCircle, CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { ProfilePhotos, UserRatings, RegisteredUsers } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';
import { useSyncUser } from '@/lib/user-sync-hook';

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
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [isLoadingVerification, setIsLoadingVerification] = useState(true);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [registeredUserRole, setRegisteredUserRole] = useState<string>('');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Sync user to registeredusers collection
  useSyncUser();

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
    
    // Set up interval to refresh user data every 3 seconds for real-time updates
    const intervalId = setInterval(() => {
      loadUserDataFromAdmin();
    }, 3000); // Optimized to 3s for faster admin sync

    return () => clearInterval(intervalId);
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

    // Load user data from registeredusers collection
    await loadUserDataFromAdmin();
  };

  const loadUserDataFromAdmin = async () => {
    if (!member?.loginEmail) return;
    
    try {
      const { items: users } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
      const currentUser = users.find(u => u.email === member.loginEmail);
      
      if (currentUser) {
        // Check if data has changed
        const hasChanged = 
          currentUser.verificationStatus !== verificationStatus ||
          currentUser.badges !== userBadges.join(',') ||
          currentUser.role !== registeredUserRole;

        if (hasChanged) {
          // Show notification when data updates
          setShowUpdateNotification(true);
          setLastUpdateTime(new Date());
          setTimeout(() => setShowUpdateNotification(false), 3000);
        }

        // Update verification status
        setVerificationStatus(currentUser.verificationStatus || 'no_verificado');
        
        // Update badges
        if (currentUser.badges) {
          const badgesArray = currentUser.badges.split(',').map(b => b.trim()).filter(b => b);
          setUserBadges(badgesArray);
        } else {
          setUserBadges([]);
        }

        // Update role
        setRegisteredUserRole(currentUser.role || '');
      } else {
        setVerificationStatus('no_verificado');
        setUserBadges([]);
        setRegisteredUserRole('');
      }
    } catch (error) {
      console.error('Error loading user data from admin:', error);
    } finally {
      setIsLoadingVerification(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member?.loginEmail) {
      setUploadError('Por favor, selecciona un archivo y asegúrate de estar autenticado.');
      return;
    }

    // Validate file
    if (!isValidImageFile(file)) {
      setUploadError('Por favor, sube una imagen válida (JPEG, PNG, GIF o WebP) de menos de 10MB. El archivo debe tener una extensión válida.');
      return;
    }

    setUploadError('');
    setIsUploadingPhoto(true);
    
    try {
      // Create preview URL for immediate display
      const preview = await createPreviewUrl(file);
      if (!preview) {
        throw new Error('No se pudo crear la vista previa de la imagen');
      }
      setPreviewUrl(preview);
      setSelectedFile(file);
      setIsUploadingPhoto(false);
    } catch (error) {
      console.error('Error in handleUploadPhoto:', error);
      setUploadError(getUploadErrorMessage(error));
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !member?.loginEmail || !previewUrl) {
      setUploadError('Error: Faltan datos necesarios para subir la foto. Por favor, intenta de nuevo.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Validate again before saving
      if (!isValidImageFile(selectedFile)) {
        throw new Error('El archivo no es válido. Por favor, selecciona una imagen válida.');
      }

      // Save photo to database with preview URL
      const photoId = crypto.randomUUID();
      const photoData: ProfilePhotos = {
        _id: photoId,
        photo: previewUrl,
        caption: photoCaption || 'Sin descripción',
        uploadDate: new Date().toISOString(),
        likeCount: 0,
        uploaderId: member.loginEmail
      };

      await BaseCrudService.create('profilephotos', photoData);

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
      console.error('Error in handleConfirmUpload:', error);
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
      setUploadError('Error al eliminar la foto. Por favor, intenta de nuevo.');
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
      setUploadError('Error al actualizar los likes. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/5">
      {/* Real-time Update Notification */}
      <AnimatePresence>
        {showUpdateNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-[100] max-w-sm"
          >
            <div className="bg-gradient-to-r from-accent to-support text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={20} className="text-white" />
                </motion.div>
                <div>
                  <p className="font-heading font-bold text-sm">¡Perfil Actualizado!</p>
                  <p className="font-paragraph text-xs text-white/90">
                    Tu información ha sido actualizada por el administrador
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4">
          <button 
            onClick={() => navigate(getBackButtonPath())}
            className="inline-flex items-center gap-2 text-muted-text hover:text-primary transition-colors font-paragraph font-semibold text-sm md:text-base h-10 px-3 rounded-lg hover:bg-background"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Profile Header Card - Enhanced */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
            
            {/* Decorative Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="hidden md:block absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36 blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 lg:p-12">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-8 mb-6 md:mb-8">
                {/* Profile Photo */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="relative flex-shrink-0"
                >
                  {member?.profile?.photo?.url ? (
                    <Image src={member.profile.photo.url} alt={member.profile.nickname || 'Usuario'} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl object-cover border-4 border-white shadow-lg md:shadow-2xl" width={160} />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center shadow-lg md:shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                      <User size={60} className="md:w-20 md:h-20 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <Star size={16} className="md:w-5 md:h-5 text-white fill-white" />
                  </div>
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1 text-white text-center md:text-left">
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                    {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                  </h1>
                  
                  {member?.profile?.title && (
                    <p className="font-paragraph text-base md:text-lg lg:text-xl font-semibold mb-4 text-white/90">
                      {member.profile.title}
                    </p>
                  )}

                  {/* Rating Display */}
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-white/30">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`md:w-[18px] md:h-[18px] ${i < Math.floor(averageRating) ? 'fill-yellow-300 text-yellow-300' : 'text-white/40'}`}
                          />
                        ))}
                      </div>
                      <span className="font-heading font-bold text-white text-sm md:text-base">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'Sin calificaciones'}
                      </span>
                      {userRatings.length > 0 && (
                        <span className="font-paragraph text-xs md:text-sm text-white/80">
                          ({userRatings.length})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges Display */}
                  {userBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {userBadges.map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full shadow-lg border-2 border-white/30"
                        >
                          <Award size={14} className="text-white" />
                          <span className="font-paragraph text-xs font-bold text-white">
                            {badge}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Role Display */}
                  {registeredUserRole && (
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                      <User size={14} className="text-white" />
                      <span className="font-paragraph text-sm font-semibold text-white capitalize">
                        {registeredUserRole === 'client' ? 'Cliente' : registeredUserRole === 'joseador' ? 'Joseador' : registeredUserRole}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg md:text-xl font-bold text-white">Acerca de mí</h3>
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
                      <Edit2 size={16} className="md:w-[18px] md:h-[18px] text-white" />
                    </motion.button>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full p-3 md:p-4 border border-white/30 rounded-xl font-paragraph text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white bg-white/10 backdrop-blur-sm text-white placeholder-white/50 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveDescription}
                        className="flex-1 px-4 py-2 md:py-3 bg-white text-primary font-paragraph font-semibold rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm md:text-base"
                      >
                        <Check size={16} className="md:w-[18px] md:h-[18px]" />
                        Guardar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditingDescription(false)}
                        className="flex-1 px-4 py-2 md:py-3 border-2 border-white text-white font-paragraph font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm md:text-base"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="font-paragraph text-white/90 leading-relaxed text-sm md:text-base lg:text-lg">
                    {description || 'Sin descripción. Haz clic en editar para agregar una.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info - Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {member?.loginEmail && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-2 md:p-4 bg-gradient-to-br from-primary to-secondary rounded-lg md:rounded-xl flex-shrink-0">
                  <Mail size={20} className="md:w-7 md:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs md:text-sm text-muted-text font-semibold">Email</p>
                  <p className="font-paragraph text-foreground font-bold text-sm md:text-lg truncate">{member.loginEmail}</p>
                </div>
              </motion.div>
            )}

            {member?.contact?.firstName && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-2 md:p-4 bg-gradient-to-br from-secondary to-support rounded-lg md:rounded-xl flex-shrink-0">
                  <User size={20} className="md:w-7 md:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs md:text-sm text-muted-text font-semibold">Nombre Completo</p>
                  <p className="font-paragraph text-foreground font-bold text-sm md:text-lg truncate">
                    {member.contact.firstName} {member.contact.lastName}
                  </p>
                </div>
              </motion.div>
            )}

            {member?._createdDate && (
              <motion.div
                whileHover={{ y: -6 }}
                className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-2 md:p-4 bg-gradient-to-br from-accent to-support2 rounded-lg md:rounded-xl flex-shrink-0">
                  <Calendar size={20} className="md:w-7 md:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-paragraph text-xs md:text-sm text-muted-text font-semibold">Miembro desde</p>
                  <p className="font-paragraph text-foreground font-bold text-sm md:text-lg">
                    {new Date(member._createdDate).toLocaleDateString('es-DO')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Verification Status Card */}
            <motion.div
              whileHover={{ y: -6 }}
              className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
            >
              {/* Animated background for verified status */}
              {verificationStatus === 'verificado' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent/5 to-support/5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className={`relative z-10 p-2 md:p-4 rounded-lg md:rounded-xl flex-shrink-0 ${
                verificationStatus === 'verificado' 
                  ? 'bg-gradient-to-br from-accent to-support' 
                  : verificationStatus === 'pendiente'
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-br from-muted-text to-border'
              }`}>
                {isLoadingVerification ? (
                  <Shield size={20} className="md:w-7 md:h-7 text-white animate-pulse" />
                ) : verificationStatus === 'verificado' ? (
                  <CheckCircle size={20} className="md:w-7 md:h-7 text-white" />
                ) : verificationStatus === 'pendiente' ? (
                  <AlertCircle size={20} className="md:w-7 md:h-7 text-white" />
                ) : (
                  <XCircle size={20} className="md:w-7 md:h-7 text-white" />
                )}
              </div>
              <div className="relative z-10 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-paragraph text-xs md:text-sm text-muted-text font-semibold">Estado de Verificación</p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-primary"
                  >
                    <RefreshCw size={12} className="md:w-4 md:h-4" />
                  </motion.div>
                </div>
                {isLoadingVerification ? (
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className={`font-paragraph font-bold text-sm md:text-lg ${
                      verificationStatus === 'verificado' 
                        ? 'text-accent' 
                        : verificationStatus === 'pendiente'
                        ? 'text-yellow-600'
                        : 'text-muted-text'
                    }`}>
                      {verificationStatus === 'verificado' 
                        ? 'Verificado' 
                        : verificationStatus === 'pendiente'
                        ? 'Pendiente'
                        : 'No Verificado'}
                    </p>
                    {verificationStatus === 'verificado' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <CheckCircle size={16} className="text-accent" />
                      </motion.div>
                    )}
                  </div>
                )}
                <p className="font-paragraph text-xs text-muted-text mt-1">
                  Actualizado: {lastUpdateTime.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Photo Upload Section - Enhanced */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl md:shadow-2xl overflow-hidden relative">
            {/* Decorative background */}
            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">Mi Galería de Fotos</h3>
              
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
                  className="mb-8 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border-2 border-primary/40"
                >
                  <div className="space-y-4">
                    {/* Preview Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-60 md:h-80 flex items-center justify-center shadow-lg">
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
                        className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmUpload}
                        disabled={isUploadingPhoto}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Check size={18} />
                        {isUploadingPhoto ? 'Subiendo...' : 'Confirmar y Subir'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelUpload}
                        disabled={isUploadingPhoto}
                        className="flex-1 px-4 py-3 border-2 border-primary/30 text-foreground font-paragraph font-bold rounded-xl hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border-3 border-dashed border-primary/40 hover:border-primary/60 transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-4 md:p-5 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg"
                    >
                      <Upload size={32} className="md:w-10 md:h-10 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-heading font-bold text-foreground mb-2 text-lg md:text-xl">Sube una foto a tu perfil</p>
                      <p className="font-paragraph text-sm md:text-base text-muted-text">Comparte momentos de tu trabajo y destaca tu portafolio</p>
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
                        className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-bold rounded-xl cursor-pointer hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
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
                    <h4 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">Mis Fotos ({profilePhotos.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {profilePhotos.map((photo, index) => (
                        <motion.div
                          key={photo._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white"
                        >
                          {/* Photo */}
                          <div className="relative h-56 md:h-72 bg-gray-200 overflow-hidden">
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
                                className="p-2 md:p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Heart size={20} className="md:w-6 md:h-6 text-red-500 fill-red-500" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeletePhoto(photo._id)}
                                className="p-2 md:p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={20} className="md:w-6 md:h-6 text-destructive" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3 md:p-4 bg-white">
                            <p className="font-paragraph text-xs md:text-sm text-foreground mb-3 line-clamp-2 font-semibold">
                              {photo.caption}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-red-50 px-2 md:px-3 py-1 rounded-full">
                                <Heart size={14} className="md:w-4 md:h-4 text-red-500 fill-red-500" />
                                <span className="font-paragraph text-xs md:text-sm font-bold text-red-500">
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
                <div className="text-center py-12 md:py-16">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4 p-4 bg-primary/10 rounded-full"
                  >
                    <Upload size={32} className="md:w-10 md:h-10 text-primary" />
                  </motion.div>
                  <p className="font-heading text-base md:text-lg font-bold text-foreground mb-2">Aún no has subido fotos</p>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">¡Sube tu primera foto para mostrar tu trabajo y destacar tu perfil!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ratings Section - Enhanced */}
          {userRatings.length > 0 && (
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-secondary/20 shadow-xl md:shadow-2xl">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">Calificaciones y Reseñas</h3>
              <div className="space-y-4">
                {userRatings.map((rating, index) => (
                  <motion.div
                    key={rating._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 md:p-6 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-xl md:rounded-2xl border-2 border-secondary/20 hover:border-secondary/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-foreground text-base md:text-lg">
                          {rating.reviewerIdentifier || 'Usuario anónimo'}
                        </p>
                        <p className="font-paragraph text-xs md:text-sm text-muted-text">
                          {rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString('es-DO') : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 bg-yellow-50 px-2 md:px-3 py-1 rounded-full flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`md:w-[18px] md:h-[18px] ${i < (rating.ratingValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-paragraph text-sm md:text-base text-foreground leading-relaxed">{rating.reviewText}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Section - For Joseadores */}
          {userRole === 'joseador' && (
            <div className="bg-gradient-to-r from-accent/10 to-support/10 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-accent/30 shadow-lg md:shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-accent to-support rounded-xl flex-shrink-0">
                  <CheckCircle size={24} className="md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Verificación de Joseador
                  </h3>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">
                    Completa tu verificación para acceder a más oportunidades de trabajo y aumentar tu credibilidad.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/joseador/verification')}
                className="w-full px-6 py-4 md:py-5 bg-gradient-to-r from-accent to-support text-white font-heading font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all text-base md:text-lg flex items-center justify-center gap-3"
              >
                <CheckCircle size={20} className="md:w-6 md:h-6" />
                Iniciar Proceso de Verificación
              </motion.button>
            </div>
          )}

          {/* Role Selection - Enhanced */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-lg md:shadow-xl">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">
              Cambiar Rol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('client');
                  window.location.href = '/client/dashboard';
                }}
                className="w-full px-6 py-4 md:py-6 bg-gradient-to-br from-primary to-secondary text-white font-heading font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
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
                className="w-full px-6 py-4 md:py-6 bg-gradient-to-br from-secondary to-accent text-white font-heading font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
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
              onClick={() => {
                const { clearAllUserData } = useRoleStore.getState();
                clearAllUserData();
                actions.logout();
              }}
              className="px-8 md:px-10 py-3 md:py-4 border-3 border-destructive text-destructive font-heading font-bold rounded-xl md:rounded-2xl hover:bg-destructive hover:text-white transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
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
