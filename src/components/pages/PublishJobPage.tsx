import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { TrabajosdeServicio } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Briefcase, FileText, CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';
import { useJobStore } from '@/store/jobStore';

const PUBLICATION_FEE = 250; // RD$ fixed fee for publishing a job

const DURATION_OPTIONS = [
  { months: 1, label: '1 mes' },
  { months: 3, label: '3 meses' },
  { months: 5, label: '5 meses' },
  { months: 10, label: '10 meses' },
];

export default function PublishJobPage() {
  const navigate = useNavigate();
  const { jobToDuplicate, clearJobToDuplicate } = useJobStore();
  const [formData, setFormData] = useState({
    jobTitle: '',
    description: '',
    serviceCategory: '',
    budget: '',
    locationAddress: '',
    jobImage: ''
  });
  const [durationMonths, setDurationMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (jobToDuplicate) {
      setFormData({
        jobTitle: jobToDuplicate.jobTitle || '',
        description: jobToDuplicate.description || '',
        serviceCategory: jobToDuplicate.serviceCategory || '',
        budget: jobToDuplicate.budget?.toString() || '',
        locationAddress: jobToDuplicate.locationAddress || '',
        jobImage: jobToDuplicate.jobImage || ''
      });
    }
  }, [jobToDuplicate]);

  const categories = ['Plomería', 'Electricidad', 'Limpieza', 'Construcción', 'Jardinería', 'Tecnología', 'Otro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newJob: TrabajosdeServicio = {
        _id: crypto.randomUUID(),
        jobTitle: formData.jobTitle,
        description: formData.description,
        serviceCategory: formData.serviceCategory,
        budget: parseFloat(formData.budget),
        locationAddress: formData.locationAddress,
        status: 'open',
        postedDate: new Date().toISOString(),
        jobImage: formData.jobImage || undefined
      };

      await BaseCrudService.create('servicejobs', newJob);
      clearJobToDuplicate();
      navigate('/client/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="font-heading text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
                {jobToDuplicate ? 'Solicitar Trabajo de Nuevo' : 'Publica tu Trabajo'}
              </h1>
              <p className="font-paragraph text-lg text-muted-text">
                {jobToDuplicate ? 'Estás creando una nueva solicitud basada en un trabajo anterior' : 'Conecta con profesionales calificados en minutos'}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors">
                <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                    <Briefcase size={20} className="text-primary" />
                  </div>
                  Título del Trabajo
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="Ej: Reparación de tubería en cocina"
                  className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </motion.div>

              {/* Category */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-secondary/30 transition-colors">
                <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                  <div className="p-2 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg">
                    <FileText size={20} className="text-secondary" />
                  </div>
                  Categoría del Servicio
                </label>
                <select
                  required
                  value={formData.serviceCategory}
                  onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors">
                <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                  <div className="p-2 bg-gradient-to-br from-accent/10 to-support/10 rounded-lg">
                    <FileText size={20} className="text-accent" />
                  </div>
                  Descripción Detallada
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el trabajo que necesitas realizar, incluye detalles importantes..."
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none transition-all"
                />
                <p className="font-paragraph text-sm text-muted-text mt-3">
                  💡 Sé específico para atraer a los mejores profesionales
                </p>
              </motion.div>

              {/* Budget & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors">
                  <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                      <DollarSign size={20} className="text-primary" />
                    </div>
                    Presupuesto (RD$)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="5000"
                    className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="font-paragraph text-sm text-muted-text mt-3">
                    Presupuesto estimado
                  </p>
                </motion.div>

                {/* Location */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-secondary/30 transition-colors">
                  <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                    <div className="p-2 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg">
                      <MapPin size={20} className="text-secondary" />
                    </div>
                    Ubicación
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locationAddress}
                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                    placeholder="Ej: Santo Domingo, DN"
                    className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  />
                </motion.div>
              </div>

              {/* Image URL (Optional) */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors">
                <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-3">
                  <div className="p-2 bg-gradient-to-br from-accent/10 to-support/10 rounded-lg">
                    <Building2 size={20} className="text-accent" />
                  </div>
                  Imagen del Trabajo (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.jobImage}
                  onChange={(e) => setFormData({ ...formData, jobImage: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </motion.div>

              {/* Duration Selection */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors">
                <label className="flex items-center gap-3 font-heading font-semibold text-foreground mb-4">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                    <Briefcase size={20} className="text-primary" />
                  </div>
                  Duración de la Publicación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <motion.button
                      key={option.months}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDurationMonths(option.months)}
                      type="button"
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        durationMonths === option.months
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <p className="font-heading font-semibold text-foreground">{option.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : (jobToDuplicate ? 'Crear Nueva Solicitud' : 'Publicar Trabajo')}
                </motion.button>
              </motion.div>
            </form>
          </div>

          {/* Right Column - Payment Widget */}
          <div className="lg:col-span-1">
            <motion.div
              variants={itemVariants}
              className="sticky top-24 bg-white rounded-2xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white">
                <h3 className="font-heading text-2xl font-bold mb-2">Resumen de Publicación</h3>
                <p className="font-paragraph text-sm opacity-90">Completa tu pago para publicar</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Fee Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="font-paragraph text-muted-text">Duración seleccionada</span>
                    <span className="font-heading font-semibold text-foreground">
                      {DURATION_OPTIONS.find(opt => opt.months === durationMonths)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="font-paragraph text-muted-text">Tarifa de publicación</span>
                    <span className="font-heading font-semibold text-foreground">RD$ {PUBLICATION_FEE}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="font-paragraph text-muted-text">Visibilidad</span>
                    <span className="font-heading font-semibold text-foreground">Ilimitada</span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg font-semibold text-foreground">Total a pagar</span>
                    <span className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      RD$ {PUBLICATION_FEE}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="font-heading font-semibold text-foreground text-sm">Método de pago</p>
                  
                  {/* Card Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('card')}
                    type="button"
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <CreditCard size={20} className={paymentMethod === 'card' ? 'text-primary' : 'text-muted-text'} />
                    <div className="text-left">
                      <p className="font-heading font-semibold text-sm text-foreground">Tarjeta de Crédito</p>
                      <p className="font-paragraph text-xs text-muted-text">Visa, Mastercard</p>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle2 size={20} className="text-primary ml-auto" />}
                  </motion.button>

                  {/* Mobile Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('mobile')}
                    type="button"
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'mobile'
                        ? 'border-secondary bg-secondary/5'
                        : 'border-border hover:border-secondary/30'
                    }`}
                  >
                    <Smartphone size={20} className={paymentMethod === 'mobile' ? 'text-secondary' : 'text-muted-text'} />
                    <div className="text-left">
                      <p className="font-heading font-semibold text-sm text-foreground">Billetera Digital</p>
                      <p className="font-paragraph text-xs text-muted-text">Pago Móvil, AirTM</p>
                    </div>
                    {paymentMethod === 'mobile' && <CheckCircle2 size={20} className="text-secondary ml-auto" />}
                  </motion.button>
                </div>

                {/* Benefits */}
                <div className="bg-accent/5 rounded-xl p-4 space-y-2">
                  <p className="font-heading font-semibold text-sm text-foreground mb-3">Lo que incluye:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="font-paragraph text-sm text-foreground">Visibilidad en la plataforma</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="font-paragraph text-sm text-foreground">Recibe aplicaciones de Joseadores</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="font-paragraph text-sm text-foreground">Soporte prioritario</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <p className="font-paragraph text-xs text-muted-text text-center">
                  Tu trabajo será visible inmediatamente después del pago
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
