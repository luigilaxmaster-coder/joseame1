import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import {
  ArrowLeft, User, Mail, Calendar, Star, Upload, Trash2, Edit2, Check, AlertCircle,
  CheckCircle, Award, Clock, Phone, MapPin, Briefcase, FileText, Settings,
  LogOut, Grid3x3, Heart, MessageCircle, Share2, Lock, MoreHorizontal, Shield
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { UserProfiles, UserPhotos, UserRatings, RegisteredUsers, UserVerification, JoseadoresProfiles } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';
import { useSyncUser } from '@/lib/user-sync-hook';
import { WixMediaService } from '@/lib/wix-media-service';
import { PortfolioUploaderBasic } from '@/components/PortfolioUploaderBasic';

type TabType = 'posts' | 'about' | 'settings';

function ProfilePage() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userProfile, setUserProfile] = useState<UserProfiles | null>(null);
  const [userPhotos, setUserPhotos] = useState<UserPhotos[]>([]);
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
      setUserPhotos(userPhotosList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }));

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

      if (currentUser) {
        // Use verification status from RegisteredUsers collection (source of truth from admin)
        const verificationStatusValue = currentUser.verificationStatus || 'Pendiente';
        setVerificationStatus(verificationStatusValue);

        if (currentUser.badges) {
          const badgesArray = currentUser.badges.split(',').map(b => b.trim()).filter(b => b);
          setUserBadges(badgesArray);
        } else {
          setUserBadges([]);
        }

        // Set the role from RegisteredUsers collection
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
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(getBackButtonPath())}
            className="inline-flex items-center gap-2 transition-colors font-paragraph font-semibold text-sm md:text-base h-10 px-3 rounded-lg text-muted-text hover:text-primary hover:bg-background"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <h1 className="font-heading font-bold text-lg md:text-xl text-foreground">Perfil</h1>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-background rounded-lg transition-colors"
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
          {/* Profile Header - Instagram Style */}
          <div className="border-b border-border">
            <div className="px-4 md:px-6 py-8 md:py-12">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">
                {/* Profile Picture */}
                <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
                  {member?.profile?.photo?.url ? (
                    <Image
                      src={member.profile.photo.url}
                      alt={member.profile.nickname || 'Usuario'}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                      width={160}
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg border-4 border-primary/20">
                      <User size={60} className="md:w-20 md:h-20 text-primary" />
                    </div>
                  )}
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                      {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                    </h1>
                    {!isEditingOverview && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditingOverview(true)}
                        className="w-fit px-6 py-2 border-2 border-foreground text-foreground font-paragraph font-bold rounded-lg hover:bg-foreground hover:text-white transition-all"
                      >
                        Editar Perfil
                      </motion.button>
                    )}
                  </div>

                  {member?.profile?.title && (
                    <p className="font-paragraph text-base md:text-lg text-muted-text mb-4">
                      {member.profile.title}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-8 md:gap-12 mb-6">
                    <div className="text-center md:text-left">
                      <p className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                        {userPhotos.length}
                      </p>
                      <p className="font-paragraph text-sm text-muted-text">Publicaciones</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                        {userRatings.length}
                      </p>
                      <p className="font-paragraph text-sm text-muted-text">Reseñas</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                        {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                      </p>
                      <p className="font-paragraph text-sm text-muted-text">Calificación</p>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {isEditingOverview ? (
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={overviewData.firstName}
                          onChange={(e) => setOverviewData({ ...overviewData, firstName: e.target.value })}
                          className="px-4 py-2 border-2 border-primary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          value={overviewData.lastName}
                          onChange={(e) => setOverviewData({ ...overviewData, lastName: e.target.value })}
                          className="px-4 py-2 border-2 border-primary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    </div>
                  ) : (
                    <p className="font-paragraph text-foreground text-sm md:text-base leading-relaxed">
                      {overviewData.firstName || member?.contact?.firstName} {overviewData.lastName || member?.contact?.lastName}
                    </p>
                  )}

                  {/* Badges */}
                  {userBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {userBadges.map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full shadow-lg"
                        >
                          <Award size={14} className="text-white" />
                          <span className="font-paragraph text-xs font-bold text-white">{badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Instagram Style */}
          <div className="border-b border-border flex justify-center gap-8 md:gap-12 px-4 md:px-6">
            {(['posts', 'about', 'settings'] as TabType[]).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-paragraph font-semibold text-sm md:text-base transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-text hover:text-foreground'
                }`}
              >
                {tab === 'posts' && <span className="flex items-center gap-2"><Grid3x3 size={16} /> Publicaciones</span>}
                {tab === 'about' && <span className="flex items-center gap-2"><User size={16} /> Acerca de</span>}
                {tab === 'settings' && <span className="flex items-center gap-2"><Settings size={16} /> Configuración</span>}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Posts Tab - Grid Layout */}
            {activeTab === 'posts' && (
              <motion.div key="posts" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                {/* Upload Section */}
                <div className="mb-12">
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

                  {previewUrl ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border-2 border-primary/40"
                    >
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-60 md:h-80 flex items-center justify-center shadow-lg">
                          <Image
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            width={400}
                          />
                        </div>

                        <div>
                          <label className="block font-paragraph text-sm font-bold text-foreground mb-3">
                            Descripción (opcional)
                          </label>
                          <input
                            type="text"
                            value={photoCaption}
                            onChange={(e) => setPhotoCaption(e.target.value)}
                            placeholder="Agrega una descripción..."
                            className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          />
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmUpload}
                            disabled={isUploadingPhoto}
                            className="flex-1 px-4 py-3 bg-primary text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploadingPhoto ? 'Subiendo...' : 'Publicar'}
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
                    <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border-3 border-dashed border-primary/40 hover:border-primary/60 transition-colors">
                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-4 md:p-5 bg-primary rounded-full shadow-lg"
                        >
                          <Upload size={32} className="md:w-10 md:h-10 text-white" />
                        </motion.div>
                        <div className="text-center">
                          <p className="font-heading font-bold text-foreground mb-2 text-lg md:text-xl">Comparte una foto</p>
                          <p className="font-paragraph text-sm md:text-base text-muted-text">Muestra tu trabajo y destaca tu portafolio</p>
                        </div>
                        <PortfolioUploaderBasic onFile={handleUploadPhoto} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Photos Grid */}
                {userPhotos.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                      {userPhotos.map((photo, index) => (
                        <motion.div
                          key={photo._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer"
                        >
                          <Image
                            src={photo.photoUrl || ''}
                            alt={photo.altText || 'Foto'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            width={300}
                          />

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                            >
                              <Heart size={20} className="text-destructive" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              onClick={() => handleDeletePhoto(photo._id)}
                            >
                              <Trash2 size={20} className="text-destructive" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 md:py-20">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block mb-4 p-4 bg-primary/10 rounded-full"
                    >
                      <Upload size={32} className="md:w-10 md:h-10 text-primary" />
                    </motion.div>
                    <p className="font-heading text-base md:text-lg font-bold text-foreground mb-2">Sin publicaciones aún</p>
                    <p className="font-paragraph text-sm md:text-base text-muted-text">¡Sube tu primera foto para comenzar!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div key="about" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                <div className="max-w-2xl space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Información de Contacto</h3>
                    
                    {member?.loginEmail && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                        <Mail size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Email</p>
                          <p className="font-paragraph text-foreground font-semibold truncate">{member.loginEmail}</p>
                        </div>
                      </motion.div>
                    )}

                    {member?.contact?.firstName && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                        <User size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Nombre</p>
                          <p className="font-paragraph text-foreground font-semibold">{member.contact.firstName} {member.contact.lastName}</p>
                        </div>
                      </motion.div>
                    )}

                    {member?._createdDate && (
                      <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                        <Calendar size={20} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-paragraph text-xs text-muted-text font-semibold">Miembro desde</p>
                          <p className="font-paragraph text-foreground font-semibold">{new Date(member._createdDate).toLocaleDateString('es-DO')}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Verification Status Section */}
                  {userRole === 'joseador' && (
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Estado de Verificación</h3>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
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
                    </div>
                  )}

                  {/* Professional Info */}
                  {userRole === 'joseador' && joseadorProfile && (
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Información Profesional</h3>
                      
                      {editFormData.mainCategory && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                          <Briefcase size={20} className="text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-paragraph text-xs text-muted-text font-semibold">Especialidad</p>
                            <p className="font-paragraph text-foreground font-semibold">{editFormData.mainCategory}</p>
                          </div>
                        </motion.div>
                      )}

                      {editFormData.yearsOfExperience > 0 && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                          <Award size={20} className="text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-paragraph text-xs text-muted-text font-semibold">Experiencia</p>
                            <p className="font-paragraph text-foreground font-semibold">{editFormData.yearsOfExperience} años</p>
                          </div>
                        </motion.div>
                      )}

                      {editFormData.cityZone && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                          <MapPin size={20} className="text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-paragraph text-xs text-muted-text font-semibold">Zona</p>
                            <p className="font-paragraph text-foreground font-semibold">{editFormData.cityZone}</p>
                          </div>
                        </motion.div>
                      )}

                      {editFormData.basePriceEstimate > 0 && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                          <FileText size={20} className="text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-paragraph text-xs text-muted-text font-semibold">Precio Base</p>
                            <p className="font-paragraph text-foreground font-semibold">RD$ {editFormData.basePriceEstimate.toFixed(2)}</p>
                          </div>
                        </motion.div>
                      )}

                      {editFormData.availability && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                          <Clock size={20} className="text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-paragraph text-xs text-muted-text font-semibold">Disponibilidad</p>
                            <p className="font-paragraph text-foreground font-semibold">{editFormData.availability}</p>
                          </div>
                        </motion.div>
                      )}

                      {!isEditingProfile && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingProfile(true)}
                          className="w-full px-4 py-3 border-2 border-secondary text-secondary font-paragraph font-bold rounded-lg hover:bg-secondary hover:text-white transition-all mt-4"
                        >
                          Editar Información Profesional
                        </motion.button>
                      )}

                      {isEditingProfile && (
                        <div className="space-y-4 mt-6 p-4 bg-background rounded-lg border border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editFormData.mainCategory}
                              onChange={(e) => setEditFormData({ ...editFormData, mainCategory: e.target.value })}
                              placeholder="Especialidad"
                              className="px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                            <input
                              type="number"
                              value={editFormData.yearsOfExperience}
                              onChange={(e) => setEditFormData({ ...editFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                              placeholder="Años de experiencia"
                              className="px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                            <input
                              type="text"
                              value={editFormData.cityZone}
                              onChange={(e) => setEditFormData({ ...editFormData, cityZone: e.target.value })}
                              placeholder="Zona"
                              className="px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                            <input
                              type="number"
                              value={editFormData.basePriceEstimate}
                              onChange={(e) => setEditFormData({ ...editFormData, basePriceEstimate: parseFloat(e.target.value) || 0 })}
                              placeholder="Precio base"
                              className="px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSaveProfileChanges}
                              className="flex-1 px-4 py-2 bg-secondary text-white font-paragraph font-bold rounded-lg hover:shadow-lg transition-all"
                            >
                              Guardar
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsEditingProfile(false)}
                              className="flex-1 px-4 py-2 border-2 border-secondary/30 text-foreground font-paragraph font-bold rounded-lg hover:bg-secondary/5 transition-all"
                            >
                              Cancelar
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ratings Section */}
                  {userRatings.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Reseñas ({userRatings.length})</h3>
                      <div className="space-y-3">
                        {userRatings.slice(0, 5).map((rating, index) => (
                          <motion.div
                            key={rating._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-background rounded-lg border border-border"
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
                                    size={12}
                                    className={i < (rating.ratingValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="font-paragraph text-sm text-foreground">{rating.reviewText}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="px-4 md:px-6 py-8 md:py-12">
                <div className="max-w-2xl space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Cambiar Rol</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('client');
                          window.location.href = '/client/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-primary text-white font-heading font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Dashboard Cliente
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUserRole('joseador');
                          window.location.href = '/joseador/dashboard';
                        }}
                        className="w-full px-6 py-4 bg-secondary text-white font-heading font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Dashboard Joseador
                      </motion.button>
                    </div>
                  </div>

                  {/* Verification Section */}
                  {userRole === 'joseador' && (
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Verificación</h3>
                      
                      {/* Verification Status Display */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
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
                        Completa tu verificación para acceder a más oportunidades de trabajo.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/joseador/verification')}
                        className="w-full px-6 py-3 bg-accent text-white font-heading font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Iniciar Verificación
                      </motion.button>
                    </div>
                  )}

                  {/* Admin Dashboard Access */}
                  {registeredUserRole === 'Admin' && (
                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">Panel de Administración</h3>
                      <p className="font-paragraph text-foreground text-sm">
                        Accede al panel de administración para gestionar usuarios y verificaciones.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full px-6 py-3 bg-primary text-white font-heading font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Shield size={18} />
                        Ir al Panel Admin
                      </motion.button>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="pt-6 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const { clearAllUserData } = useRoleStore.getState();
                        clearAllUserData();
                        actions.logout();
                      }}
                      className="w-full px-6 py-3 border-3 border-destructive text-destructive font-heading font-bold rounded-lg hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </motion.button>
                  </div>
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
