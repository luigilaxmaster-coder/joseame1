import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import {
  ArrowLeft, User, Mail, Calendar, Star, Upload, Trash2, Edit2, Check, AlertCircle,
  CheckCircle, Award, Clock, Phone, MapPin, Briefcase, FileText, Settings,
  LogOut, Grid3x3, Heart, MessageCircle, Share2, Lock, MoreHorizontal, Shield, Send, X,
  Zap, TrendingUp, Users, Eye
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { UserProfiles, UserPhotos, UserRatings, RegisteredUsers, UserVerification, JoseadoresProfiles } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';
import { useSyncUser } from '@/lib/user-sync-hook';
import { WixMediaService } from '@/lib/wix-media-service';
import { PortfolioUploaderBasic } from '@/components/PortfolioUploaderBasic';

type TabType = 'portfolio' | 'about' | 'settings';

interface PhotoComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

interface PhotoWithInteractions extends UserPhotos {
  likes: number;
  comments: PhotoComment[];
  isLiked: boolean;
}

function ProfilePage() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userProfile, setUserProfile] = useState<UserProfiles | null>(null);
  const [userPhotos, setUserPhotos] = useState<PhotoWithInteractions[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [joseadorProfile, setJoseadorProfile] = useState<JoseadoresProfiles | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('Pendiente');
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [registeredUserRole, setRegisteredUserRole] = useState<string>('');

  // Upload & Preview State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [captionCharCount, setCaptionCharCount] = useState(0);
  const maxCaptionLength = 300;

  // Comments State
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<Set<string>>(new Set());

  // Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);

  // Form Data
  const [overviewData, setOverviewData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });

  const [editFormData, setEditFormData] = useState({
    phoneNumber: '',
    cityZone: '',
    mainCategory: '',
    yearsOfExperience: 0,
    basePriceEstimate: 0,
    availability: '',
    preferredContactMethod: ''
  });

  useSyncUser();

  const getBackButtonPath = () => {
    if (userRole === 'client') return '/client/dashboard';
    if (userRole === 'joseador') return '/joseador/dashboard';
    return '/';
  };

  // Load all profile data
  useEffect(() => {
    loadProfileData();
    const intervalId = setInterval(() => {
      loadUserDataFromAdmin();
    }, 2000);
    return () => clearInterval(intervalId);
  }, [member?.loginEmail]);

  const loadProfileData = async () => {
    if (!member?.loginEmail) return;

    try {
      // Load UserProfiles
      const { items: profiles } = await BaseCrudService.getAll<UserProfiles>('userprofiles');
      const userProf = profiles.find(p => p.memberId === member.loginEmail);
      if (userProf) {
        setUserProfile(userProf);
        setOverviewData({
          firstName: userProf.firstName || '',
          lastName: userProf.lastName || '',
          bio: ''
        });
      }

      // Load UserPhotos
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

      // Load ratings
      const { items: ratings } = await BaseCrudService.getAll<UserRatings>('userratings');
      const userRatingsList = ratings.filter(r => r.ratedUserIdentifier === member.loginEmail);
      setUserRatings(userRatingsList);
      if (userRatingsList.length > 0) {
        const avg = userRatingsList.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / userRatingsList.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      // Load joseador profile if applicable
      if (userRole === 'joseador') {
        const { items: joseadorProfiles } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores');
        const userJoseadorProfile = joseadorProfiles.find(p => p.userId === member.loginEmail);
        if (userJoseadorProfile) {
          setJoseadorProfile(userJoseadorProfile);
          setEditFormData({
            phoneNumber: userJoseadorProfile.phoneNumber || '',
            cityZone: userJoseadorProfile.cityZone || '',
            mainCategory: userJoseadorProfile.mainCategory || '',
            yearsOfExperience: userJoseadorProfile.yearsOfExperience || 0,
            basePriceEstimate: userJoseadorProfile.basePriceEstimate || 0,
            availability: userJoseadorProfile.availability || '',
            preferredContactMethod: userJoseadorProfile.preferredContactMethod || ''
          });
        }
      }

      await loadUserDataFromAdmin();
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadUserDataFromAdmin = async () => {
    if (!member?.loginEmail) return;

    try {
      const { items: users } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
      const currentUser = users.find(u => u.email === member.loginEmail);

      if (currentUser && currentUser.userId) {
        const { items: verificationItems } = await BaseCrudService.getAll<UserVerification>('userverification');
        const userVerification = verificationItems.find(v => v.joseadorId === currentUser.userId);

        const verificationStatusValue = userVerification?.isVerified ? 'Aprobado' : 'Pendiente';
        setVerificationStatus(verificationStatusValue);

        if (currentUser.badges) {
          const badgesArray = currentUser.badges.split(',').map(b => b.trim()).filter(b => b);
          setUserBadges(badgesArray);
        } else {
          setUserBadges([]);
        }

        setRegisteredUserRole(currentUser.role || '');
      }
    } catch (error) {
      console.error('Error loading user data from admin:', error);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!file || !member?.loginEmail) {
      setUploadError('Por favor, selecciona un archivo y asegúrate de estar autenticado.');
      return;
    }

    if (!isValidImageFile(file)) {
      setUploadError('Por favor, sube una imagen válida (JPEG, PNG, GIF o WebP) de menos de 10MB.');
      return;
    }

    setUploadError('');
    setIsUploadingPhoto(true);

    try {
      const preview = await createPreviewUrl(file);
      if (!preview) throw new Error('No se pudo crear la vista previa de la imagen');
      setPreviewUrl(preview);
      setSelectedFile(file);
    } catch (error) {
      console.error('Error in handleUploadPhoto:', error);
      setUploadError(getUploadErrorMessage(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !member?.loginEmail || !previewUrl) {
      setUploadError('Error: Faltan datos necesarios para subir la foto.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      if (!isValidImageFile(selectedFile)) {
        throw new Error('El archivo no es válido.');
      }

      // Upload to Wix Media Manager
      const uploadResponse = await WixMediaService.uploadImage(selectedFile, member.loginEmail);

      // Save to UserPhotos collection
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
      setCaptionCharCount(0);
      setPreviewUrl('');
      setSelectedFile(null);
      setUploadError('');
      if (fileInputRef.current) fileInputRef.current.value = '';

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
    setCaptionCharCount(0);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, maxCaptionLength);
    setPhotoCaption(text);
    setCaptionCharCount(text.length);
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

  const toggleComments = (photoId: string) => {
    const newShowComments = new Set(showComments);
    if (newShowComments.has(photoId)) {
      newShowComments.delete(photoId);
    } else {
      newShowComments.add(photoId);
    }
    setShowComments(newShowComments);
  };

  const handleAddComment = (photoId: string) => {
    if (!commentText.trim() || !member?.profile?.nickname) return;

    setUserPhotos(prev => prev.map(photo => {
      if (photo._id === photoId) {
        return {
          ...photo,
          comments: [
            ...photo.comments,
            {
              id: crypto.randomUUID(),
              userId: member.loginEmail || '',
              userName: member.profile?.nickname || 'Usuario',
              text: commentText,
              timestamp: new Date()
            }
          ]
        };
      }
      return photo;
    }));
    setCommentText('');
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

  const handleSaveProfileOverview = async () => {
    if (!member?.loginEmail) return;

    try {
      if (userProfile) {
        await BaseCrudService.update('userprofiles', {
          _id: userProfile._id,
          firstName: overviewData.firstName,
          lastName: overviewData.lastName
        });
      } else {
        const profileId = crypto.randomUUID();
        await BaseCrudService.create('userprofiles', {
          _id: profileId,
          memberId: member.loginEmail,
          firstName: overviewData.firstName,
          lastName: overviewData.lastName,
          profilePhoto: member.profile?.photo?.url || '',
          updatedAt: new Date().toISOString()
        });
      }

      setIsEditingOverview(false);
      await loadProfileData();
    } catch (error) {
      console.error('Error saving profile overview:', error);
      setUploadError('Error al guardar los cambios.');
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!joseadorProfile) return;

    try {
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

      setIsEditingProfile(false);
      await loadProfileData();
    } catch (error) {
      console.error('Error saving profile changes:', error);
      setUploadError('Error al guardar los cambios.');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await BaseCrudService.delete('userphotos', photoId);
      await loadProfileData();
    } catch (error) {
      console.error('Error deleting photo:', error);
      setUploadError('Error al eliminar la foto.');
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(getBackButtonPath())}
            className="inline-flex items-center gap-2 transition-all font-paragraph font-semibold text-sm md:text-base h-10 px-3 rounded-lg text-muted-text hover:text-primary hover:bg-primary/10"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <h1 className="font-heading font-bold text-lg md:text-xl text-foreground">Mi Perfil</h1>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <MoreHorizontal size={20} className="text-foreground" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-0"
        >
          {/* Profile Header - Enhanced Design */}
          <div className="relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 h-32 md:h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 pointer-events-none" />
            
            <div className="relative px-4 md:px-6 py-8 md:py-12">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end">
                {/* Profile Picture with Badge */}
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  className="flex-shrink-0 relative"
                >
                  <div className="relative">
                    {member?.profile?.photo?.url ? (
                      <Image
                        src={member.profile.photo.url}
                        alt={member.profile.nickname || 'Usuario'}
                        className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-white shadow-2xl"
                        width={192}
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shadow-2xl border-4 border-white">
                        <User size={80} className="md:w-32 md:h-32 text-primary" />
                      </div>
                    )}
                    {verificationStatus === 'Aprobado' && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 bg-accent rounded-full p-2 border-4 border-white shadow-lg"
                      >
                        <CheckCircle size={24} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
                        {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                      </h1>
                      {!isEditingOverview && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditingOverview(true)}
                          className="w-fit px-6 py-2 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Editar
                        </motion.button>
                      )}
                    </div>

                    {member?.profile?.title && (
                      <p className="font-paragraph text-base md:text-lg text-secondary font-semibold">
                        {member.profile.title}
                      </p>
                    )}
                  </div>

                  {/* Stats - Enhanced */}
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="p-3 md:p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="font-heading font-bold text-2xl md:text-3xl text-primary">
                        {userPhotos.length}
                      </p>
                      <p className="font-paragraph text-xs md:text-sm text-muted-text">Trabajos</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="p-3 md:p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="font-heading font-bold text-2xl md:text-3xl text-secondary">
                        {userRatings.length}
                      </p>
                      <p className="font-paragraph text-xs md:text-sm text-muted-text">Reseñas</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="p-3 md:p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="font-heading font-bold text-2xl md:text-3xl text-accent">
                        {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                      </p>
                      <p className="font-paragraph text-xs md:text-sm text-muted-text">Calificación</p>
                    </motion.div>
                  </div>

                  {/* Bio Section */}
                  {isEditingOverview ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 mt-6 p-4 bg-white rounded-xl border-2 border-primary/30"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={overviewData.firstName}
                          onChange={(e) => setOverviewData({ ...overviewData, firstName: e.target.value })}
                          className="px-4 py-3 border-2 border-primary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          value={overviewData.lastName}
                          onChange={(e) => setOverviewData({ ...overviewData, lastName: e.target.value })}
                          className="px-4 py-3 border-2 border-primary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Apellido"
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfileOverview}
                          className="flex-1 px-4 py-2 bg-primary text-white font-paragraph font-bold rounded-lg hover:shadow-lg transition-all"
                        >
                          Guardar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingOverview(false)}
                          className="flex-1 px-4 py-2 border-2 border-primary/30 text-foreground font-paragraph font-bold rounded-lg hover:bg-primary/5 transition-all"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="font-paragraph text-foreground text-sm md:text-base leading-relaxed mt-4">
                      {overviewData.firstName || member?.contact?.firstName} {overviewData.lastName || member?.contact?.lastName}
                    </p>
                  )}

                  {/* Badges */}
                  {userBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {userBadges.map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                          <Award size={16} className="text-white" />
                          <span className="font-paragraph text-sm font-bold text-white">{badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Enhanced */}
          <div className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-16 z-40">
            <div className="max-w-[100rem] mx-auto px-4 md:px-6 flex justify-start md:justify-center gap-2 md:gap-8 overflow-x-auto">
              {(['portfolio', 'about', 'settings'] as TabType[]).map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 md:px-4 font-paragraph font-semibold text-sm md:text-base transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-text hover:text-foreground'
                  }`}
                >
                  {tab === 'portfolio' && <span className="flex items-center gap-2"><Grid3x3 size={16} /> Portafolio</span>}
                  {tab === 'about' && <span className="flex items-center gap-2"><User size={16} /> Acerca de</span>}
                  {tab === 'settings' && <span className="flex items-center gap-2"><Settings size={16} /> Configuración</span>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Portfolio Tab - Enhanced Gallery */}
            {activeTab === 'portfolio' && (
              <motion.div key="portfolio" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                {/* Upload Section - Enhanced */}
                <div className="mb-12">
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                      <p className="font-paragraph text-sm text-destructive">{uploadError}</p>
                    </motion.div>
                  )}

                  {previewUrl ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 md:p-8 bg-white rounded-2xl border-2 border-primary/20 shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-60 md:h-96 flex items-center justify-center shadow-lg">
                          <Image
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            width={400}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block font-paragraph text-sm font-bold text-foreground">
                              Descripción del trabajo
                            </label>
                            <span className="font-paragraph text-xs text-muted-text">
                              {captionCharCount}/{maxCaptionLength}
                            </span>
                          </div>
                          <textarea
                            value={photoCaption}
                            onChange={handleCaptionChange}
                            placeholder="Describe tu trabajo, técnicas utilizadas, materiales..."
                            maxLength={maxCaptionLength}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
                          />
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmUpload}
                            disabled={isUploadingPhoto}
                            className="flex-1 px-4 py-3 bg-primary text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            {isUploadingPhoto ? 'Subiendo...' : 'Publicar Trabajo'}
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
                    <div className="mb-8 p-8 md:p-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border-3 border-dashed border-primary/40 hover:border-primary/60 transition-all hover:shadow-md">
                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-4 md:p-6 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg"
                        >
                          <Upload size={40} className="md:w-12 md:h-12 text-white" />
                        </motion.div>
                        <div className="text-center">
                          <p className="font-heading font-bold text-foreground mb-2 text-xl md:text-2xl">Comparte tu trabajo</p>
                          <p className="font-paragraph text-sm md:text-base text-muted-text mb-4">Sube fotos de tus proyectos y destaca tu portafolio profesional</p>
                        </div>
                        <PortfolioUploaderBasic onFile={handleUploadPhoto} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Photos Grid - Enhanced */}
                {userPhotos.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPhotos.map((photo, index) => (
                        <motion.div
                          key={photo._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-border/50"
                        >
                          {/* Photo Container */}
                          <div className="relative aspect-square overflow-hidden bg-gray-200">
                            <Image
                              src={photo.photoUrl || ''}
                              alt={photo.altText || 'Foto'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              width={400}
                            />

                            {/* Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
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
                                onClick={() => toggleComments(photo._id)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                              >
                                <MessageCircle size={24} className="text-gray-400" />
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

                          {/* Photo Info Card */}
                          <div className="p-4 space-y-3">
                            {/* User Info */}
                            <div className="flex items-center gap-3">
                              {member?.profile?.photo?.url ? (
                                <Image
                                  src={member.profile.photo.url}
                                  alt={member.profile.nickname || 'Usuario'}
                                  className="w-8 h-8 rounded-full object-cover"
                                  width={32}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                  <User size={16} className="text-primary" />
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

                            {/* Caption */}
                            {photo.caption && (
                              <p className="font-paragraph text-sm text-foreground line-clamp-2 bg-background/50 p-2 rounded-lg">
                                {photo.caption}
                              </p>
                            )}

                            {/* Likes and Comments */}
                            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                              <button
                                onClick={() => handleLikePhoto(photo._id)}
                                className="flex items-center gap-1 text-sm font-paragraph font-semibold text-muted-text hover:text-primary transition-colors"
                              >
                                <Heart
                                  size={16}
                                  className={photo.isLiked ? 'fill-red-500 text-red-500' : ''}
                                />
                                <span>{photo.likes}</span>
                              </button>
                              <button
                                onClick={() => toggleComments(photo._id)}
                                className="flex items-center gap-1 text-sm font-paragraph font-semibold text-muted-text hover:text-primary transition-colors"
                              >
                                <MessageCircle size={16} />
                                <span>{photo.comments.length}</span>
                              </button>
                            </div>

                            {/* Comments Section */}
                            {showComments.has(photo._id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-3 border-t border-border/50"
                              >
                                {/* Comments List */}
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                  {photo.comments.length > 0 ? (
                                    photo.comments.map((comment) => (
                                      <div key={comment.id} className="text-sm">
                                        <p className="font-paragraph">
                                          <span className="font-semibold text-foreground">{comment.userName}</span>
                                          <span className="text-muted-text ml-2">{comment.text}</span>
                                        </p>
                                        <p className="text-xs text-muted-text mt-1">
                                          {getRelativeTime(comment.timestamp)}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="font-paragraph text-xs text-muted-text text-center py-2">
                                      Sin comentarios aún
                                    </p>
                                  )}
                                </div>

                                {/* Comment Input */}
                                <div className="flex gap-2 pt-2 border-t border-border/50">
                                  <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Agrega un comentario..."
                                    className="flex-1 px-3 py-2 border border-border rounded-lg font-paragraph text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(photo._id);
                                      }
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddComment(photo._id)}
                                    disabled={!commentText.trim()}
                                    className="p-2 bg-primary text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Send size={16} />
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 md:py-24">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block mb-4 p-4 bg-primary/10 rounded-full"
                    >
                      <Grid3x3 size={40} className="md:w-12 md:h-12 text-primary" />
                    </motion.div>
                    <p className="font-heading text-lg md:text-xl font-bold text-foreground mb-2">Sin trabajos publicados</p>
                    <p className="font-paragraph text-sm md:text-base text-muted-text">¡Sube tu primer trabajo para comenzar a construir tu portafolio!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div key="about" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                <div className="max-w-3xl space-y-8">
                  {/* Contact Info */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                      <Mail size={28} className="text-primary" />
                      Información de Contacto
                    </h3>
                    
                    {member?.loginEmail && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md">
                        <Mail size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Email</p>
                          <p className="font-paragraph text-foreground font-semibold truncate">{member.loginEmail}</p>
                        </div>
                      </motion.div>
                    )}

                    {member?.contact?.firstName && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md">
                        <User size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Nombre Completo</p>
                          <p className="font-paragraph text-foreground font-semibold">{member.contact.firstName} {member.contact.lastName}</p>
                        </div>
                      </motion.div>
                    )}

                    {member?._createdDate && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md">
                        <Calendar size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Miembro desde</p>
                          <p className="font-paragraph text-foreground font-semibold">{new Date(member._createdDate).toLocaleDateString('es-DO')}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Verification Status Section */}
                  {userRole === 'joseador' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <CheckCircle size={28} className="text-secondary" />
                        Estado de Verificación
                      </h3>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                          verificationStatus === 'Aprobado'
                            ? 'bg-accent/10 border-accent'
                            : verificationStatus === 'Rechazado'
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-secondary/10 border-secondary'
                        }`}
                      >
                        {verificationStatus === 'Aprobado' ? (
                          <CheckCircle size={24} className="text-accent flex-shrink-0" />
                        ) : verificationStatus === 'Rechazado' ? (
                          <AlertCircle size={24} className="text-destructive flex-shrink-0" />
                        ) : (
                          <Clock size={24} className="text-secondary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-heading font-bold text-foreground text-sm">Estado Actual</p>
                          <p className={`font-paragraph text-sm font-semibold ${
                            verificationStatus === 'Aprobado'
                              ? 'text-accent'
                              : verificationStatus === 'Rechazado'
                              ? 'text-destructive'
                              : 'text-secondary'
                          }`}>
                            {verificationStatus === 'Aprobado' ? '✓ Verificado' : verificationStatus === 'Rechazado' ? '✗ Rechazado' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Professional Info */}
                  {userRole === 'joseador' && joseadorProfile && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Briefcase size={28} className="text-secondary" />
                        Información Profesional
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editFormData.mainCategory && (
                          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-secondary/50 transition-all hover:shadow-md">
                            <Briefcase size={20} className="text-secondary flex-shrink-0" />
                            <div>
                              <p className="font-paragraph text-xs text-muted-text font-semibold">Especialidad</p>
                              <p className="font-paragraph text-foreground font-semibold">{editFormData.mainCategory}</p>
                            </div>
                          </motion.div>
                        )}

                        {editFormData.yearsOfExperience > 0 && (
                          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-secondary/50 transition-all hover:shadow-md">
                            <Award size={20} className="text-secondary flex-shrink-0" />
                            <div>
                              <p className="font-paragraph text-xs text-muted-text font-semibold">Experiencia</p>
                              <p className="font-paragraph text-foreground font-semibold">{editFormData.yearsOfExperience} años</p>
                            </div>
                          </motion.div>
                        )}

                        {editFormData.cityZone && (
                          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-secondary/50 transition-all hover:shadow-md">
                            <MapPin size={20} className="text-secondary flex-shrink-0" />
                            <div>
                              <p className="font-paragraph text-xs text-muted-text font-semibold">Zona</p>
                              <p className="font-paragraph text-foreground font-semibold">{editFormData.cityZone}</p>
                            </div>
                          </motion.div>
                        )}

                        {editFormData.basePriceEstimate > 0 && (
                          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-secondary/50 transition-all hover:shadow-md">
                            <FileText size={20} className="text-secondary flex-shrink-0" />
                            <div>
                              <p className="font-paragraph text-xs text-muted-text font-semibold">Precio Base</p>
                              <p className="font-paragraph text-foreground font-semibold">RD$ {editFormData.basePriceEstimate.toFixed(2)}</p>
                            </div>
                          </motion.div>
                        )}

                        {editFormData.availability && (
                          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-secondary/50 transition-all hover:shadow-md md:col-span-2">
                            <Clock size={20} className="text-secondary flex-shrink-0" />
                            <div>
                              <p className="font-paragraph text-xs text-muted-text font-semibold">Disponibilidad</p>
                              <p className="font-paragraph text-foreground font-semibold">{editFormData.availability}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {!isEditingProfile && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingProfile(true)}
                          className="w-full px-4 py-3 border-2 border-secondary text-secondary font-paragraph font-bold rounded-xl hover:bg-secondary hover:text-white transition-all mt-4 flex items-center justify-center gap-2"
                        >
                          <Edit2 size={18} />
                          Editar Información Profesional
                        </motion.button>
                      )}

                      {isEditingProfile && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 mt-6 p-4 bg-white rounded-xl border border-border"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editFormData.mainCategory}
                              onChange={(e) => setEditFormData({ ...editFormData, mainCategory: e.target.value })}
                              placeholder="Especialidad"
                              className="px-4 py-3 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                            />
                            <input
                              type="number"
                              value={editFormData.yearsOfExperience}
                              onChange={(e) => setEditFormData({ ...editFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                              placeholder="Años de experiencia"
                              className="px-4 py-3 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                            />
                            <input
                              type="text"
                              value={editFormData.cityZone}
                              onChange={(e) => setEditFormData({ ...editFormData, cityZone: e.target.value })}
                              placeholder="Zona"
                              className="px-4 py-3 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                            />
                            <input
                              type="number"
                              value={editFormData.basePriceEstimate}
                              onChange={(e) => setEditFormData({ ...editFormData, basePriceEstimate: parseFloat(e.target.value) || 0 })}
                              placeholder="Precio base"
                              className="px-4 py-3 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                            />
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSaveProfileChanges}
                              className="flex-1 px-4 py-3 bg-secondary text-white font-paragraph font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Check size={18} />
                              Guardar
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsEditingProfile(false)}
                              className="flex-1 px-4 py-3 border-2 border-secondary/30 text-foreground font-paragraph font-bold rounded-lg hover:bg-secondary/5 transition-all"
                            >
                              Cancelar
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Ratings Section */}
                  {userRatings.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4 pt-6 border-t border-border"
                    >
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Star size={28} className="text-yellow-500" />
                        Reseñas ({userRatings.length})
                      </h3>
                      <div className="space-y-3">
                        {userRatings.slice(0, 5).map((rating, index) => (
                          <motion.div
                            key={rating._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white rounded-xl border border-border hover:border-yellow-500/50 hover:shadow-md transition-all"
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
                            <p className="font-paragraph text-sm text-foreground">{rating.reviewText}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                <div className="max-w-3xl space-y-8">
                  {/* Role Selection */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                      <Users size={28} className="text-primary" />
                      Cambiar Rol
                    </h3>
                    <p className="font-paragraph text-foreground text-sm">Cambia entre tu rol de cliente y joseador</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('client');
                          window.location.href = '/client/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-gradient-to-br from-primary to-primary/80 text-white font-heading font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Users size={20} />
                        Dashboard Cliente
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('joseador');
                          window.location.href = '/joseador/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-gradient-to-br from-secondary to-secondary/80 text-white font-heading font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Briefcase size={20} />
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
                      
                      {/* Verification Status Display */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                          verificationStatus === 'Aprobado'
                            ? 'bg-accent/10 border-accent'
                            : verificationStatus === 'Rechazado'
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-secondary/10 border-secondary'
                        }`}
                      >
                        {verificationStatus === 'Aprobado' ? (
                          <CheckCircle size={24} className="text-accent flex-shrink-0" />
                        ) : verificationStatus === 'Rechazado' ? (
                          <AlertCircle size={24} className="text-destructive flex-shrink-0" />
                        ) : (
                          <Clock size={24} className="text-secondary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-heading font-bold text-foreground text-sm">Estado de Verificación</p>
                          <p className={`font-paragraph text-sm font-semibold ${
                            verificationStatus === 'Aprobado'
                              ? 'text-accent'
                              : verificationStatus === 'Rechazado'
                              ? 'text-destructive'
                              : 'text-secondary'
                          }`}>
                            {verificationStatus === 'Aprobado' ? '✓ Verificado' : verificationStatus === 'Rechazado' ? '✗ Rechazado' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </motion.div>

                      <p className="font-paragraph text-foreground text-sm">
                        Completa tu verificación para acceder a más oportunidades de trabajo y aumentar tu credibilidad.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/joseador/verification')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white font-heading font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Iniciar Verificación
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Admin Dashboard Access */}
                  {registeredUserRole === 'Admin' && (
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
                      <p className="font-paragraph text-foreground text-sm">
                        Accede al panel de administración para gestionar usuarios, verificaciones y disputas.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-heading font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
                    className="pt-6 border-t border-border"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const { clearAllUserData } = useRoleStore.getState();
                        clearAllUserData();
                        actions.logout();
                      }}
                      className="w-full px-6 py-3 border-3 border-destructive text-destructive font-heading font-bold rounded-xl hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <LogOut size={20} />
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

export default ProfilePage;
