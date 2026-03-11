import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, UserPlus, Users, Shield, Briefcase, MessageSquare, DollarSign, Star, User, AlertCircle, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

// Visual mode themes
const themes = {
  'Modern Silver': {
    background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
    blur: 'blur(20px)',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    saturation: 1,
  },
  'Warm': {
    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 224, 71, 0.85) 100%)',
    blur: 'blur(16px)',
    shadow: '0 20px 40px -12px rgba(251, 146, 60, 0.3)',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    saturation: 1.2,
  },
  'Minimal Classic': {
    background: 'rgba(255, 255, 255, 0.98)',
    blur: 'blur(0px)',
    shadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    saturation: 0.9,
  },
  'Transparent': {
    background: 'rgba(255, 255, 255, 0.7)',
    blur: 'blur(30px)',
    shadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    saturation: 1.1,
  },
};

// Flow steps data
const flowSteps = [
  {
    id: 1,
    title: 'Bienvenido a JOSEAME',
    titleEn: 'Welcome to JOSEAME',
    benefit: 'Conecta clientes con profesionales verificados',
    benefitEn: 'Connect clients with verified professionals',
    icon: Home,
    category: 'HOME',
    details: [
      'Plataforma de confianza para servicios profesionales',
      'Sistema de escrow para pagos seguros',
      'Verificación de identidad y habilidades',
      'Reseñas y calificaciones transparentes',
    ],
    detailsEn: [
      'Trusted platform for professional services',
      'Escrow system for secure payments',
      'Identity and skills verification',
      'Transparent reviews and ratings',
    ],
    diagram: { blocks: ['Cliente', 'JOSEAME', 'Joseador'], blocksEn: ['Client', 'JOSEAME', 'Worker'], flow: 'bidirectional' },
    cta: 'Comenzar',
    ctaEn: 'Get Started',
  },
  {
    id: 2,
    title: 'Cómo Funciona',
    titleEn: 'How It Works',
    benefit: 'Proceso simple y seguro de principio a fin',
    benefitEn: 'Simple and secure process from start to finish',
    icon: TrendingUp,
    category: 'HOME',
    details: [
      'Publica o encuentra trabajos fácilmente',
      'Chat directo para negociar términos',
      'Pago protegido con sistema de escrow',
      'Califica y construye reputación',
    ],
    detailsEn: [
      'Post or find jobs easily',
      'Direct chat to negotiate terms',
      'Protected payment with escrow system',
      'Rate and build reputation',
    ],
    diagram: { blocks: ['Publicar', 'Negociar', 'Ejecutar', 'Pagar'], blocksEn: ['Post', 'Negotiate', 'Execute', 'Pay'], flow: 'linear' },
    cta: 'Ver Ejemplo',
    ctaEn: 'See Example',
  },
  {
    id: 3,
    title: 'Crear Cuenta',
    titleEn: 'Create Account',
    benefit: 'Registro rápido en menos de 2 minutos',
    benefitEn: 'Quick registration in less than 2 minutes',
    icon: UserPlus,
    category: 'ONBOARDING',
    details: [
      'Email y contraseña o login social',
      'Verificación de correo electrónico',
      'Información básica de perfil',
      'Acepta términos y condiciones',
    ],
    detailsEn: [
      'Email and password or social login',
      'Email verification',
      'Basic profile information',
      'Accept terms and conditions',
    ],
    diagram: { blocks: ['Email', 'Verificar', 'Perfil'], blocksEn: ['Email', 'Verify', 'Profile'], flow: 'linear' },
    cta: 'Registrarse',
    ctaEn: 'Sign Up',
  },
  {
    id: 4,
    title: 'Selección de Rol',
    titleEn: 'Role Selection',
    benefit: '¿Buscas servicios o ofreces tus habilidades?',
    benefitEn: 'Looking for services or offering your skills?',
    icon: Users,
    category: 'ONBOARDING',
    details: [
      'Cliente: Publica necesidades y contrata',
      'Joseador: Ofrece servicios y gana dinero',
      'Puedes cambiar de rol en cualquier momento',
      'Acceso a funciones específicas de cada rol',
    ],
    detailsEn: [
      'Client: Post needs and hire',
      'Worker: Offer services and earn money',
      'You can change roles anytime',
      'Access to role-specific features',
    ],
    diagram: { blocks: ['Cliente', 'o', 'Joseador'], blocksEn: ['Client', 'or', 'Worker'], flow: 'choice' },
    cta: 'Elegir Rol',
    ctaEn: 'Choose Role',
  },
  {
    id: 5,
    title: 'Publicar Necesidad',
    titleEn: 'Post a Need',
    benefit: 'Describe tu proyecto y recibe ofertas',
    benefitEn: 'Describe your project and receive offers',
    icon: Briefcase,
    category: 'CLIENTE',
    details: [
      'Categoría del servicio requerido',
      'Ubicación y disponibilidad',
      'Presupuesto estimado',
      'Nivel de urgencia y detalles',
    ],
    detailsEn: [
      'Service category required',
      'Location and availability',
      'Estimated budget',
      'Urgency level and details',
    ],
    diagram: { blocks: ['Describir', 'Publicar', 'Recibir Ofertas'], blocksEn: ['Describe', 'Post', 'Receive Offers'], flow: 'linear' },
    cta: 'Publicar Trabajo',
    ctaEn: 'Post Job',
  },
  {
    id: 6,
    title: 'Matching de Joseadores',
    titleEn: 'Worker Matching',
    benefit: 'Encuentra profesionales calificados cerca de ti',
    benefitEn: 'Find qualified professionals near you',
    icon: Users,
    category: 'CLIENTE',
    details: [
      'Algoritmo inteligente de matching',
      'Filtros por ubicación, precio y experiencia',
      'Ver perfiles, reseñas y portafolio',
      'Comparar múltiples candidatos',
    ],
    detailsEn: [
      'Smart matching algorithm',
      'Filters by location, price and experience',
      'View profiles, reviews and portfolio',
      'Compare multiple candidates',
    ],
    diagram: { blocks: ['Buscar', 'Filtrar', 'Comparar'], blocksEn: ['Search', 'Filter', 'Compare'], flow: 'linear' },
    cta: 'Ver Candidatos',
    ctaEn: 'View Candidates',
  },
  {
    id: 7,
    title: 'Chat y Negociación',
    titleEn: 'Chat and Negotiation',
    benefit: 'Comunícate directamente y acuerda términos',
    benefitEn: 'Communicate directly and agree on terms',
    icon: MessageSquare,
    category: 'CLIENTE',
    details: [
      'Chat en tiempo real seguro',
      'Negociar precio y condiciones',
      'Compartir archivos y referencias',
      'Historial completo de conversación',
    ],
    detailsEn: [
      'Secure real-time chat',
      'Negotiate price and conditions',
      'Share files and references',
      'Complete conversation history',
    ],
    diagram: { blocks: ['Chatear', 'Negociar', 'Acordar'], blocksEn: ['Chat', 'Negotiate', 'Agree'], flow: 'linear' },
    cta: 'Abrir Chat',
    ctaEn: 'Open Chat',
  },
  {
    id: 8,
    title: 'Confirmación + Escrow',
    titleEn: 'Confirmation + Escrow',
    benefit: 'Pago seguro retenido hasta completar el trabajo',
    benefitEn: 'Secure payment held until work is completed',
    icon: DollarSign,
    category: 'CLIENTE',
    details: [
      'Deposita Piquetes en escrow',
      'Fondos protegidos hasta finalizar',
      'Joseador ve compromiso confirmado',
      'Liberación automática o manual',
    ],
    detailsEn: [
      'Deposit Piquetes in escrow',
      'Funds protected until completion',
      'Worker sees confirmed commitment',
      'Automatic or manual release',
    ],
    diagram: { blocks: ['Depositar', 'Escrow', 'Proteger'], blocksEn: ['Deposit', 'Escrow', 'Protect'], flow: 'linear' },
    cta: 'Confirmar Pago',
    ctaEn: 'Confirm Payment',
  },
  {
    id: 9,
    title: 'Servicio Completado',
    titleEn: 'Service Completed',
    benefit: 'Revisa el trabajo y confirma satisfacción',
    benefitEn: 'Review the work and confirm satisfaction',
    icon: Star,
    category: 'CLIENTE',
    details: [
      'Joseador marca trabajo como completado',
      'Revisa evidencia y calidad',
      'Solicita ajustes si es necesario',
      'Confirma finalización satisfactoria',
    ],
    detailsEn: [
      'Worker marks work as completed',
      'Review evidence and quality',
      'Request adjustments if needed',
      'Confirm satisfactory completion',
    ],
    diagram: { blocks: ['Revisar', 'Aprobar', 'Finalizar'], blocksEn: ['Review', 'Approve', 'Finalize'], flow: 'linear' },
    cta: 'Revisar Trabajo',
    ctaEn: 'Review Work',
  },
  {
    id: 10,
    title: 'Liberación + Rating',
    titleEn: 'Release + Rating',
    benefit: 'Paga al profesional y deja tu reseña',
    benefitEn: 'Pay the professional and leave your review',
    icon: Star,
    category: 'CLIENTE',
    details: [
      'Fondos liberados al Joseador',
      'Califica el servicio (1-5 estrellas)',
      'Deja comentario público',
      'Construye reputación del profesional',
    ],
    detailsEn: [
      'Funds released to Worker',
      'Rate the service (1-5 stars)',
      'Leave public comment',
      'Build professional reputation',
    ],
    diagram: { blocks: ['Liberar', 'Calificar', 'Reseñar'], blocksEn: ['Release', 'Rate', 'Review'], flow: 'linear' },
    cta: 'Calificar',
    ctaEn: 'Rate',
  },
  {
    id: 11,
    title: 'Perfil + Habilidades',
    titleEn: 'Profile + Skills',
    benefit: 'Muestra tu experiencia y destaca',
    benefitEn: 'Show your experience and stand out',
    icon: User,
    category: 'JOSEADOR',
    details: [
      'Completa tu perfil profesional',
      'Lista tus habilidades y categorías',
      'Agrega portafolio y certificados',
      'Define tu zona de trabajo',
    ],
    detailsEn: [
      'Complete your professional profile',
      'List your skills and categories',
      'Add portfolio and certificates',
      'Define your work area',
    ],
    diagram: { blocks: ['Perfil', 'Skills', 'Portafolio'], blocksEn: ['Profile', 'Skills', 'Portfolio'], flow: 'linear' },
    cta: 'Completar Perfil',
    ctaEn: 'Complete Profile',
  },
  {
    id: 12,
    title: 'Verificación de Identidad',
    titleEn: 'Identity Verification',
    benefit: 'Genera confianza con verificación oficial',
    benefitEn: 'Build trust with official verification',
    icon: Shield,
    category: 'JOSEADOR',
    details: [
      'Sube documento de identidad (INE/Pasaporte)',
      'Selfie para verificación facial',
      'Proceso de revisión 24-48 hrs',
      'Badge de verificado en tu perfil',
    ],
    detailsEn: [
      'Upload identity document (ID/Passport)',
      'Selfie for facial verification',
      'Review process 24-48 hrs',
      'Verified badge on your profile',
    ],
    diagram: { blocks: ['Documento', 'Selfie', 'Verificar'], blocksEn: ['Document', 'Selfie', 'Verify'], flow: 'linear' },
    cta: 'Verificar Identidad',
    ctaEn: 'Verify Identity',
  },
  {
    id: 13,
    title: 'Verificación de Skills',
    titleEn: 'Skills Verification',
    benefit: 'Demuestra tu experiencia con evidencia',
    benefitEn: 'Prove your experience with evidence',
    icon: Shield,
    category: 'JOSEADOR',
    details: [
      'Sube certificados profesionales',
      'Fotos de trabajos anteriores',
      'Pruebas de conocimiento opcionales',
      'Aumenta tu ranking y visibilidad',
    ],
    detailsEn: [
      'Upload professional certificates',
      'Photos of previous work',
      'Optional knowledge tests',
      'Increase your ranking and visibility',
    ],
    diagram: { blocks: ['Certificados', 'Fotos', 'Pruebas'], blocksEn: ['Certificates', 'Photos', 'Tests'], flow: 'linear' },
    cta: 'Verificar Skills',
    ctaEn: 'Verify Skills',
  },
  {
    id: 14,
    title: 'Aplicar a Trabajos',
    titleEn: 'Apply to Jobs',
    benefit: 'Encuentra oportunidades que se ajusten a ti',
    benefitEn: 'Find opportunities that fit you',
    icon: Briefcase,
    category: 'JOSEADOR',
    details: [
      'Explora trabajos disponibles',
      'Filtra por categoría y ubicación',
      'Gasta Piquetes para aplicar',
      'Propón tu precio y disponibilidad',
    ],
    detailsEn: [
      'Explore available jobs',
      'Filter by category and location',
      'Spend Piquetes to apply',
      'Propose your price and availability',
    ],
    diagram: { blocks: ['Buscar', 'Aplicar', 'Proponer'], blocksEn: ['Search', 'Apply', 'Propose'], flow: 'linear' },
    cta: 'Ver Trabajos',
    ctaEn: 'View Jobs',
  },
  {
    id: 15,
    title: 'Chat + Confirmación',
    titleEn: 'Chat + Confirmation',
    benefit: 'Negocia términos y cierra el trato',
    benefitEn: 'Negotiate terms and close the deal',
    icon: MessageSquare,
    category: 'JOSEADOR',
    details: [
      'Responde preguntas del cliente',
      'Negocia precio final',
      'Confirma disponibilidad y fecha',
      'Acepta el trabajo oficialmente',
    ],
    detailsEn: [
      'Answer client questions',
      'Negotiate final price',
      'Confirm availability and date',
      'Accept the job officially',
    ],
    diagram: { blocks: ['Negociar', 'Acordar', 'Aceptar'], blocksEn: ['Negotiate', 'Agree', 'Accept'], flow: 'linear' },
    cta: 'Negociar',
    ctaEn: 'Negotiate',
  },
  {
    id: 16,
    title: 'Ejecutar Trabajo',
    titleEn: 'Execute Work',
    benefit: 'Realiza el servicio con profesionalismo',
    benefitEn: 'Perform the service professionally',
    icon: Briefcase,
    category: 'JOSEADOR',
    details: [
      'Coordina con el cliente',
      'Ejecuta el servicio acordado',
      'Documenta el progreso',
      'Marca como completado al finalizar',
    ],
    detailsEn: [
      'Coordinate with client',
      'Execute the agreed service',
      'Document progress',
      'Mark as completed when done',
    ],
    diagram: { blocks: ['Coordinar', 'Ejecutar', 'Completar'], blocksEn: ['Coordinate', 'Execute', 'Complete'], flow: 'linear' },
    cta: 'Iniciar Trabajo',
    ctaEn: 'Start Work',
  },
  {
    id: 17,
    title: 'Cobro + Reputación',
    titleEn: 'Payment + Reputation',
    benefit: 'Recibe tu pago y construye tu marca',
    benefitEn: 'Receive your payment and build your brand',
    icon: DollarSign,
    category: 'JOSEADOR',
    details: [
      'Cliente aprueba el trabajo',
      'Fondos liberados a tu wallet',
      'Recibe calificación del cliente',
      'Mejora tu ranking y visibilidad',
    ],
    detailsEn: [
      'Client approves the work',
      'Funds released to your wallet',
      'Receive client rating',
      'Improve your ranking and visibility',
    ],
    diagram: { blocks: ['Aprobar', 'Cobrar', 'Calificar'], blocksEn: ['Approve', 'Collect', 'Rate'], flow: 'linear' },
    cta: 'Ver Ganancias',
    ctaEn: 'View Earnings',
  },
  {
    id: 18,
    title: 'Disputas y Soporte',
    titleEn: 'Disputes and Support',
    benefit: 'Resolución justa de conflictos',
    benefitEn: 'Fair conflict resolution',
    icon: AlertCircle,
    category: 'POST-FLOW',
    details: [
      'Abre disputa si hay problemas',
      'Mediación por equipo JOSEAME',
      'Evidencia y documentación',
      'Resolución en 3-5 días hábiles',
    ],
    detailsEn: [
      'Open dispute if there are problems',
      'Mediation by JOSEAME team',
      'Evidence and documentation',
      'Resolution in 3-5 business days',
    ],
    diagram: { blocks: ['Reportar', 'Mediar', 'Resolver'], blocksEn: ['Report', 'Mediate', 'Resolve'], flow: 'linear' },
    cta: 'Soporte',
    ctaEn: 'Support',
  },
  {
    id: 19,
    title: 'Historial',
    titleEn: 'History',
    benefit: 'Accede a todos tus trabajos pasados',
    benefitEn: 'Access all your past work',
    icon: Clock,
    category: 'POST-FLOW',
    details: [
      'Historial completo de transacciones',
      'Trabajos completados y en progreso',
      'Reseñas recibidas y dadas',
      'Estadísticas de desempeño',
    ],
    detailsEn: [
      'Complete transaction history',
      'Completed and in-progress work',
      'Reviews received and given',
      'Performance statistics',
    ],
    diagram: { blocks: ['Trabajos', 'Pagos', 'Reseñas'], blocksEn: ['Jobs', 'Payments', 'Reviews'], flow: 'linear' },
    cta: 'Ver Historial',
    ctaEn: 'View History',
  },
  {
    id: 20,
    title: 'Niveles y Recomendaciones',
    titleEn: 'Levels and Recommendations',
    benefit: 'Crece y desbloquea beneficios',
    benefitEn: 'Grow and unlock benefits',
    icon: TrendingUp,
    category: 'POST-FLOW',
    details: [
      'Sistema de niveles por reputación',
      'Descuentos en Piquetes',
      'Prioridad en búsquedas',
      'Badges especiales y reconocimientos',
    ],
    detailsEn: [
      'Reputation-based level system',
      'Piquete discounts',
      'Search priority',
      'Special badges and recognition',
    ],
    diagram: { blocks: ['Bronce', 'Plata', 'Oro'], blocksEn: ['Bronze', 'Silver', 'Gold'], flow: 'linear' },
    cta: 'Ver Niveles',
    ctaEn: 'View Levels',
  },
];

