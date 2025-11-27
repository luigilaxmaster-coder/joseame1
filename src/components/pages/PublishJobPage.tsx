import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { TrabajosdeServicio } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Briefcase, FileText } from 'lucide-react';
import { useJobStore } from '@/store/jobStore';

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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
              {jobToDuplicate ? 'Solicitar Trabajo de Nuevo' : 'Publicar Nuevo Trabajo'}
            </h1>
            <p className="font-paragraph text-lg text-muted-text">
              {jobToDuplicate ? 'Estás creando una nueva solicitud basada en un trabajo anterior' : 'Completa los detalles de tu trabajo para recibir aplicaciones de Joseadores'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-border shadow-lg space-y-6">
            {/* Job Title */}
            <div>
              <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                <Briefcase size={20} className="text-primary" />
                Título del Trabajo
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Ej: Reparación de tubería en cocina"
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                <FileText size={20} className="text-primary" />
                Categoría del Servicio
              </label>
              <select
                required
                value={formData.serviceCategory}
                onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                <FileText size={20} className="text-primary" />
                Descripción Detallada
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el trabajo que necesitas realizar, incluye detalles importantes..."
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="font-paragraph text-sm text-muted-text mt-2">
                Sé específico para atraer a los mejores profesionales
              </p>
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                <DollarSign size={20} className="text-primary" />
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
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="font-paragraph text-sm text-muted-text mt-2">
                Indica tu presupuesto estimado para este trabajo
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                <MapPin size={20} className="text-primary" />
                Ubicación
              </label>
              <input
                type="text"
                required
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                placeholder="Ej: Santo Domingo, Distrito Nacional"
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Image URL (Optional) */}
            <div>
              <label className="font-heading font-semibold text-foreground mb-3 block">
                Imagen del Trabajo (Opcional)
              </label>
              <input
                type="url"
                value={formData.jobImage}
                onChange={(e) => setFormData({ ...formData, jobImage: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {jobToDuplicate ? 'Crear Nueva Solicitud' : 'Publicar Trabajo'}
              </motion.button>
              <p className="font-paragraph text-sm text-muted-text text-center mt-4">
                Tu trabajo será visible para todos los Joseadores inmediatamente
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
