import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  IdCard, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Upload, 
  X, 
  Plus,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { uploadFile } from '@/lib/file-upload-service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  cityZone: string;
  mainCategory: string;
  secondaryCategories: string[];
  yearsOfExperience: number;
  idType: string;
  idConfirmed: boolean;
  availability: {
    days: string[];
    times: string[];
  };
  worksByZone: boolean;
  basePriceEstimate: number;
  preferredContactMethod: string;
}

interface Certificate {
  file: File | null;
  institution: string;
  courseName: string;
  year: string;
}

interface PortfolioLink {
  url: string;
  description: string;
}

interface SkillTest {
  _id: string;
  category: string;
  questions: string;
  passingScore: number;
}

interface TestAnswer {
  questionIndex: number;
  selectedOption: number;
}

const CATEGORIES = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Pintura',
  'Limpieza',
  'Jardinería',
  'Construcción',
  'Reparaciones Generales',
  'Aire Acondicionado',
  'Mudanzas'
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIMES = ['Mañana (6am-12pm)', 'Tarde (12pm-6pm)', 'Noche (6pm-12am)'];
const CONTACT_METHODS = ['WhatsApp', 'Llamada', 'Chat'];

export default function JoseadorVerificationPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: member?.loginEmail || '',
    phoneNumber: '',
    cityZone: '',
    mainCategory: '',
    secondaryCategories: [],
    yearsOfExperience: 0,
    idType: '',
    idConfirmed: false,
    availability: {
      days: [],
      times: []
    },
    worksByZone: true,
    basePriceEstimate: 0,
    preferredContactMethod: 'WhatsApp'
  });

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<File[]>([]);
  const [portfolioVideos, setPortfolioVideos] = useState<File[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([{ url: '', description: '' }]);
  
  const [skillTest, setSkillTest] = useState<SkillTest | null>(null);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [testScore, setTestScore] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Calculate progress
  useEffect(() => {
    let completed = 0;
    const total = 12;

    if (formData.fullName) completed++;
    if (formData.email) completed++;
    if (formData.phoneNumber) completed++;
    if (formData.cityZone) completed++;
    if (formData.mainCategory) completed++;
    if (formData.yearsOfExperience > 0) completed++;
    if (idFrontFile) completed++;
    if (idBackFile) completed++;
    if (formData.idConfirmed) completed++;
    if (certificates.length > 0 || portfolioPhotos.length > 0 || portfolioVideos.length > 0) completed++;
    if (formData.availability.days.length > 0) completed++;
    if (testScore !== null && testScore >= 70) completed++;

    setProgress(Math.round((completed / total) * 100));
  }, [formData, idFrontFile, idBackFile, certificates, portfolioPhotos, portfolioVideos, testScore]);

  // Load skill test when category is selected
  useEffect(() => {
    if (formData.mainCategory) {
      loadSkillTest(formData.mainCategory);
    }
  }, [formData.mainCategory]);

  const loadSkillTest = async (category: string) => {
    try {
      const result = await BaseCrudService.getAll<SkillTest>('skilltests');
      const test = result.items.find(t => t.category === category);
      if (test) {
        setSkillTest(test);
        setTestAnswers([]);
        setTestScore(null);
      }
    } catch (error) {
      console.error('Error loading skill test:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecondaryCategory = (category: string) => {
    setFormData(prev => {
      const categories = prev.secondaryCategories.includes(category)
        ? prev.secondaryCategories.filter(c => c !== category)
        : [...prev.secondaryCategories, category];
      return { ...prev, secondaryCategories: categories };
    });
  };

  const handleAvailabilityDay = (day: string) => {
    setFormData(prev => {
      const days = prev.availability.days.includes(day)
        ? prev.availability.days.filter(d => d !== day)
        : [...prev.availability.days, day];
      return { ...prev, availability: { ...prev.availability, days } };
    });
  };

  const handleAvailabilityTime = (time: string) => {
    setFormData(prev => {
      const times = prev.availability.times.includes(time)
        ? prev.availability.times.filter(t => t !== time)
        : [...prev.availability.times, time];
      return { ...prev, availability: { ...prev.availability, times } };
    });
  };

  const addCertificate = () => {
    setCertificates(prev => [...prev, { file: null, institution: '', courseName: '', year: '' }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: any) => {
    setCertificates(prev => prev.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    ));
  };

  const addPortfolioLink = () => {
    setPortfolioLinks(prev => [...prev, { url: '', description: '' }]);
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updatePortfolioLink = (index: number, field: keyof PortfolioLink, value: string) => {
    setPortfolioLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const handleTestAnswer = (questionIndex: number, optionIndex: number) => {
    setTestAnswers(prev => {
      const existing = prev.find(a => a.questionIndex === questionIndex);
      if (existing) {
        return prev.map(a => 
          a.questionIndex === questionIndex ? { ...a, selectedOption: optionIndex } : a
        );
      }
      return [...prev, { questionIndex, selectedOption: optionIndex }];
    });
  };

  const calculateTestScore = () => {
    if (!skillTest) return;

    const questions = JSON.parse(skillTest.questions);
    let correct = 0;

    testAnswers.forEach(answer => {
      const question = questions[answer.questionIndex];
      if (question && question.correctIndex === answer.selectedOption) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setTestScore(score);
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.fullName) validationErrors.push('Nombre completo es requerido');
    if (!formData.email) validationErrors.push('Email es requerido');
    if (!formData.phoneNumber) validationErrors.push('Teléfono es requerido');
    if (!formData.mainCategory) validationErrors.push('Categoría principal es requerida');
    if (!idFrontFile) validationErrors.push('Foto frontal del documento es requerida');
    if (!idBackFile) validationErrors.push('Foto trasera del documento es requerida');
    if (!formData.idType) validationErrors.push('Tipo de documento es requerido');
    if (!formData.idConfirmed) validationErrors.push('Debes confirmar que los datos son reales');
    
    const hasEvidence = certificates.some(c => c.file) || portfolioPhotos.length > 0 || portfolioVideos.length > 0;
    if (!hasEvidence) validationErrors.push('Debes subir al menos un certificado o evidencia de portafolio');

    return validationErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Upload ID documents
      const idFrontUrl = idFrontFile ? await uploadFile(idFrontFile) : '';
      const idBackUrl = idBackFile ? await uploadFile(idBackFile) : '';

      // Create Joseador profile
      const joseadorId = crypto.randomUUID();
      await BaseCrudService.create('joseadores', {
        _id: joseadorId,
        userId: member?._id || '',
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        cityZone: formData.cityZone,
        mainCategory: formData.mainCategory,
        secondaryCategories: JSON.stringify(formData.secondaryCategories),
        yearsOfExperience: formData.yearsOfExperience,
        verificationStatus: 'Pendiente',
        badges: JSON.stringify([]),
        testScore: testScore || 0,
        testApproved: testScore !== null && testScore >= 70,
        availability: JSON.stringify(formData.availability),
        worksByZone: formData.worksByZone,
        basePriceEstimate: formData.basePriceEstimate,
        preferredContactMethod: formData.preferredContactMethod
      });

      // Upload ID documents
      if (idFrontUrl) {
        await BaseCrudService.create('joseadordocs', {
          _id: crypto.randomUUID(),
          joseadorId,
          documentType: 'ID_FRONT',
          fileUrl: idFrontUrl,
          metadata: JSON.stringify({ idType: formData.idType }),
          verificationStatus: 'Pendiente',
          fileName: idFrontFile?.name || ''
        });
      }

      if (idBackUrl) {
        await BaseCrudService.create('joseadordocs', {
          _id: crypto.randomUUID(),
          joseadorId,
          documentType: 'ID_BACK',
          fileUrl: idBackUrl,
          metadata: JSON.stringify({ idType: formData.idType }),
          verificationStatus: 'Pendiente',
          fileName: idBackFile?.name || ''
        });
      }

      // Upload certificates
      for (const cert of certificates) {
        if (cert.file) {
          const certUrl = await uploadFile(cert.file);
          await BaseCrudService.create('joseadordocs', {
            _id: crypto.randomUUID(),
            joseadorId,
            documentType: 'CERT',
            fileUrl: certUrl,
            metadata: JSON.stringify({
              institution: cert.institution,
              courseName: cert.courseName,
              year: cert.year
            }),
            verificationStatus: 'Pendiente',
            fileName: cert.file.name
          });
        }
      }

      // Upload portfolio photos
      for (const photo of portfolioPhotos) {
        const photoUrl = await uploadFile(photo);
        await BaseCrudService.create('joseadordocs', {
          _id: crypto.randomUUID(),
          joseadorId,
          documentType: 'PORTFOLIO_PHOTO',
          fileUrl: photoUrl,
          metadata: JSON.stringify({}),
          verificationStatus: 'Pendiente',
          fileName: photo.name
        });
      }

      // Upload portfolio videos
      for (const video of portfolioVideos) {
        const videoUrl = await uploadFile(video);
        await BaseCrudService.create('joseadordocs', {
          _id: crypto.randomUUID(),
          joseadorId,
          documentType: 'PORTFOLIO_VIDEO',
          fileUrl: videoUrl,
          metadata: JSON.stringify({}),
          verificationStatus: 'Pendiente',
          fileName: video.name
        });
      }

      // Save portfolio links
      const validLinks = portfolioLinks.filter(link => link.url);
      if (validLinks.length > 0) {
        await BaseCrudService.create('joseadordocs', {
          _id: crypto.randomUUID(),
          joseadorId,
          documentType: 'PORTFOLIO_LINK',
          fileUrl: '',
          metadata: JSON.stringify({ links: validLinks }),
          verificationStatus: 'Pendiente',
          fileName: 'portfolio_links'
        });
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting verification:', error);
      setErrors(['Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccessModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">¡Solicitud Recibida!</CardTitle>
            <CardDescription>
              Tu perfil está en revisión. Te notificaremos cuando sea aprobado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                El proceso de verificación toma entre 24-48 horas. Recibirás un email cuando esté listo.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/joseador/dashboard')} className="w-full">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 py-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Verificación Joseador
            </h1>
            <p className="text-muted-text">
              Sube tus documentos y demuestra tus skills para ganar confianza y más trabajos.
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-text">Progreso de completado</span>
                <span className="font-semibold text-accent">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[100rem] mx-auto px-4 py-8">
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Data Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <CardTitle>Datos Básicos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Teléfono *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="809-555-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityZone">Ciudad / Zona</Label>
                  <Input
                    id="cityZone"
                    value={formData.cityZone}
                    onChange={(e) => handleInputChange('cityZone', e.target.value)}
                    placeholder="Santo Domingo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainCategory">Categoría Principal *</Label>
                <Select
                  value={formData.mainCategory}
                  onValueChange={(value) => handleInputChange('mainCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categorías Secundarias</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c !== formData.mainCategory).map(cat => (
                    <Badge
                      key={cat}
                      variant={formData.secondaryCategories.includes(cat) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSecondaryCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Años de Experiencia</Label>
                <Select
                  value={formData.yearsOfExperience.toString()}
                  onValueChange={(value) => handleInputChange('yearsOfExperience', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Menos de 1 año</SelectItem>
                    <SelectItem value="1">1-2 años</SelectItem>
                    <SelectItem value="3">3-5 años</SelectItem>
                    <SelectItem value="6">6-10 años</SelectItem>
                    <SelectItem value="11">Más de 10 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Identity Verification Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-accent" />
                <CardTitle>Verificación de Identidad</CardTitle>
              </div>
              <CardDescription>
                Solo el equipo de JOSEAME verá esto. No se muestra público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idType">Tipo de Documento *</Label>
                <Select
                  value={formData.idType}
                  onValueChange={(value) => handleInputChange('idType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula">Cédula</SelectItem>
                    <SelectItem value="licencia">Licencia de Conducir</SelectItem>
                    <SelectItem value="carnet">Carnet Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idFront">Documento Frontal *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Input
                      id="idFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="idFront" className="cursor-pointer">
                      {idFrontFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span className="text-sm">{idFrontFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-text" />
                          <p className="text-sm text-muted-text">Subir foto frontal</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idBack">Documento Trasero *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Input
                      id="idBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="idBack" className="cursor-pointer">
                      {idBackFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span className="text-sm">{idBackFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-text" />
                          <p className="text-sm text-muted-text">Subir foto trasera</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="idConfirmed"
                  checked={formData.idConfirmed}
                  onCheckedChange={(checked) => handleInputChange('idConfirmed', checked)}
                />
                <Label htmlFor="idConfirmed" className="cursor-pointer">
                  Confirmo que los datos son reales *
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <CardTitle>Certificados / Diplomas</CardTitle>
              </div>
              <CardDescription>
                Sube tus certificados para validar tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Certificado {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertificate(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Archivo</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => updateCertificate(index, 'file', e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Institución</Label>
                      <Input
                        value={cert.institution}
                        onChange={(e) => updateCertificate(index, 'institution', e.target.value)}
                        placeholder="Ej: INFOTEP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre del Curso</Label>
                      <Input
                        value={cert.courseName}
                        onChange={(e) => updateCertificate(index, 'courseName', e.target.value)}
                        placeholder="Ej: Electricidad Básica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Año</Label>
                      <Input
                        value={cert.year}
                        onChange={(e) => updateCertificate(index, 'year', e.target.value)}
                        placeholder="2023"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addCertificate} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Certificado
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                <CardTitle>Portafolio</CardTitle>
              </div>
              <CardDescription>
                Muestra tu trabajo anterior con fotos, videos o links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fotos de Trabajos</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPortfolioPhotos(Array.from(e.target.files || []))}
                />
                {portfolioPhotos.length > 0 && (
                  <p className="text-sm text-muted-text">{portfolioPhotos.length} foto(s) seleccionada(s)</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Videos de Trabajos</Label>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => setPortfolioVideos(Array.from(e.target.files || []))}
                />
                {portfolioVideos.length > 0 && (
                  <p className="text-sm text-muted-text">{portfolioVideos.length} video(s) seleccionado(s)</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Links de Trabajos Previos</Label>
                {portfolioLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://ejemplo.com"
                      value={link.url}
                      onChange={(e) => updatePortfolioLink(index, 'url', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Descripción"
                      value={link.description}
                      onChange={(e) => updatePortfolioLink(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    {portfolioLinks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePortfolioLink(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button onClick={addPortfolioLink} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skill Test Section */}
          {formData.mainCategory && skillTest && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <CardTitle>Mini Test de {formData.mainCategory}</CardTitle>
                </div>
                <CardDescription>
                  Responde estas preguntas para validar tus conocimientos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {JSON.parse(skillTest.questions).map((q: any, qIndex: number) => (
                  <div key={qIndex} className="space-y-3">
                    <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                    <RadioGroup
                      value={testAnswers.find(a => a.questionIndex === qIndex)?.selectedOption.toString()}
                      onValueChange={(value) => handleTestAnswer(qIndex, parseInt(value))}
                    >
                      {q.options.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                          <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="flex items-center gap-4">
                  <Button onClick={calculateTestScore} variant="outline">
                    Calcular Puntaje
                  </Button>
                  {testScore !== null && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Puntaje: {testScore}%</span>
                      {testScore >= 70 ? (
                        <Badge className="bg-accent">Aprobado ✓</Badge>
                      ) : (
                        <Badge variant="destructive">No Aprobado</Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <CardTitle>Preferencias y Disponibilidad</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Días Disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <Badge
                      key={day}
                      variant={formData.availability.days.includes(day) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAvailabilityDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Horarios Disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map(time => (
                    <Badge
                      key={time}
                      variant={formData.availability.times.includes(time) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAvailabilityTime(time)}
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="worksByZone"
                  checked={formData.worksByZone}
                  onCheckedChange={(checked) => handleInputChange('worksByZone', checked)}
                />
                <Label htmlFor="worksByZone" className="cursor-pointer">
                  ¿Trabajas por zona o vas a domicilio?
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePriceEstimate">Precio Base Estimado (opcional)</Label>
                <Input
                  id="basePriceEstimate"
                  type="number"
                  value={formData.basePriceEstimate || ''}
                  onChange={(e) => handleInputChange('basePriceEstimate', parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label>Medio de Contacto Preferido</Label>
                <div className="flex gap-2">
                  {CONTACT_METHODS.map(method => (
                    <Badge
                      key={method}
                      variant={formData.preferredContactMethod === method ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleInputChange('preferredContactMethod', method)}
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Enviando...</span>
                  </>
                ) : (
                  'Enviar para Verificación'
                )}
              </Button>
              <p className="text-center text-sm text-muted-text mt-4">
                Al enviar, aceptas que tu información será revisada por el equipo de JOSEAME
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