interface Flow3DCarouselProps {
  onStepChange?: (step: number) => void;
}

export default function Flow3DCarousel({ onStepChange }: Flow3DCarouselProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('Modern Silver');
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showGlow, setShowGlow] = useState(false);
  const [selectedStep, setSelectedStep] = useState<typeof flowSteps[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // Cursor glow effect - optimized with throttling (disabled on mobile)
  useEffect(() => {
    let throttleTimer: NodeJS.Timeout | null = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (prefersReducedMotion || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        setCursorPos({ x: e.clientX, y: e.clientY });
        setShowGlow(true);
        throttleTimer = null;
      }, 32); // ~30fps throttle for better performance
    };

    const handleMouseLeave = () => {
      setShowGlow(false);
      if (throttleTimer) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter' && document.activeElement?.classList.contains('card-3d')) {
        handleFlip(activeIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % flowSteps.length);
    onStepChange?.(activeIndex + 1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + flowSteps.length) % flowSteps.length);
    onStepChange?.(activeIndex - 1);
  };

  const handleFlip = (index: number) => {
    // Open modal instead of flipping
    setSelectedStep(flowSteps[index]);
  };

  const getCardPosition = (index: number) => {
    const diff = index - activeIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(flowSteps.length - 1)) return 'right';
    if (diff === -1 || diff === flowSteps.length - 1) return 'left';
    return 'hidden';
  };

  const theme = themes[selectedTheme];

  return (
    <div className="relative w-full min-h-screen py-12 px-4 overflow-hidden bg-gradient-to-br from-background via-slate-50 to-background">
      {/* Cursor Glow - optimized (hidden on mobile) */}
      {showGlow && !prefersReducedMotion && (
        <motion.div
          className="fixed pointer-events-none z-50 w-56 h-56 rounded-full hidden md:block"
          style={{
            background: 'radial-gradient(circle, rgba(14, 159, 168, 0.08) 0%, rgba(113, 210, 97, 0.05) 50%, transparent 70%)',
            filter: 'blur(40px)',
            left: cursorPos.x - 112,
            top: cursorPos.y - 112,
            willChange: 'transform',
          }}
        />
      )}

      {/* Theme Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(themes).map((themeName) => (
            <Button
              key={themeName}
              variant={selectedTheme === themeName ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTheme(themeName as keyof typeof themes)}
              className="transition-all duration-300"
            >
              {themeName}
            </Button>
          ))}
        </div>
      </div>

      {/* 3D Carousel Container */}
      <div
        ref={containerRef}
        className="relative max-w-7xl mx-auto"
        style={{
          perspective: '2000px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div className="relative h-[600px] md:h-[700px]">
          <AnimatePresence mode="popLayout">
            {flowSteps.map((step, index) => {
              const position = getCardPosition(index);
              if (position === 'hidden') return null;

              const isFlipped = flippedCards.has(index);
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  className={`card-3d absolute top-1/2 left-1/2 w-full max-w-md md:max-w-lg cursor-pointer ${
                    position === 'center' ? 'z-30' : 'z-10'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  initial={{
                    x: '-50%',
                    y: '-50%',
                    rotateY: position === 'left' ? -45 : position === 'right' ? 45 : 0,
                    translateX: position === 'left' ? '-120%' : position === 'right' ? '120%' : '0%',
                    scale: position === 'center' ? 1 : 0.8,
                    opacity: position === 'center' ? 1 : 0.6,
                  }}
                  animate={{
                    x: '-50%',
                    y: position === 'center' ? '-55%' : '-50%',
                    rotateY: isFlipped ? 180 : position === 'left' ? -45 : position === 'right' ? 45 : 0,
                    translateX: position === 'left' ? '-120%' : position === 'right' ? '120%' : '0%',
                    scale: position === 'center' ? 1 : 0.8,
                    opacity: position === 'center' ? 1 : 0.6,
                  }}
                  whileHover={
                    position === 'center' && !prefersReducedMotion
                      ? {
                          y: '-58%',
                          rotateX: 5,
                          scale: 1.02,
                        }
                      : {}
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.2 : 0.4,
                    ease: 'easeInOut',
                  }}
                  onClick={() => position === 'center' && handleFlip(index)}
                  tabIndex={position === 'center' ? 0 : -1}
                >
                  {/* Card Inner Container */}
                  <div
                    className="relative w-full h-[500px] md:h-[600px] rounded-2xl"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front Side */}
                    <div
                      className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        background: theme.background,
                        backdropFilter: theme.blur,
                        boxShadow: theme.shadow,
                        border: theme.border,
                        filter: `saturate(${theme.saturation})`,
                      }}
                    >
                      <div className="mb-6 p-6 rounded-full bg-primary/10">
                        <Icon className="w-16 h-16 text-primary" />
                      </div>
                      <div className="inline-block px-4 py-1 mb-4 rounded-full bg-accent/20 text-accent text-sm font-medium">
                        {step.category}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
                        {language === 'es' ? step.title : step.titleEn}
                      </h3>
                      <p className="text-lg text-muted-text mb-6">{language === 'es' ? step.benefit : step.benefitEn}</p>
                      <div className="text-sm text-muted-text/70">
                        {t.carousel.clickForDetails}
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className="absolute inset-0 rounded-2xl p-8 flex flex-col"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: theme.background,
                        backdropFilter: theme.blur,
                        boxShadow: theme.shadow,
                        border: theme.border,
                        filter: `saturate(${theme.saturation})`,
                      }}
                    >
                      <div className="flex-1 overflow-y-auto">
                        <h4 className="text-2xl font-heading font-bold mb-6 text-foreground">
                          {t.carousel.stepDetails}
                        </h4>
                        <ul className="space-y-3 mb-6">
                          {(language === 'es' ? step.details : step.detailsEn).map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-foreground">
                              <span className="text-accent mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Mini Diagram */}
                        <div className="mb-6 p-4 rounded-lg bg-background/50">
                          <div className="flex items-center justify-center gap-2">
                            {(language === 'es' ? step.diagram.blocks : step.diagram.blocksEn).map((block, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                                  {block}
                                </div>
                                {i < (language === 'es' ? step.diagram.blocks : step.diagram.blocksEn).length - 1 && (
                                  <span className="text-primary">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" size="lg">
                        {language === 'es' ? step.cta : step.ctaEn}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4 pointer-events-none z-40">
          <Button
            variant="outline"
            size="icon"
            className="pointer-events-auto rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
            onClick={handlePrev}
            aria-label={t.carousel.previous}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="pointer-events-auto rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
            onClick={handleNext}
            aria-label={t.carousel.next}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {flowSteps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted-text/30 hover:bg-muted-text/50'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`${t.carousel.goToStep} ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Step Counter */}
      <div className="text-center mt-24 text-muted-text">
        <p className="text-sm">
          {t.carousel.stepCounter} {activeIndex + 1} {t.carousel.of} {flowSteps.length}
        </p>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStep && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-2xl">
                  <div className="p-3 rounded-full bg-primary/10">
                    <selectedStep.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-heading font-bold">{language === 'es' ? selectedStep.title : selectedStep.titleEn}</div>
                    <div className="text-sm font-normal text-muted-text mt-1">{language === 'es' ? selectedStep.benefit : selectedStep.benefitEn}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Category Badge */}
                <div className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium">
                  {selectedStep.category}
                </div>

                {/* Details List */}
                <div>
                  <h4 className="text-lg font-heading font-semibold mb-4 text-foreground">
                    {t.carousel.stepDetails}
                  </h4>
                  <ul className="space-y-3">
                    {(language === 'es' ? selectedStep.details : selectedStep.detailsEn).map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <span className="text-accent mt-1 text-xl">•</span>
                        <span className="flex-1">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diagram */}
                <div>
                  <h4 className="text-lg font-heading font-semibold mb-4 text-foreground">
                    {t.carousel.processFlow}
                  </h4>
                  <div className="p-6 rounded-lg bg-background border border-border">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {(language === 'es' ? selectedStep.diagram.blocks : selectedStep.diagram.blocksEn).map((block, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium whitespace-nowrap">
                            {block}
                          </div>
                          {i < (language === 'es' ? selectedStep.diagram.blocks : selectedStep.diagram.blocksEn).length - 1 && (
                            <span className="text-primary text-xl">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full" size="lg">
                  {language === 'es' ? selectedStep.cta : selectedStep.ctaEn}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
