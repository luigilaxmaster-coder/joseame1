import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { UserRatings } from '@/entities';
import { ArrowLeft, Star, MapPin, Briefcase, Award, MessageSquare, Phone, Mail } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function JoseadorProfilePage() {
  const { joseadorId } = useParams<{ joseadorId: string }>();
  const navigate = useNavigate();
  const [joseadorProfile, setJoseadorProfile] = useState<any>(null);
  const [joseadorRatings, setJoseadorRatings] = useState<UserRatings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (joseadorId) {
      loadJoseadorProfile();
    }
  }, [joseadorId]);

  const loadJoseadorProfile = async () => {
    try {
      setLoading(true);
      // Fetch joseador's public profile data from Members/PublicData
      const { items: publicDataItems } = await BaseCrudService.getAll('Members/PublicData');
      const joseadorPublicData = publicDataItems.find((item: any) => item._id === joseadorId);
      
      // Fetch ratings for this joseador
      const { items: ratingsItems } = await BaseCrudService.getAll<UserRatings>('userratings');
      const joseadorRatings = ratingsItems.filter(r => r.ratedUserIdentifier === joseadorId);
      
      setJoseadorProfile(joseadorPublicData || { nickname: joseadorId });
      setJoseadorRatings(joseadorRatings);
    } catch (error) {
      console.error('Error loading joseador profile:', error);
      setJoseadorProfile({ nickname: joseadorId });
      setJoseadorRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = joseadorRatings.length > 0
    ? (joseadorRatings.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / joseadorRatings.length).toFixed(1)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="font-paragraph text-muted-text">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-3 md:py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-paragraph font-semibold"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:block">Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-6 md:py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Profile Card - Left Side */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg sticky top-24">
              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                {joseadorProfile?.photo?.url ? (
                  <Image
                    src={joseadorProfile.photo.url}
                    alt={joseadorProfile.nickname}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20">
                    <Briefcase size={48} className="text-primary/40" />
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div className="text-center mb-6">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {joseadorProfile?.nickname || 'Joseador'}
                </h1>
                {joseadorProfile?.title && (
                  <p className="font-paragraph text-primary font-semibold mb-3">
                    {joseadorProfile.title}
                  </p>
                )}

                {/* Rating Summary */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(Number(averageRating)) ? 'fill-accent text-accent' : 'text-muted-text/30'}
                      />
                    ))}
                  </div>
                  <span className="font-heading text-lg font-bold text-foreground">
                    {averageRating}
                  </span>
                  <span className="font-paragraph text-sm text-muted-text">
                    ({joseadorRatings.length})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg md:rounded-xl font-paragraph font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  Contactar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-3 bg-primary/10 text-primary rounded-lg md:rounded-xl font-paragraph font-semibold hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Llamar
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Details - Right Side */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* About Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Acerca de</h2>
              <p className="font-paragraph text-foreground leading-relaxed">
                {joseadorProfile?.title ? `Especialista en ${joseadorProfile.title}` : 'Joseador profesional'}
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 border border-border/50 shadow-lg text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Award className="text-primary" size={24} />
                </div>
                <p className="font-heading text-2xl font-bold text-foreground mb-1">
                  {joseadorRatings.length}
                </p>
                <p className="font-paragraph text-sm text-muted-text">Trabajos Completados</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 border border-border/50 shadow-lg text-center"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Star className="text-secondary" size={24} />
                </div>
                <p className="font-heading text-2xl font-bold text-foreground mb-1">
                  {averageRating}
                </p>
                <p className="font-paragraph text-sm text-muted-text">Calificación Promedio</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 border border-border/50 shadow-lg text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="text-accent" size={24} />
                </div>
                <p className="font-heading text-2xl font-bold text-foreground mb-1">
                  {joseadorRatings.length > 0 ? '✓' : '-'}
                </p>
                <p className="font-paragraph text-sm text-muted-text">Verificado</p>
              </motion.div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Calificaciones ({joseadorRatings.length})
              </h2>

              {joseadorRatings.length > 0 ? (
                <div className="space-y-4">
                  {joseadorRatings.map((rating, index) => (
                    <motion.div
                      key={rating._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background rounded-xl p-4 border border-border/50"
                    >
                      {/* Rating Stars */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < (rating.ratingValue || 0) ? 'fill-accent text-accent' : 'text-muted-text/30'}
                            />
                          ))}
                        </div>
                        <span className="font-heading font-bold text-foreground">
                          {rating.ratingValue}/5
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="font-paragraph text-foreground mb-2">
                        {rating.reviewText}
                      </p>

                      {/* Reviewer Info */}
                      <p className="font-paragraph text-xs text-muted-text">
                        Por: {rating.reviewerIdentifier}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Star className="text-primary/40" size={32} />
                  </div>
                  <p className="font-paragraph text-muted-text">
                    Este Joseador aún no tiene calificaciones
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
