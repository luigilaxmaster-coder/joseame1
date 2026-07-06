import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  ArrowLeft, User, Mail, Calendar, Star, Upload, Trash2, Edit2, Check, AlertCircle,
  CheckCircle, Award, Clock, Phone, MapPin, Briefcase, FileText, Settings,
  LogOut, Grid3x3, Heart, MessageCircle, Share2, Lock, MoreHorizontal, Shield, Send, X,
  Zap, TrendingUp, Users, Eye, Camera, Save, Copy, ExternalLink, Loader, Sparkles, ImagePlus,
  Plus, ChevronRight, Palette, Layers, Target, Zap as ZapIcon
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { UserPhotos, UserRatings, RegisteredUsers, UserVerification, JoseadoresProfiles } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';
import { useSyncUser } from '@/lib/user-sync-hook';
import { WixMediaService } from '@/lib/wix-media-service';
import { BaseCrudService } from '@/integrations';

type TabType = 'overview' | 'gallery' | 'testimonials' | 'settings';

interface PhotoWithInteractions extends UserPhotos {
  likes: number;
  comments: Array<{ id: string; userId: string; userName: string; text: string; timestamp: Date }>;
  isLiked: boolean;
}

function ProfilePageRefactored() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    updateProfile,
    isUpdating: isProfileUpdating,
    updateError: profileUpdateError,
    uploadAvatar,
    isUploadingAvatar,
    uploadError: avatarUploadError,
    refetch: refetchProfile,
  } = useMyProfile();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  const [joseadorProfile, setJoseadorProfile] = useState<JoseadoresProfiles | null>(null);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUsers | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('Pendiente');
  const [userBadges, setUserBadges] = useState<string[]>([]);

  const [userPhotos, setUserPhotos] = useState<PhotoWithInteractions[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const maxCaptionLength = 300;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    cityZone: '',
    mainCategory: '',
    yearsOfExperience: 0,
    basePriceEstimate: 0,
    availability: '',
    preferredContactMethod: ''
  });

  useSyncUser();

  useEffect(() => {
    loadAdditionalData();
  }, [member?.loginEmail]);

  useEffect(() => {
    if (profile) {
      setEditFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    setIsLoading(isProfileLoading);
  }, [isProfileLoading]);

  useEffect(() => {
    if (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Error loading profile');
    }
    if (profileUpdateError) {
      setError(profileUpdateError instanceof Error ? profileUpdateError.message : 'Error updating profile');
    }
    if (avatarUploadError) {
      setError(avatarUploadError instanceof Error ? avatarUploadError.message : 'Error uploading avatar');
    }
  }, [profileError, profileUpdateError, avatarUploadError]);

  const loadAdditionalData = async () => {
    if (!member?.loginEmail) return;

    try {
      const { items: photos } = await BaseCrudService.getAll<UserPhotos>('userphotos');
      const userPhotosList = photos.filter(p => p.memberId === member.loginEmail);
      const photosWithInteractions: PhotoWithInteractions[] = userPhotosList.map(photo => ({
        ...photo,
        likes: 0,
        comments: [],
        isLiked: false
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setUserPhotos(photosWithInteractions);

      const { items: ratings } = await BaseCrudService.getAll<UserRatings>('userratings');
      const userRatingsList = ratings.filter(r => r.ratedUserIdentifier === member.loginEmail);
      setUserRatings(userRatingsList);
      if (userRatingsList.length > 0) {
        const avg = userRatingsList.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / userRatingsList.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      if (userRole === 'joseador') {
        const { items: joseadorProfiles } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores');
        const userJoseadorProfile = joseadorProfiles.find(p => p.userId === member.loginEmail);
        if (userJoseadorProfile) {
          setJoseadorProfile(userJoseadorProfile);
          setEditFormData(prev => ({
            ...prev,
            phoneNumber: userJoseadorProfile.phoneNumber || '',
            cityZone: userJoseadorProfile.cityZone || '',
            mainCategory: userJoseadorProfile.mainCategory || '',
            yearsOfExperience: userJoseadorProfile.yearsOfExperience || 0,
            basePriceEstimate: userJoseadorProfile.basePriceEstimate || 0,
            availability: userJoseadorProfile.availability || '',
            preferredContactMethod: userJoseadorProfile.preferredContactMethod || ''
          }));
        }
      }

      const { items: users } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
      const currentUser = users.find(u => u.email === member.loginEmail);
      if (currentUser) {
        setRegisteredUser(currentUser);

        const { items: verificationItems } = await BaseCrudService.getAll<UserVerification>('userverification');
        const userVerification = verificationItems.find(v => v.joseadorId === currentUser.userId);
        setVerificationStatus(userVerification?.isVerified ? 'Aprobado' : 'Pendiente');

        if (currentUser.badges) {
          try {
            const badgesArray = currentUser.badges.split(',').map(b => b.trim()).filter(b => b);
            setUserBadges(badgesArray);
          } catch (e) {
            console.error('Error parsing badges:', e);
            setUserBadges([]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading additional data:', err);
    }
  };

  const handleAvatarSelect = async (file: File) => {
    if (!file || !member?.loginEmail) {
      setError('Por favor, selecciona un archivo y asegúrate de estar autenticado.');
      return;
    }

    if (!isValidImageFile(file)) {
      setError('Por favor, sube una imagen válida (JPEG, PNG, GIF o WebP).');
      return;
    }

    setError('');

    try {
      const preview = await createPreviewUrl(file);
      if (!preview) throw new Error('No se pudo crear la vista previa de la imagen');
      setAvatarPreviewUrl(preview);
      setAvatarFile(file);
    } catch (err) {
      console.error('Error in handleAvatarSelect:', err);
      setError(getUploadErrorMessage(err));
    }
  };

  const handleConfirmAvatarUpload = async () => {
    if (!avatarFile || !member?.loginEmail || !avatarPreviewUrl) {
      setError('Error: Faltan datos necesarios para subir el avatar.');
      return;
    }

    try {
      if (!isValidImageFile(avatarFile)) {
        throw new Error('El archivo no es válido.');
      }

      const result = await new Promise<any>((resolve, reject) => {
        uploadAvatar(avatarFile, {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        });
      });

      if (result) {
        setAvatarPreviewUrl('');
        setAvatarFile(null);
        setError('');
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        await refetchProfile();
      }
    } catch (err) {
      console.error('Error in handleConfirmAvatarUpload:', err);
      setError(getUploadErrorMessage(err));
    }
  };

  const handleCancelAvatarUpload = () => {
    setAvatarPreviewUrl('');
    setAvatarFile(null);
    setError('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleUploadPhoto = async (file: File) => {
    if (!file || !member?.loginEmail) {
      setError('Por favor, selecciona un archivo y asegúrate de estar autenticado.');
      return;
    }

    if (!isValidImageFile(file)) {
      setError('Por favor, sube una imagen válida (JPEG, PNG, GIF o WebP).');
      return;
    }

    setError('');
    setIsUploadingPhoto(true);

    try {
      const preview = await createPreviewUrl(file);
      if (!preview) throw new Error('No se pudo crear la vista previa de la imagen');
      setPreviewUrl(preview);
      setSelectedFile(file);
    } catch (err) {
      console.error('Error in handleUploadPhoto:', err);
      setError(getUploadErrorMessage(err));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !member?.loginEmail || !previewUrl) {
      setError('Error: Faltan datos necesarios para subir la foto.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      if (!isValidImageFile(selectedFile)) {
        throw new Error('El archivo no es válido.');
      }

      const uploadResponse = await WixMediaService.uploadImage(selectedFile, member.loginEmail);

      const photoId = crypto.randomUUID();
      const photoData: UserPhotos = {
        _id: photoId,
        memberId: member.loginEmail,
        photoUrl: uploadResponse.url,
        caption: photoCaption || undefined,
        createdAt: new Date().toISOString(),
        type: 'portfolio',
        altText: photoCaption || 'Portfolio photo',
        fileSize: selectedFile.size
      };

      await BaseCrudService.create('userphotos', photoData);

      setPhotoCaption('');
      setPreviewUrl('');
      setSelectedFile(null);
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadAdditionalData();
    } catch (err) {
      console.error('Error in handleConfirmUpload:', err);
      setError(getUploadErrorMessage(err));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    setPhotoCaption('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async () => {
    if (!member?.loginEmail || !profile) return;

    try {
      await updateProfile({
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        bio: editFormData.bio,
      });

      if (userRole === 'joseador' && joseadorProfile) {
        await BaseCrudService.update('joseadores', {
          _id: joseadorProfile._id,
          phoneNumber: editFormData.phoneNumber,
          cityZone: editFormData.cityZone,
          mainCategory: editFormData.mainCategory,
          yearsOfExperience: editFormData.yearsOfExperience,
          basePriceEstimate: editFormData.basePriceEstimate,
          availability: editFormData.availability,
          preferredContactMethod: editFormData.preferredContactMethod
        });
      }

      setIsEditingProfile(false);
      await refetchProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error al guardar los cambios.');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await BaseCrudService.delete('userphotos', photoId);
      await loadAdditionalData();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Error al eliminar la foto.');
    }
  };

  const handleLikePhoto = (photoId: string) => {
    setUserPhotos(prev => prev.map(photo => {
      if (photo._id === photoId) {
        return {
          ...photo,
          isLiked: !photo.isLiked,
          likes: photo.isLiked ? photo.likes - 1 : photo.likes + 1
        };
      }
      return photo;
    }));
  };

  const getBackButtonPath = () => {
    if (userRole === 'client') return '/client/dashboard';
    if (userRole === 'joseador') return '/joseador/dashboard';
    return '/';
  };

  const getRelativeTime = (date: Date | string | undefined) => {
    if (!date) return 'Hace poco';
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return postDate.toLocaleDateString('es-DO');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="p-4 bg-primary/10 rounded-full"
        >
          <Loader size={40} className="text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(getBackButtonPath())}
            className="inline-flex items-center gap-2 transition-all font-paragraph font-semibold text-sm md:text-base h-11 px-4 rounded-lg text-muted-text hover:text-primary hover:bg-primary/5"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver</span>
          </motion.button>

          <h1 className="font-heading font-bold text-xl md:text-2xl text-foreground">Mi Perfil</h1>

          <div className="w-11" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-0"
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 md:mx-8 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-paragraph text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Hero Section - Centered Layout */}
          <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
            <div className="max-w-2xl mx-auto text-center space-y-12">
              {/* Avatar */}
              <motion.div whileHover={{ scale: 1.02 }} className="relative group">
                <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto">
                  {avatarPreviewUrl ? (
                    <Image
                      src={avatarPreviewUrl}
                      alt="Vista previa del avatar"
                      className="w-full h-full rounded-2xl object-cover border-2 border-border"
                      width={224}
                    />
                  ) : profile?.profilePhoto ? (
                    <Image
                      src={profile.profilePhoto}
                      alt={profile.firstName || 'Usuario'}
                      className="w-full h-full rounded-2xl object-cover border-2 border-border"
                      width={224}
                    />
                  ) : member?.profile?.photo?.url ? (
                    <Image
                      src={member.profile.photo.url}
                      alt={member.profile.nickname || 'Usuario'}
                      className="w-full h-full rounded-2xl object-cover border-2 border-border"
                      width={224}
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center border-2 border-border">
                      <User size={80} className="text-primary/40" />
                    </div>
                  )}

                  {/* Camera Button */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Camera size={20} />
                  </motion.button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])}
                    className="hidden"
                  />

                  {/* Verification Badge */}
                  {verificationStatus === 'Aprobado' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 bg-accent rounded-full p-2 border-2 border-white"
                    >
                      <CheckCircle size={24} className="text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Name & Bio */}
              <div className="space-y-4">
                <div>
                  <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    {profile?.firstName || member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                  </h1>
                  {profile?.lastName && (
                    <p className="font-heading text-xl md:text-2xl font-semibold text-muted-text mt-2">
                      {profile.lastName}
                    </p>
                  )}
                </div>
                {profile?.bio && (
                  <p className="font-paragraph text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Badges */}
              {userBadges.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {userBadges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full"
                    >
                      <Sparkles size={16} className="text-amber-600" />
                      <span className="font-paragraph text-sm font-bold text-amber-900">{badge}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 bg-background rounded-lg border border-border text-center"
                >
                  <p className="font-paragraph text-xs text-muted-text mb-1">Trabajos</p>
                  <p className="font-heading text-2xl font-bold text-primary">{userPhotos.length}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 bg-background rounded-lg border border-border text-center"
                >
                  <p className="font-paragraph text-xs text-muted-text mb-1">Reseñas</p>
                  <p className="font-heading text-2xl font-bold text-secondary">{userRatings.length}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 bg-background rounded-lg border border-border text-center"
                >
                  <p className="font-paragraph text-xs text-muted-text mb-1">Calificación</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-heading text-2xl font-bold text-accent">
                      {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                    </p>
                    {averageRating > 0 && <Star size={16} className="text-accent fill-accent" />}
                  </div>
                </motion.div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-6 border-t border-border">
                {member?.loginEmail && (
                  <motion.div whileHover={{ x: 2 }} className="flex items-center justify-center gap-2">
                    <Mail size={16} className="text-primary flex-shrink-0" />
                    <p className="font-paragraph text-sm text-foreground/70">{member.loginEmail}</p>
                  </motion.div>
                )}
                {member?._createdDate && (
                  <motion.div whileHover={{ x: 2 }} className="flex items-center justify-center gap-2">
                    <Calendar size={16} className="text-primary flex-shrink-0" />
                    <p className="font-paragraph text-sm text-foreground/70">
                      Miembro desde {new Date(member._createdDate).toLocaleDateString('es-DO')}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Upload Preview */}
          {avatarPreviewUrl && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 md:mx-8 mb-8 p-6 md:p-8 bg-background border border-border rounded-2xl"
            >
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Camera size={28} className="text-primary" />
                Cambiar Avatar
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative rounded-2xl overflow-hidden bg-background w-40 h-40 md:w-56 md:h-56 flex-shrink-0 border border-border">
                    <Image
                      src={avatarPreviewUrl}
                      alt="Vista previa del avatar"
                      className="w-full h-full object-cover"
                      width={224}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="font-paragraph text-base text-foreground/70">
                      Vista previa de tu nuevo avatar. Confirma para guardar los cambios.
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="flex-1 px-6 py-3 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        {isUploadingAvatar ? 'Guardando...' : 'Confirmar'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="flex-1 px-6 py-3 border-2 border-border text-foreground font-paragraph font-bold rounded-lg hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-border bg-white sticky top-[73px] z-40">
            <div className="max-w-[100rem] mx-auto px-4 md:px-8 flex justify-start md:justify-center gap-1 md:gap-8 overflow-x-auto">
              {(['overview', 'gallery', 'testimonials', 'settings'] as TabType[]).map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-3 md:px-5 font-paragraph font-semibold text-sm md:text-base transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-text hover:text-foreground'
                  }`}
                >
                  {tab === 'overview' && <span className="flex items-center gap-2"><User size={16} /> Resumen</span>}
                  {tab === 'gallery' && <span className="flex items-center gap-2"><Grid3x3 size={16} /> Galería</span>}
                  {tab === 'testimonials' && <span className="flex items-center gap-2"><Star size={16} /> Testimonios</span>}
                  {tab === 'settings' && <span className="flex items-center gap-2"><Settings size={16} /> Configuración</span>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-8 py-8 md:py-12"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {isEditingProfile ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 p-8 bg-background border border-border rounded-2xl"
                    >
                      <h3 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
                        <Edit2 size={28} className="text-primary" />
                        Editar Perfil
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Nombre</label>
                          <input
                            type="text"
                            value={editFormData.firstName}
                            onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                            placeholder="Tu nombre"
                            className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Apellido</label>
                          <input
                            type="text"
                            value={editFormData.lastName}
                            onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                            placeholder="Tu apellido"
                            className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Biografía</label>
                        <textarea
                          value={editFormData.bio}
                          onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                          placeholder="Cuéntanos sobre ti..."
                          rows={4}
                          className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        />
                      </div>

                      {userRole === 'joseador' && (
                        <>
                          <div className="pt-6 border-t border-border">
                            <h4 className="font-heading text-lg font-bold text-foreground mb-4">Información Profesional</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Teléfono</label>
                                <input
                                  type="text"
                                  value={editFormData.phoneNumber}
                                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                  placeholder="+1 (555) 000-0000"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Zona/Ciudad</label>
                                <input
                                  type="text"
                                  value={editFormData.cityZone}
                                  onChange={(e) => setEditFormData({ ...editFormData, cityZone: e.target.value })}
                                  placeholder="Tu zona o ciudad"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Especialidad</label>
                                <input
                                  type="text"
                                  value={editFormData.mainCategory}
                                  onChange={(e) => setEditFormData({ ...editFormData, mainCategory: e.target.value })}
                                  placeholder="Tu especialidad principal"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Años de Experiencia</label>
                                <input
                                  type="number"
                                  value={editFormData.yearsOfExperience}
                                  onChange={(e) => setEditFormData({ ...editFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                  placeholder="0"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Precio Base</label>
                                <input
                                  type="number"
                                  value={editFormData.basePriceEstimate}
                                  onChange={(e) => setEditFormData({ ...editFormData, basePriceEstimate: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">Disponibilidad</label>
                                <input
                                  type="text"
                                  value={editFormData.availability}
                                  onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                                  placeholder="Ej: Lunes a Viernes"
                                  className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-3 pt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={isProfileUpdating}
                          className="flex-1 px-6 py-3 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Check size={18} />
                          {isProfileUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 px-6 py-3 border-2 border-border text-foreground font-paragraph font-bold rounded-lg hover:bg-background transition-all"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full px-6 py-4 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <Edit2 size={20} />
                      Editar Perfil
                    </motion.button>
                  )}

                  {/* Verification Status */}
                  {userRole === 'joseador' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                        <CheckCircle size={28} className="text-secondary" />
                        Estado de Verificación
                      </h3>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                          verificationStatus === 'Aprobado'
                            ? 'bg-accent/10 border-accent'
                            : 'bg-secondary/10 border-secondary'
                        }`}
                      >
                        {verificationStatus === 'Aprobado' ? (
                          <CheckCircle size={24} className="text-accent flex-shrink-0" />
                        ) : (
                          <Clock size={24} className="text-secondary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-heading font-bold text-foreground text-sm">Estado Actual</p>
                          <p className={`font-paragraph text-sm font-semibold ${
                            verificationStatus === 'Aprobado' ? 'text-accent' : 'text-secondary'
                          }`}>
                            {verificationStatus === 'Aprobado' ? '✓ Verificado' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-8 py-8 md:py-12"
              >
                <div className="space-y-8">
                  {/* Upload Section */}
                  {previewUrl ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 bg-background border border-border rounded-2xl"
                    >
                      <h3 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <Upload size={28} className="text-primary" />
                        Publicar Trabajo
                      </h3>
                      <div className="space-y-6">
                        <div className="relative rounded-2xl overflow-hidden bg-background h-72 md:h-96 flex items-center justify-center border border-border">
                          <Image
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            width={500}
                          />
                        </div>

                        <div>
                          <label className="block font-heading text-lg font-bold text-foreground mb-3">
                            Descripción del Trabajo
                          </label>
                          <textarea
                            value={photoCaption}
                            onChange={(e) => setPhotoCaption(e.target.value.slice(0, maxCaptionLength))}
                            placeholder="Describe tu trabajo, técnicas utilizadas, materiales, tiempo invertido..."
                            maxLength={maxCaptionLength}
                            rows={4}
                            className="w-full px-4 py-3 border border-border rounded-lg font-paragraph text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                          <p className="font-paragraph text-xs text-muted-text mt-2">
                            {photoCaption.length}/{maxCaptionLength}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmUpload}
                            disabled={isUploadingPhoto}
                            className="flex-1 px-6 py-3 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={18} />
                            {isUploadingPhoto ? 'Subiendo...' : 'Publicar Trabajo'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCancelUpload}
                            disabled={isUploadingPhoto}
                            className="flex-1 px-6 py-3 border-2 border-border text-foreground font-paragraph font-bold rounded-lg hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-12 md:p-16 bg-background border-2 border-dashed border-primary/30 rounded-2xl hover:border-primary/50 transition-all hover:shadow-sm">
                      <div className="flex flex-col items-center gap-6">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-6 md:p-8 bg-primary/10 rounded-full"
                        >
                          <ImagePlus size={48} className="text-primary" />
                        </motion.div>
                        <div className="text-center">
                          <p className="font-heading font-bold text-foreground mb-2 text-2xl md:text-3xl">Comparte tu Trabajo</p>
                          <p className="font-paragraph text-base md:text-lg text-muted-text mb-6">Sube fotos de tus proyectos y destaca tu portafolio profesional</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadPhoto(e.target.files[0])}
                          className="hidden"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-8 py-3 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Seleccionar Imagen
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Photos Grid */}
                  {userPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPhotos.map((photo, index) => (
                        <motion.div
                          key={photo._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="relative aspect-square overflow-hidden bg-background">
                            <Image
                              src={photo.photoUrl || ''}
                              alt={photo.altText || 'Foto'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              width={400}
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLikePhoto(photo._id)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Heart
                                  size={24}
                                  className={photo.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                                />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeletePhoto(photo._id)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={24} className="text-red-600" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              {member?.profile?.photo?.url ? (
                                <Image
                                  src={member.profile.photo.url}
                                  alt={member.profile.nickname || 'Usuario'}
                                  className="w-10 h-10 rounded-full object-cover"
                                  width={40}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User size={18} className="text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-heading font-semibold text-sm text-foreground">
                                  {member?.profile?.nickname || 'Usuario'}
                                </p>
                                <p className="font-paragraph text-xs text-muted-text">
                                  {getRelativeTime(photo.createdAt)}
                                </p>
                              </div>
                            </div>

                            {photo.caption && (
                              <p className="font-paragraph text-sm text-foreground/70 line-clamp-2 bg-background p-3 rounded-lg border border-border">
                                {photo.caption}
                              </p>
                            )}

                            <div className="flex items-center gap-4 pt-3 border-t border-border">
                              <button
                                onClick={() => handleLikePhoto(photo._id)}
                                className="flex items-center gap-2 text-sm font-paragraph font-semibold text-muted-text hover:text-primary transition-colors"
                              >
                                <Heart
                                  size={18}
                                  className={photo.isLiked ? 'fill-red-500 text-red-500' : ''}
                                />
                                <span>{photo.likes}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 md:py-28">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block mb-6 p-6 bg-primary/10 rounded-full"
                      >
                        <Grid3x3 size={48} className="text-primary" />
                      </motion.div>
                      <p className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">Sin trabajos publicados</p>
                      <p className="font-paragraph text-base md:text-lg text-muted-text">¡Sube tu primer trabajo para comenzar a construir tu portafolio!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-8 py-8 md:py-12"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {userRatings.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Star size={28} className="text-yellow-500" />
                        Reseñas ({userRatings.length})
                      </h3>
                      <div className="space-y-3">
                        {userRatings.map((rating, index) => (
                          <motion.div
                            key={rating._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-background border border-border rounded-lg hover:border-yellow-500/50 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between mb-2 gap-4">
                              <div className="min-w-0">
                                <p className="font-heading font-bold text-foreground text-sm">
                                  {rating.reviewerIdentifier || 'Usuario'}
                                </p>
                                <p className="font-paragraph text-xs text-muted-text">
                                  {rating.ratingDate ? new Date(rating.ratingDate).toLocaleDateString('es-DO') : ''}
                                </p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < (rating.ratingValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="font-paragraph text-sm text-foreground/70">{rating.reviewText}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 md:py-24">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block mb-4 p-4 bg-yellow-500/10 rounded-full"
                      >
                        <Star size={40} className="md:w-12 md:h-12 text-yellow-500" />
                      </motion.div>
                      <p className="font-heading text-lg md:text-xl font-bold text-foreground mb-2">Sin reseñas aún</p>
                      <p className="font-paragraph text-sm md:text-base text-muted-text">Completa trabajos para recibir reseñas de tus clientes</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-8 py-8 md:py-12"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Role Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 p-8 bg-background border border-border rounded-2xl"
                  >
                    <h3 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
                      <Users size={32} className="text-primary" />
                      Cambiar Rol
                    </h3>
                    <p className="font-paragraph text-foreground/70 text-base">Cambia entre tu rol de cliente y joseador</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('client');
                          window.location.href = '/client/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-primary text-white font-heading font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 text-lg"
                      >
                        <Users size={22} />
                        Dashboard Cliente
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('joseador');
                          window.location.href = '/joseador/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-secondary text-white font-heading font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 text-lg"
                      >
                        <Briefcase size={22} />
                        Dashboard Joseador
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Verification Section */}
                  {userRole === 'joseador' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Shield size={28} className="text-accent" />
                        Verificación
                      </h3>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                          verificationStatus === 'Aprobado'
                            ? 'bg-accent/10 border-accent'
                            : 'bg-secondary/10 border-secondary'
                        }`}
                      >
                        {verificationStatus === 'Aprobado' ? (
                          <CheckCircle size={24} className="text-accent flex-shrink-0" />
                        ) : (
                          <Clock size={24} className="text-secondary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-heading font-bold text-foreground text-sm">Estado de Verificación</p>
                          <p className={`font-paragraph text-sm font-semibold ${
                            verificationStatus === 'Aprobado' ? 'text-accent' : 'text-secondary'
                          }`}>
                            {verificationStatus === 'Aprobado' ? '✓ Verificado' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/joseador/verification')}
                        className="w-full px-6 py-3 bg-accent text-white font-heading font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Iniciar Verificación
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Admin Access */}
                  {registeredUser?.role === 'Admin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Shield size={28} className="text-primary" />
                        Panel de Administración
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full px-6 py-3 bg-primary text-white font-heading font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Shield size={20} />
                        Ir al Panel Admin
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Logout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-8 border-t border-border"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const { clearAllUserData } = useRoleStore.getState();
                        clearAllUserData();
                        actions.logout();
                      }}
                      className="w-full px-6 py-4 border-2 border-red-500 text-red-600 font-heading font-bold rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <LogOut size={22} />
                      Cerrar Sesión
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePageRefactored;
