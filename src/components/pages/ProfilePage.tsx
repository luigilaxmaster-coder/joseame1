import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { BaseCrudService } from '@/integrations';
import {
  ArrowLeft, User, Mail, Calendar, Shield, Star, Upload, Heart, Trash2, Edit2, Check, AlertCircle,
  CheckCircle, XCircle, Award, RefreshCw, Clock, Phone, MapPin, Briefcase, FileText, Settings,
  Palette, Eye, EyeOff, LogOut, Image as ImageIcon, BarChart3, Lock
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, useEffect, useRef } from 'react';
import { UserProfiles, UserPhotos, UserRatings, RegisteredUsers, UserVerification, JoseadoresProfiles } from '@/entities';
import { createPreviewUrl, isValidImageFile, getUploadErrorMessage } from '@/lib/file-upload-service';
import { useSyncUser } from '@/lib/user-sync-hook';
import { WixMediaService } from '@/lib/wix-media-service';

type TabType = 'overview' | 'portfolio' | 'professional' | 'settings';

function ProfilePage() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
  const [profileTheme, setProfileTheme] = useState<'light' | 'dark' | 'gradient'>('gradient');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

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
    }, 3000);
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

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      const uploadResponse = await WixMediaService.uploadImage(selectedFile);

      // Save to UserPhotos collection
      const photoId = crypto.randomUUID();
      const photoData: UserPhotos = {
        _id: photoId,
        memberId: member.loginEmail,
        photoUrl: uploadResponse.url,
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

  const getThemeBackground = () => {
    switch (profileTheme) {
      case 'dark':
        return 'bg-gradient-to-b from-foreground via-slate-900 to-slate-800';
      case 'light':
        return 'bg-gradient-to-b from-white via-slate-50 to-background';
      default:
        return 'bg-gradient-to-b from-primary/5 via-background to-secondary/5';
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()}`}>
      {/* Header */}
      <header className={`${profileTheme === 'dark' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80'} backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm`}>
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(getBackButtonPath())}
            className={`inline-flex items-center gap-2 transition-colors font-paragraph font-semibold text-sm md:text-base h-10 px-3 rounded-lg ${
              profileTheme === 'dark'
                ? 'text-white hover:text-primary hover:bg-slate-800'
                : 'text-muted-text hover:text-primary hover:bg-background'
            }`}
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileTheme('light')}
              className={`p-2 rounded-lg transition-all ${profileTheme === 'light' ? 'bg-primary text-white' : profileTheme === 'dark' ? 'text-white hover:bg-slate-800' : 'text-muted-text hover:bg-background'}`}
              title="Tema claro"
            >
              <Eye size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileTheme('dark')}
              className={`p-2 rounded-lg transition-all ${profileTheme === 'dark' ? 'bg-foreground text-white' : profileTheme === 'light' ? 'text-muted-text hover:bg-background' : 'text-muted-text hover:bg-background'}`}
              title="Tema oscuro"
            >
              <EyeOff size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileTheme('gradient')}
              className={`p-2 rounded-lg transition-all ${profileTheme === 'gradient' ? 'bg-gradient-to-r from-primary to-secondary text-white' : profileTheme === 'dark' ? 'text-white hover:bg-slate-800' : 'text-muted-text hover:bg-background'}`}
              title="Tema gradiente"
            >
              <Palette size={18} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Profile Header Card */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
            <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="hidden md:block absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36 blur-3xl" />

            <div className="relative z-10 p-6 md:p-8 lg:p-12">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-8 mb-6 md:mb-8">
                {/* Profile Photo */}
                <motion.div whileHover={{ scale: 1.08, rotate: 2 }} className="relative flex-shrink-0">
                  {member?.profile?.photo?.url ? (
                    <Image
                      src={member.profile.photo.url}
                      alt={member.profile.nickname || 'Usuario'}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl object-cover border-4 border-white shadow-lg md:shadow-2xl"
                      width={160}
                    />
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
                          <span className="font-paragraph text-xs font-bold text-white">{badge}</span>
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
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
            {(['overview', 'portfolio', 'professional', 'settings'] as TabType[]).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-paragraph font-semibold text-sm md:text-base whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : profileTheme === 'dark'
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-white text-foreground hover:bg-background border border-border'
                }`}
              >
                {tab === 'overview' && <span className="flex items-center gap-2"><User size={16} /> Overview</span>}
                {tab === 'portfolio' && <span className="flex items-center gap-2"><ImageIcon size={16} /> Portafolio</span>}
                {tab === 'professional' && <span className="flex items-center gap-2"><Briefcase size={16} /> Profesional</span>}
                {tab === 'settings' && <span className="flex items-center gap-2"><Settings size={16} /> Configuración</span>}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {member?.loginEmail && (
                    <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
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
                    <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all">
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
                    <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all">
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

                  {/* Verification Status */}
                  <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                    {verificationStatus === 'Aprobado' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-accent/5 to-support/5"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <div className={`relative z-10 p-2 md:p-4 rounded-lg md:rounded-xl flex-shrink-0 ${
                      verificationStatus === 'Aprobado'
                        ? 'bg-gradient-to-br from-accent to-support'
                        : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                    }`}>
                      {verificationStatus === 'Aprobado' ? (
                        <CheckCircle size={20} className="md:w-7 md:h-7 text-white" />
                      ) : (
                        <Clock size={20} className="md:w-7 md:h-7 text-white" />
                      )}
                    </div>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="font-paragraph text-xs md:text-sm text-muted-text font-semibold">Estado de Verificación</p>
                      <p className={`font-paragraph font-bold text-sm md:text-lg ${
                        verificationStatus === 'Aprobado' ? 'text-accent' : 'text-yellow-600'
                      }`}>
                        {verificationStatus === 'Aprobado' ? 'Verificado' : 'Pendiente'}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Profile Overview Edit Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl md:shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Mi Información</h3>
                    {!isEditingOverview && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditingOverview(true)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={20} className="text-primary" />
                      </motion.button>
                    )}
                  </div>

                  {isEditingOverview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Nombre</label>
                          <input
                            type="text"
                            value={overviewData.firstName}
                            onChange={(e) => setOverviewData({ ...overviewData, firstName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Apellido</label>
                          <input
                            type="text"
                            value={overviewData.lastName}
                            onChange={(e) => setOverviewData({ ...overviewData, lastName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Tu apellido"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfileOverview}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={18} />
                          Guardar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingOverview(false)}
                          className="flex-1 px-4 py-3 border-2 border-primary/30 text-foreground font-paragraph font-bold rounded-xl hover:bg-primary/5 transition-all"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-xl">
                        <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Nombre</p>
                        <p className="font-paragraph text-foreground font-bold">{overviewData.firstName || 'No especificado'}</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-xl">
                        <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Apellido</p>
                        <p className="font-paragraph text-foreground font-bold">{overviewData.lastName || 'No especificado'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ratings Section */}
                {userRatings.length > 0 && (
                  <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-secondary/20 shadow-xl md:shadow-2xl">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">Calificaciones y Reseñas</h3>
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
              </motion.div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <motion.div key="portfolio" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl md:shadow-2xl">
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">Mi Galería de Fotos</h3>

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

                  {/* Upload Form */}
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
                            placeholder="Agrega una descripción para tu foto..."
                            className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          />
                        </div>

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
                          <p className="font-heading font-bold text-foreground mb-2 text-lg md:text-xl">Sube una foto a tu portafolio</p>
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

                  {/* Photos Grid */}
                  {userPhotos.length > 0 ? (
                    <div className="space-y-8">
                      <div>
                        <h4 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">Mis Fotos ({userPhotos.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {userPhotos.map((photo, index) => (
                            <motion.div
                              key={photo._id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="group relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white"
                            >
                              <div className="relative h-56 md:h-72 bg-gray-200 overflow-hidden">
                                <Image
                                  src={photo.photoUrl || ''}
                                  alt={photo.altText || 'Foto del portafolio'}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  width={300}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300 flex items-end justify-center gap-4 p-4 opacity-0 group-hover:opacity-100">
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

                              <div className="p-3 md:p-4 bg-white">
                                <p className="font-paragraph text-xs md:text-sm text-foreground mb-3 line-clamp-2 font-semibold">
                                  {photo.altText || 'Sin descripción'}
                                </p>
                                <span className="font-paragraph text-xs text-muted-text">
                                  {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString('es-DO') : ''}
                                </span>
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
              </motion.div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <motion.div key="professional" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                {userRole === 'joseador' && joseadorProfile ? (
                  <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-secondary/20 shadow-xl md:shadow-2xl overflow-hidden relative">
                    <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-full -mr-32 -mt-32" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Información Profesional</h3>
                        {!isEditingProfile && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditingProfile(true)}
                            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={20} className="text-secondary" />
                          </motion.button>
                        )}
                      </div>

                      {isEditingProfile ? (
                        <div className="space-y-4 md:space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Teléfono</label>
                              <input
                                type="tel"
                                value={editFormData.phoneNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Número de teléfono"
                              />
                            </div>
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Zona/Ciudad</label>
                              <input
                                type="text"
                                value={editFormData.cityZone}
                                onChange={(e) => setEditFormData({ ...editFormData, cityZone: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Zona o ciudad"
                              />
                            </div>
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Categoría Principal</label>
                              <input
                                type="text"
                                value={editFormData.mainCategory}
                                onChange={(e) => setEditFormData({ ...editFormData, mainCategory: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Ej: Plomería, Electricidad"
                              />
                            </div>
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Años de Experiencia</label>
                              <input
                                type="number"
                                value={editFormData.yearsOfExperience}
                                onChange={(e) => setEditFormData({ ...editFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Años"
                              />
                            </div>
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Precio Base Estimado</label>
                              <input
                                type="number"
                                value={editFormData.basePriceEstimate}
                                onChange={(e) => setEditFormData({ ...editFormData, basePriceEstimate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Precio"
                              />
                            </div>
                            <div>
                              <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Disponibilidad</label>
                              <select
                                value={editFormData.availability}
                                onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                              >
                                <option value="">Selecciona disponibilidad</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupado">Ocupado</option>
                                <option value="Fin de semana">Fin de semana</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block font-paragraph text-sm font-bold text-foreground mb-2">Método de Contacto Preferido</label>
                            <select
                              value={editFormData.preferredContactMethod}
                              onChange={(e) => setEditFormData({ ...editFormData, preferredContactMethod: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                              <option value="">Selecciona método</option>
                              <option value="Teléfono">Teléfono</option>
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Email">Email</option>
                            </select>
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSaveProfileChanges}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white font-paragraph font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Check size={18} />
                              Guardar Cambios
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsEditingProfile(false)}
                              className="flex-1 px-4 py-3 border-2 border-secondary/30 text-foreground font-paragraph font-bold rounded-xl hover:bg-secondary/5 transition-all"
                            >
                              Cancelar
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {editFormData.phoneNumber && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Phone size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Teléfono</p>
                                <p className="font-paragraph text-foreground font-bold">{editFormData.phoneNumber}</p>
                              </div>
                            </div>
                          )}
                          {editFormData.cityZone && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <MapPin size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Zona/Ciudad</p>
                                <p className="font-paragraph text-foreground font-bold">{editFormData.cityZone}</p>
                              </div>
                            </div>
                          )}
                          {editFormData.mainCategory && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Briefcase size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Categoría Principal</p>
                                <p className="font-paragraph text-foreground font-bold">{editFormData.mainCategory}</p>
                              </div>
                            </div>
                          )}
                          {editFormData.yearsOfExperience > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Award size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Años de Experiencia</p>
                                <p className="font-paragraph text-foreground font-bold">{editFormData.yearsOfExperience} años</p>
                              </div>
                            </div>
                          )}
                          {editFormData.basePriceEstimate > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <FileText size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Precio Base</p>
                                <p className="font-paragraph text-foreground font-bold">RD$ {editFormData.basePriceEstimate.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                          {editFormData.availability && (
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Clock size={20} className="text-secondary flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-paragraph text-xs text-muted-text font-semibold">Disponibilidad</p>
                                <p className="font-paragraph text-foreground font-bold">{editFormData.availability}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl md:shadow-2xl text-center">
                    <Lock size={48} className="mx-auto mb-4 text-muted-text" />
                    <p className="font-heading text-lg md:text-xl font-bold text-foreground mb-2">Información Profesional</p>
                    <p className="font-paragraph text-sm md:text-base text-muted-text">
                      Esta sección está disponible solo para Joseadores. Cambia tu rol para acceder.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                {/* Role Selection */}
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

                {/* Logout */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const { clearAllUserData } = useRoleStore.getState();
                      clearAllUserData();
                      actions.logout();
                    }}
                    className="px-8 md:px-10 py-3 md:py-4 border-3 border-destructive text-destructive font-heading font-bold rounded-xl md:rounded-2xl hover:bg-destructive hover:text-white transition-all text-base md:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </motion.button>
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
