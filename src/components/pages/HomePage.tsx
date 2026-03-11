// HPI 3.0 - Dynamic, Intuitive & Colorful Design
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { ArrowRight, Briefcase, Users, Shield, Zap, Sparkles, TrendingUp, Star, Rocket, Target, Search, FileText, Handshake, Wallet, DollarSign, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncUser } from '@/lib/user-sync-hook';
import Flow3DCarousel from '@/components/Flow3DCarousel';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0, threshold = 0.1 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay / 1000, ease: 'easeOut' }}
            viewport={{ once: true, amount: threshold }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const ParallaxImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  // Reduced parallax effect for better performance
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} className={cn("overflow-clip", className)}>
      <motion.div style={{ y }} className="h-[120%] w-full">
        <Image src={src} alt={alt} className="w-full h-full object-cover" width={1600} />
      </motion.div>
    </div>
  );
};

// Enhanced Floating Orbs with more dynamic animations
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary Orb - Large, flowing movement */}
      <motion.div
        animate={{ 
          y: [0, -80, 40, -50, 20, 0], 
          x: [0, 60, -40, 50, -20, 0],
          scale: [1, 1.15, 0.9, 1.1, 0.95, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary/50 via-secondary/40 to-accent/30 rounded-full blur-3xl shadow-2xl"
      />
      
      {/* Secondary Orb - Accent colors */}
      <motion.div
        animate={{ 
          y: [0, 60, -40, 30, -20, 0], 
          x: [0, -60, 40, -30, 25, 0],
          scale: [1, 0.9, 1.2, 0.95, 1.05, 1],
          rotate: [360, 270, 180, 90, 0]
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-gradient-to-br from-accent/50 via-support/40 to-primary/30 rounded-full blur-3xl shadow-2xl"
      />
      
      {/* Tertiary Orb - Support colors */}
      <motion.div
        animate={{ 
          y: [0, -40, 50, -25, 35, 0], 
          x: [0, 70, -50, 40, -30, 0],
          scale: [1, 1.1, 0.85, 1.15, 0.9, 1],
          rotate: [0, 180, 360, 180, 0]
        }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-secondary/45 via-accent/35 to-support/25 rounded-full blur-3xl shadow-2xl"
      />
      
      {/* Additional Orb - Light accent */}
      <motion.div
        animate={{ 
          y: [0, 50, -60, 40, -25, 0], 
          x: [0, -50, 60, -40, 30, 0],
          scale: [1, 1.05, 0.95, 1.12, 0.88, 1],
          rotate: [360, 180, 0, 180, 360]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-support/40 via-primary/30 to-secondary/20 rounded-full blur-3xl shadow-2xl"
      />

      {/* Extra Orb - Dynamic accent */}
      <motion.div
        animate={{ 
          y: [0, -70, 30, -40, 50, 0], 
          x: [0, 80, -60, 70, -50, 0],
          scale: [1, 1.2, 0.8, 1.08, 0.92, 1],
          opacity: [0.3, 0.6, 0.4, 0.7, 0.35, 0.3]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-primary/35 via-accent/25 to-support/15 rounded-full blur-3xl shadow-xl"
      />

      {/* Micro Orb - Fast movement */}
      <motion.div
        animate={{ 
          y: [0, -100, 60, -80, 40, 0], 
          x: [0, 100, -80, 90, -60, 0],
          scale: [0.8, 1.3, 0.7, 1.2, 0.75, 0.8]
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-bl from-secondary/30 via-support/20 to-primary/15 rounded-full blur-3xl opacity-40"
      />
    </div>
  );
};

// Animated Stats Component - No fake numbers
const AnimatedStat = ({ icon: Icon, label, delay = 0 }: { icon: any; label: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-2 p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all"
    >
      <Icon className="text-accent" size={32} />
      <div className="text-sm md:text-base text-white/80 text-center font-heading font-semibold">{label}</div>
    </motion.div>
  );
};

export default function HomePage() {
  // Sync user to registeredusers collection when they visit home page
  useSyncUser();
  const { language } = useLanguageStore();
  const t = translations[language];

  const features = [
    {
      id: 'feature-fast-easy',
      icon: Zap,
      title: t.features.fast,
      description: t.features.fastDesc,
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'feature-secure',
      icon: Shield,
      title: t.features.secure,
      description: t.features.secureDesc,
      color: 'from-secondary to-accent',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'feature-community',
      icon: Users,
      title: t.features.community,
      description: t.features.communityDesc,
      color: 'from-accent to-support',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'feature-services',
      icon: Briefcase,
      title: t.features.services,
      description: t.features.servicesDesc,
      color: 'from-support to-primary',
      bgColor: 'bg-support/10'
    }
  ];

  const clientSteps = [
    { id: 'client-step-1', step: '1', icon: FileText, text: t.clientSteps.step1, subtitle: t.clientSteps.step1Desc },
    { id: 'client-step-2', step: '2', icon: Users, text: t.clientSteps.step2, subtitle: t.clientSteps.step2Desc },
    { id: 'client-step-3', step: '3', icon: Handshake, text: t.clientSteps.step3, subtitle: t.clientSteps.step3Desc },
    { id: 'client-step-4', step: '4', icon: DollarSign, text: t.clientSteps.step4, subtitle: t.clientSteps.step4Desc }
  ];

  const joseadorSteps = [
    { id: 'joseador-step-1', step: '1', icon: Star, text: t.workerSteps.step1, subtitle: t.workerSteps.step1Desc },
    { id: 'joseador-step-2', step: '2', icon: Search, text: t.workerSteps.step2, subtitle: t.workerSteps.step2Desc },
    { id: 'joseador-step-3', step: '3', icon: Target, text: t.workerSteps.step3, subtitle: t.workerSteps.step3Desc },
    { id: 'joseador-step-4', step: '4', icon: Wallet, text: t.workerSteps.step4, subtitle: t.workerSteps.step4Desc }
  ];
  
  const popularCategories = [
    { id: 'cat-home-repairs', name: t.categories.homeRepairs, image: "https://static.wixstatic.com/media/307f6c_61f95d8473ac41ca814dfe229da11d7c~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-graphic-design', name: t.categories.graphicDesign, image: "https://static.wixstatic.com/media/307f6c_8ccdf3d4e86f4f5f8a61a88014e52c49~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-web-dev', name: t.categories.webDev, image: "https://static.wixstatic.com/media/307f6c_f778337da6854a3dba5db8beb618ee53~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-cleaning', name: t.categories.cleaning, image: "https://static.wixstatic.com/media/307f6c_8c037a2899024e9aa708cadcc6975cb6~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-business', name: t.categories.business, image: "https://static.wixstatic.com/media/307f6c_e2795e63b1c2467b88994052f4fa0535~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-tutoring', name: t.categories.tutoring, image: "https://static.wixstatic.com/media/307f6c_ca9a52e42a0c41b4b7a7518af1bc2036~mv2.png?originWidth=320&originHeight=448" },
  ];

  return (
    <>
      <style>{`
        .btn-gradient {
          background-image: linear-gradient(90deg, #0E9FA8, #3AB689, #71D261);
          background-size: 200% auto;
          transition: background-position 0.5s ease, transform 0.3s ease;
        }
        .btn-gradient:hover {
          background-position: right center;
          transform: translateY(-2px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #0E9FA8 0%, #3AB689 30%, #71D261 60%, #55C376 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          background-size: 200% auto;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(14, 159, 168, 0.2), 0 10px 20px rgba(113, 210, 97, 0.15);
          background: linear-gradient(135deg, rgba(14, 159, 168, 0.08) 0%, rgba(58, 182, 137, 0.08) 30%, rgba(113, 210, 97, 0.08) 100%);
        }
        .white-section-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .white-section-hover:hover {
          background: linear-gradient(135deg, rgba(14, 159, 168, 0.05) 0%, rgba(58, 182, 137, 0.05) 30%, rgba(113, 210, 97, 0.05) 100%);
        }
        .pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(113, 210, 97, 0.5), 0 0 50px rgba(14, 159, 168, 0.3); 
          }
          50% { 
            box-shadow: 0 0 45px rgba(113, 210, 97, 0.9), 0 0 80px rgba(14, 159, 168, 0.6); 
          }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        /* Enhanced animated background gradients */
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #0E9FA8, #3AB689, #71D261, #55C376, #0E9FA8);
          background-size: 400% 400%;
          animation: gradient-animation 15s ease infinite;
        }
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Floating particles effect */
        .particle {
          position: absolute;
          pointer-events: none;
        }
        .particle::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        /* Glow effect for sections */
        .section-glow {
          position: relative;
        }
        .section-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(113, 210, 97, 0.5), transparent);
        }
        
        /* Enhanced card animations */
        .enhanced-card {
          position: relative;
          overflow: hidden;
        }
        .enhanced-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: card-shine 3s infinite;
        }
        @keyframes card-shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Ultra dynamic background animations */
        @keyframes float-up {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }

        @keyframes float-down {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(30px) rotate(-180deg); }
        }

        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse-expand {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .dynamic-bg-element {
          animation: float-up 6s ease-in-out infinite;
        }

        .dynamic-bg-element-alt {
          animation: float-down 7s ease-in-out infinite;
        }

        .rotating-element {
          animation: rotate-slow 20s linear infinite;
        }

        .pulsing-element {
          animation: pulse-expand 4s ease-in-out infinite;
        }

        /* Gradient mesh background */
        .gradient-mesh {
          background: linear-gradient(135deg, 
            rgba(14, 159, 168, 0.1) 0%,
            rgba(58, 182, 137, 0.08) 25%,
            rgba(113, 210, 97, 0.1) 50%,
            rgba(85, 195, 118, 0.08) 75%,
            rgba(14, 159, 168, 0.1) 100%);
          animation: gradient-shift 8s ease infinite;
        }

        /* Animated border glow */
        .border-glow {
          position: relative;
          border: 2px solid transparent;
          background-clip: padding-box;
          animation: border-glow-animation 3s ease-in-out infinite;
        }

        @keyframes border-glow-animation {
          0%, 100% {
            box-shadow: 0 0 20px rgba(113, 210, 97, 0.3), inset 0 0 20px rgba(14, 159, 168, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(113, 210, 97, 0.6), inset 0 0 30px rgba(14, 159, 168, 0.2);
          }
        }

        /* Flowing gradient animation */
        .flowing-gradient {
          background: linear-gradient(90deg, 
            #0E9FA8 0%, 
            #3AB689 25%, 
            #71D261 50%, 
            #55C376 75%, 
            #0E9FA8 100%);
          background-size: 200% 100%;
          animation: flowing 8s ease infinite;
        }

        @keyframes flowing {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-background via-white to-background text-foreground font-paragraph overflow-clip relative">
        {/* Dynamic animated background layer */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            animate={{ 
              y: [0, -100, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 100, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-accent/15 via-support/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, 50, 0],
              y: [0, -50, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-secondary/12 via-primary/8 to-transparent rounded-full blur-3xl"
          />
        </div>
        
        {/* Hero Section - Ultra Dynamic */}
        <section className="relative h-screen md:min-h-screen flex items-center justify-center w-full overflow-hidden pt-12 md:pt-20 z-10">
          <FloatingOrbs />
          {/* Language Switcher - Top Right */}
          <div className="absolute top-6 right-6 z-50">
            <LanguageSwitcher />
          </div>
          <div className="absolute inset-0 z-0">
            <ParallaxImage 
              src="https://static.wixstatic.com/media/307f6c_459db4e37d4c4a09830e7ff2da30e8f8~mv2.png?originWidth=1600&originHeight=896"
              alt="Un profesional dominicano sonriendo en un entorno de trabajo moderno y luminoso"
              className="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-secondary/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-support/20"></div>
            <div className="absolute inset-0 bg-black/25"></div>
          </div>
          
          <div className="relative z-10 max-w-[120rem] mx-auto px-4 md:px-12 text-center flex flex-col items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative z-20 w-full"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-4 md:mb-8 pulse-glow"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={18} className="text-yellow-300" />
                </motion.div>
                <span className="text-white font-heading font-semibold text-sm md:text-base">{t.heroWelcome}</span>
              </motion.div>

              <motion.h1 
                className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-3 md:mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="inline-block">{t.heroTitle}</span>
              </motion.h1>
              <motion.p 
                className="font-heading text-xl md:text-3xl text-white mb-4 md:mb-8 font-semibold"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {t.heroSubtitle}
              </motion.p>
              <motion.p 
                className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {t.heroDescription}
              </motion.p>
              
              {/* Stats Row - Real indicators */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12">
                <AnimatedStat label={t.heroStats.growing} icon={TrendingUp} delay={3} />
                <AnimatedStat label={t.heroStats.opportunities} icon={Briefcase} delay={4} />
                <AnimatedStat label={t.heroStats.quality} icon={Star} delay={5} />
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg btn-gradient text-white font-heading font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all w-full sm:w-auto relative overflow-hidden group"
                  >
                    <span className="relative z-10">{t.heroButtons.start}</span>
                    <ArrowRight className="inline-block ml-2 relative z-10" size={20} />
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg bg-white/10 backdrop-blur-sm text-white font-heading font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all w-full sm:w-auto"
                  >
                    {t.heroButtons.learnMore}
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Why Choose JOSEAME - Completely Redesigned */}
        <section className="py-20 md:py-48 px-4 md:px-12 relative overflow-hidden section-glow z-10">
          {/* Ultra vibrant animated background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -80, 0],
                x: [0, 60, 0],
                scale: [1, 1.25, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-60 -right-60 w-[900px] h-[900px] bg-gradient-to-br from-primary/60 via-secondary/50 to-transparent rounded-full blur-3xl shadow-2xl"
            />
            <motion.div
              animate={{ 
                y: [0, 80, 0],
                x: [0, -60, 0],
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -bottom-60 -left-60 w-[900px] h-[900px] bg-gradient-to-tr from-accent/60 via-support/50 to-transparent rounded-full blur-3xl shadow-2xl"
            />
            <motion.div
              animate={{ 
                y: [0, 50, 0],
                x: [0, -50, 0],
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              className="absolute top-1/2 right-1/4 w-[700px] h-[700px] bg-gradient-to-bl from-secondary/50 via-primary/40 to-transparent rounded-full blur-3xl shadow-xl"
            />
            <motion.div
              animate={{ 
                y: [0, -60, 0],
                x: [0, 70, 0],
                scale: [1, 1.18, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-support/40 via-accent/30 to-transparent rounded-full blur-3xl"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/30 pointer-events-none"></div>
          
          <div className="max-w-[120rem] mx-auto relative z-10">
            <AnimatedElement className="text-center mb-20 md:mb-32">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/40 to-secondary/40 px-8 py-4 rounded-full border-2 border-primary/60 mb-8 md:mb-12 backdrop-blur-md shadow-2xl"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles size={20} className="text-primary" />
                </motion.div>
                <span className="text-primary font-heading font-bold text-base md:text-lg">{t.featuresSection.badge}</span>
              </motion.div>
              <h2 className="font-heading text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8 md:mb-10 leading-tight drop-shadow-lg">{t.featuresSection.title}</h2>
              <p className="text-xl md:text-3xl text-foreground max-w-5xl mx-auto font-paragraph leading-relaxed font-semibold">{t.featuresSection.description}</p>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const gradients = [
                  { bg: 'from-primary to-secondary', light: 'from-primary/25 to-secondary/25', icon: 'text-white', border: 'border-primary/40', hover: 'hover:border-primary/80' },
                  { bg: 'from-secondary to-accent', light: 'from-secondary/25 to-accent/25', icon: 'text-white', border: 'border-secondary/40', hover: 'hover:border-secondary/80' },
                  { bg: 'from-accent to-support', light: 'from-accent/25 to-support/25', icon: 'text-white', border: 'border-accent/40', hover: 'hover:border-accent/80' },
                  { bg: 'from-support to-primary', light: 'from-support/25 to-primary/25', icon: 'text-white', border: 'border-support/40', hover: 'hover:border-support/80' }
                ];
                const colorSet = gradients[index % gradients.length];
                
                return (
                  <AnimatedElement key={feature.id} delay={index * 100}>
                    <motion.div
                      whileHover={{ y: -24, scale: 1.06 }}
                      transition={{ duration: 0.4 }}
                      className={`enhanced-card relative group overflow-hidden rounded-3xl p-10 md:p-14 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-2 ${colorSet.border} ${colorSet.hover} shadow-2xl hover:shadow-3xl transition-all duration-500`}
                    >
                      {/* Animated gradient overlay on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorSet.bg} opacity-5`}></div>
                      </div>
                      
                      {/* Animated background particles */}
                      <motion.div
                        animate={{ 
                          y: [0, -20, 0],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${colorSet.bg} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}
                      />
                      
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          transition={{ duration: 0.5 }}
                          className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${colorSet.bg} p-6 md:p-8 mb-8 md:mb-10 group-hover:shadow-3xl transition-all shadow-2xl flex items-center justify-center`}
                        >
                          <Icon className="w-full h-full text-white" />
                        </motion.div>
                        <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-5 md:mb-6">{feature.title}</h3>
                        <p className="text-lg md:text-xl text-muted-text leading-relaxed font-paragraph mb-8 md:mb-10">{feature.description}</p>
                        <motion.div 
                          className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${colorSet.light} border-2 ${colorSet.border} group-hover:shadow-xl transition-all`}
                          whileHover={{ x: 6 }}
                        >
                          <span className={`font-heading font-bold text-base ${colorSet.icon === 'text-white' ? 'text-primary' : colorSet.icon}`}>Descubre más</span>
                          <ArrowRight size={18} className={`${colorSet.icon === 'text-white' ? 'text-primary' : colorSet.icon} group-hover:translate-x-1 transition-transform`} />
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works - Client Section - Completely Redesigned */}
        <section className="py-20 md:py-48 px-4 md:px-12 relative overflow-hidden section-glow bg-gradient-to-b from-white via-secondary/5 to-white z-10">
          {/* Ultra vibrant animated background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, 70, 0],
                x: [0, -70, 0],
                scale: [1, 1.25, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-40 -right-40 w-[900px] h-[900px] bg-gradient-to-tl from-secondary/60 via-primary/50 to-transparent rounded-full blur-3xl shadow-2xl"
            />
            <motion.div
              animate={{ 
                y: [0, -60, 0],
                x: [0, 60, 0],
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-primary/50 via-secondary/40 to-transparent rounded-full blur-3xl shadow-xl"
            />
            <motion.div
              animate={{ 
                y: [0, 50, 0],
                x: [0, 50, 0],
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-gradient-to-bl from-secondary/40 via-primary/30 to-transparent rounded-full blur-3xl"
            />
          </div>
          
          <div className="max-w-[120rem] mx-auto relative z-10">
            <AnimatedElement className="text-center mb-20 md:mb-32">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/40 to-primary/40 px-8 py-4 rounded-full border-2 border-secondary/60 mb-8 md:mb-12 backdrop-blur-md shadow-2xl"
              >
                <motion.div animate={{ bounce: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Rocket size={20} className="text-secondary" />
                </motion.div>
                <span className="text-secondary font-heading font-bold text-base md:text-lg">{t.clientSection.badge}</span>
              </motion.div>
              <h2 className="font-heading text-6xl md:text-8xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent mb-8 md:mb-10 leading-tight">{t.clientSection.title}</h2>
              <p className="text-xl md:text-3xl text-foreground max-w-5xl mx-auto font-paragraph leading-relaxed font-semibold">{t.clientSection.description}</p>
            </AnimatedElement>

            {/* Centered Grid Layout - Modern & Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
              {clientSteps.map((step, index) => {
                const Icon = step.icon;
                const colors = ['from-secondary to-primary', 'from-primary to-accent', 'from-accent to-support', 'from-support to-secondary'];
                const colorClass = colors[index % colors.length];
                
                return (
                  <AnimatedElement key={step.id} delay={index * 100}>
                    <motion.div
                      whileHover={{ y: -16, scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      className="relative group h-full"
                    >
                      {/* Step Number Badge - Floating */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                        className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-heading font-bold text-2xl md:text-3xl shadow-2xl border-4 border-white z-20 group-hover:shadow-3xl transition-all`}
                      >
                        {step.step}
                      </motion.div>

                      {/* Main Card */}
                      <div className="enhanced-card relative group rounded-3xl p-8 md:p-10 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-2 border-secondary/30 group-hover:border-secondary/70 shadow-xl hover:shadow-2xl transition-all h-full pt-16 md:pt-20 flex flex-col">
                        {/* Animated background gradient on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-3 rounded-3xl`}></div>
                        </div>

                        {/* Icon Container */}
                        <div className="relative z-10 flex justify-center mb-6 md:mb-8">
                          <motion.div 
                            whileHover={{ scale: 1.25, rotate: 12 }}
                            transition={{ duration: 0.5 }}
                            className={`p-4 md:p-6 bg-gradient-to-br ${colorClass} rounded-2xl group-hover:shadow-2xl transition-all`}
                          >
                            <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col">
                          <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4 text-center">{step.text}</h3>
                          <p className="text-sm md:text-base text-muted-text leading-relaxed text-center font-paragraph flex-1">{step.subtitle}</p>
                        </div>

                        {/* Bottom accent line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className={`h-1 bg-gradient-to-r ${colorClass} rounded-full mt-6 md:mt-8 origin-left`}
                        />
                      </div>

                      {/* Connecting Arrow - Between cards on desktop */}
                      {index < clientSteps.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                          className="hidden lg:flex absolute -right-8 top-1/2 transform -translate-y-1/2 z-10"
                        >
                          <motion.div
                            animate={{ x: [0, 6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight size={28} className="text-secondary" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedElement>
                );
              })}
            </div>

            {/* Mobile Step Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex lg:hidden justify-center items-center gap-3 mt-12 md:mt-16"
            >
              {clientSteps.map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary to-primary"
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works - Joseador Section - Completely Redesigned */}
        <section className="py-20 md:py-48 px-4 md:px-12 relative overflow-hidden section-glow bg-gradient-to-b from-white via-accent/5 to-white z-10">
          {/* Ultra vibrant animated background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -80, 0],
                x: [0, 80, 0],
                scale: [1, 1.25, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-gradient-to-br from-accent/60 via-support/50 to-transparent rounded-full blur-3xl shadow-2xl"
            />
            <motion.div
              animate={{ 
                y: [0, 70, 0],
                x: [0, -80, 0],
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-40 -right-40 w-[800px] h-[800px] bg-gradient-to-tl from-support/50 via-accent/40 to-transparent rounded-full blur-3xl shadow-xl"
            />
            <motion.div
              animate={{ 
                y: [0, 60, 0],
                x: [0, -60, 0],
                scale: [1, 1.18, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-gradient-to-bl from-accent/45 via-support/35 to-transparent rounded-full blur-3xl"
            />
          </div>
          
          <div className="max-w-[120rem] mx-auto relative z-10">
            <AnimatedElement className="text-center mb-20 md:mb-32">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/40 to-support/40 px-8 py-4 rounded-full border-2 border-accent/60 mb-8 md:mb-12 backdrop-blur-md shadow-2xl"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Target size={20} className="text-accent" />
                </motion.div>
                <span className="text-accent font-heading font-bold text-base md:text-lg">{t.workerSection.badge}</span>
              </motion.div>
              <h2 className="font-heading text-6xl md:text-8xl font-bold bg-gradient-to-r from-accent via-support to-secondary bg-clip-text text-transparent mb-8 md:mb-10 leading-tight">{t.workerSection.title}</h2>
              <p className="text-xl md:text-3xl text-foreground max-w-5xl mx-auto font-paragraph leading-relaxed font-semibold">{t.workerSection.description}</p>
            </AnimatedElement>

            {/* Centered Grid Layout - Modern & Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
              {joseadorSteps.map((step, index) => {
                const Icon = step.icon;
                const colors = ['from-accent to-support', 'from-support to-secondary', 'from-secondary to-primary', 'from-primary to-accent'];
                const colorClass = colors[index % colors.length];
                
                return (
                  <AnimatedElement key={step.id} delay={index * 100}>
                    <motion.div
                      whileHover={{ y: -16, scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      className="relative group h-full"
                    >
                      {/* Step Number Badge - Floating */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                        className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-heading font-bold text-2xl md:text-3xl shadow-2xl border-4 border-white z-20 group-hover:shadow-3xl transition-all`}
                      >
                        {step.step}
                      </motion.div>

                      {/* Main Card */}
                      <div className="enhanced-card relative group rounded-3xl p-8 md:p-10 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border-2 border-accent/30 group-hover:border-accent/70 shadow-xl hover:shadow-2xl transition-all h-full pt-16 md:pt-20 flex flex-col">
                        {/* Animated background gradient on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-3 rounded-3xl`}></div>
                        </div>

                        {/* Icon Container */}
                        <div className="relative z-10 flex justify-center mb-6 md:mb-8">
                          <motion.div 
                            whileHover={{ scale: 1.25, rotate: -12 }}
                            transition={{ duration: 0.5 }}
                            className={`p-4 md:p-6 bg-gradient-to-br ${colorClass} rounded-2xl group-hover:shadow-2xl transition-all`}
                          >
                            <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col">
                          <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4 text-center">{step.text}</h3>
                          <p className="text-sm md:text-base text-muted-text leading-relaxed text-center font-paragraph flex-1">{step.subtitle}</p>
                        </div>

                        {/* Bottom accent line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className={`h-1 bg-gradient-to-r ${colorClass} rounded-full mt-6 md:mt-8 origin-left`}
                        />
                      </div>

                      {/* Connecting Arrow - Between cards on desktop */}
                      {index < joseadorSteps.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                          className="hidden lg:flex absolute -right-8 top-1/2 transform -translate-y-1/2 z-10"
                        >
                          <motion.div
                            animate={{ x: [0, 6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight size={28} className="text-accent" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedElement>
                );
              })}
            </div>

            {/* Mobile Step Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex lg:hidden justify-center items-center gap-3 mt-12 md:mt-16"
            >
              {joseadorSteps.map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-support"
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Popular Categories Section */}
        <section className="py-12 md:py-32 px-4 md:px-12 bg-gradient-to-b from-white via-primary/5 to-background relative overflow-hidden section-glow z-10">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, 40, 0],
                x: [0, -40, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                y: [0, -40, 0],
                x: [0, 40, 0],
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-l from-secondary/20 to-transparent rounded-full blur-3xl"
            />
          </div>
          <div className="max-w-[120rem] mx-auto relative z-10">
            <AnimatedElement className="text-center mb-12 md:mb-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full border border-primary/20 mb-4 md:mb-8"
              >
                <Briefcase size={18} className="text-primary" />
                <span className="text-primary font-heading font-semibold text-sm md:text-base">{t.categoriesSection.badge}</span>
              </motion.div>
              <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6">{t.categoriesSection.title}</h2>
              <p className="text-lg md:text-xl text-muted-text max-w-3xl mx-auto">{t.categoriesSection.description}</p>
            </AnimatedElement>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {popularCategories.map((category, index) => (
                <AnimatedElement key={category.id} delay={index * 50}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.05 }}
                    className="enhanced-card card-hover relative group overflow-hidden rounded-2xl h-48 md:h-56 cursor-pointer shadow-lg hover:shadow-2xl"
                  >
                    <Image 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      width={320}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 md:p-6">
                      <h3 className="font-heading text-lg md:text-xl font-bold text-white group-hover:translate-y(-2px) transition-transform">{category.name}</h3>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* 3D Carousel Section */}
        <section className="py-12 md:py-32 px-4 md:px-12 bg-gradient-to-b from-background via-white to-white relative overflow-hidden section-glow z-10">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -40, 0],
                x: [0, 50, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-secondary/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                y: [0, 40, 0],
                x: [0, -50, 0],
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl"
            />
          </div>
          <div className="max-w-[120rem] mx-auto relative z-10">
            <AnimatedElement className="text-center mb-12 md:mb-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-secondary/10 px-6 py-3 rounded-full border border-secondary/20 mb-4 md:mb-8"
              >
                <Heart size={18} className="text-secondary" />
                <span className="text-secondary font-heading font-semibold text-sm md:text-base">{t.testimonials.badge}</span>
              </motion.div>
              <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6">{t.testimonials.title}</h2>
              <p className="text-lg md:text-xl text-muted-text max-w-3xl mx-auto">{t.testimonials.description}</p>
            </AnimatedElement>
            <Flow3DCarousel />
          </div>
        </section>

        {/* CTA Section - Ultra Dynamic */}
        <section className="py-12 md:py-32 px-4 md:px-12 relative overflow-hidden z-10">
          <div className="max-w-[120rem] mx-auto rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <FloatingOrbs />
            {/* Enhanced animated background pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
              />
            </div>
            <div className="absolute -top-1/2 -left-1/4 w-full h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-8 -rotate-45"></div>
            
            {/* Additional animated gradient overlays */}
            <motion.div
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none"
            />
            
            <AnimatedElement className="relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-4 md:mb-8 pulse-glow"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={20} className="text-yellow-300" />
                </motion.div>
                <span className="text-white font-heading font-semibold text-sm md:text-base">{t.ctaBadge}</span>
              </motion.div>
              <motion.h2 
                className="font-heading text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 40px rgba(255, 255, 255, 0.8)",
                    "0 0 20px rgba(255, 255, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {t.ctaTitle}
              </motion.h2>
              <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                {t.ctaDescription}
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 md:px-14 py-4 md:py-6 bg-white text-primary font-heading text-base md:text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">{t.ctaButton}</span>
                  <ArrowRight className="inline-block ml-2 relative z-10" size={24} />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              </Link>
            </AnimatedElement>
          </div>
        </section>
      </div>
    </>
  );
}
