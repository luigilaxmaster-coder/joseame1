import { useEffect, useRef, useState, useCallback } from 'react';
import { TrabajosdeServicio } from '@/entities';
import { MapPin, X, ZoomIn, ZoomOut, Navigation, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface JobsMapProps {
  jobs: TrabajosdeServicio[];
  onJobSelect: (jobId: string) => void;
  selectedJobId?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MarkerPosition {
  jobId: string;
  x: number;
  y: number;
  radius: number;
}

export default function JobsMap({ jobs, onJobSelect, selectedJobId }: JobsMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([]);

  // Request user location
  const requestUserLocation = () => {
    setRequestingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalización no disponible en tu navegador');
      setRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setRequestingLocation(false);
      },
      (error) => {
        let errorMsg = 'No se pudo obtener tu ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Información de ubicación no disponible';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tiempo de espera agotado al obtener ubicación';
        }
        setLocationError(errorMsg);
        setRequestingLocation(false);
      }
    );
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter jobs with valid coordinates
  const jobsWithCoords = jobs.filter(job => 
    job.latitude !== undefined && 
    job.longitude !== undefined &&
    job.latitude !== null &&
    job.longitude !== null
  );

  // Calculate bounds for all jobs
  const calculateBounds = () => {
    if (jobsWithCoords.length === 0) {
      return { minLat: 18, maxLat: 20, minLon: -74, maxLon: -72 }; // Dominican Republic default
    }

    let minLat = jobsWithCoords[0].latitude!;
    let maxLat = jobsWithCoords[0].latitude!;
    let minLon = jobsWithCoords[0].longitude!;
    let maxLon = jobsWithCoords[0].longitude!;

    jobsWithCoords.forEach(job => {
      if (job.latitude! < minLat) minLat = job.latitude!;
      if (job.latitude! > maxLat) maxLat = job.latitude!;
      if (job.longitude! < minLon) minLon = job.longitude!;
      if (job.longitude! > maxLon) maxLon = job.longitude!;
    });

    // Add padding
    const latPadding = (maxLat - minLat) * 0.2;
    const lonPadding = (maxLon - minLon) * 0.2;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLon: minLon - lonPadding,
      maxLon: maxLon + lonPadding
    };
  };

  // Convert lat/lon to canvas coordinates
  const latLonToCanvas = (lat: number, lon: number, bounds: any, width: number, height: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bounds = calculateBounds();
    const newMarkerPositions: MarkerPosition[] = [];

    // Clear canvas
    ctx.fillStyle = '#F6F8FB';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Apply zoom and pan
    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Draw user location if available
    if (userLocation) {
      const { x: userX, y: userY } = latLonToCanvas(userLocation.latitude, userLocation.longitude, bounds, width, height);
      
      // Draw user location circle with glow
      ctx.fillStyle = 'rgba(14, 159, 168, 0.2)';
      ctx.beginPath();
      ctx.arc(userX, userY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Draw user marker
      ctx.fillStyle = '#0E9FA8';
      ctx.beginPath();
      ctx.arc(userX, userY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw user marker border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(userX, userY, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw inner circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(userX, userY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw jobs and track marker positions
    jobsWithCoords.forEach(job => {
      const { x, y } = latLonToCanvas(job.latitude!, job.longitude!, bounds, width, height);
      const isSelected = job._id === selectedJobId;
      const isHovered = job._id === hoveredJobId;

      // Draw marker circle
      const radius = isSelected ? 16 : isHovered ? 14 : 12;
      const color = isSelected ? '#0E9FA8' : isHovered ? '#3AB689' : '#71D261';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw inner circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Store marker position for click detection
      newMarkerPositions.push({
        jobId: job._id!,
        x,
        y,
        radius
      });
    });

    ctx.restore();

    // Draw border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Update marker positions
    setMarkerPositions(newMarkerPositions);
  }, [zoom, pan, jobsWithCoords, selectedJobId, hoveredJobId, userLocation]);

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const bounds = calculateBounds();

    let foundJob: string | null = null;

    jobsWithCoords.forEach(job => {
      const { x: jobX, y: jobY } = latLonToCanvas(job.latitude!, job.longitude!, bounds, width, height);
      
      // Apply zoom and pan transformations
      const transformedX = (jobX - width / 2) * zoom + width / 2 + pan.x;
      const transformedY = (jobY - height / 2) * zoom + height / 2 + pan.y;

      const distance = Math.sqrt((x - transformedX) ** 2 + (y - transformedY) ** 2);
      
      if (distance < 20) {
        foundJob = job._id!;
      }
    });

    setHoveredJobId(foundJob);
    canvas.style.cursor = foundJob ? 'pointer' : 'grab';
  }, [isDragging, jobsWithCoords, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredJobId) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove2 = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredJobId) {
      onJobSelect(hoveredJobId);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const newZoom = zoom - (e.deltaY > 0 ? 0.1 : -0.1);
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1200) : 800}
        height={600}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleMouseMove2(e);
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-auto block"
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestUserLocation}
          disabled={requestingLocation}
          className="p-2 bg-white border border-border rounded-lg hover:bg-background transition-colors shadow-sm disabled:opacity-50"
          title="Obtener mi ubicación"
        >
          <Navigation size={20} className="text-primary" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-2 bg-white border border-border rounded-lg hover:bg-background transition-colors shadow-sm"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-secondary" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-2 bg-white border border-border rounded-lg hover:bg-background transition-colors shadow-sm"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-secondary" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="p-2 bg-white border border-border rounded-lg hover:bg-background transition-colors shadow-sm"
          title="Reset view"
        >
          <X size={20} className="text-muted-text" />
        </motion.button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-border shadow-sm p-4 max-w-xs">
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Leyenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="font-paragraph text-xs text-muted-text">Trabajos disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="font-paragraph text-xs text-muted-text">Trabajo seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="font-paragraph text-xs text-muted-text">Tu ubicación</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="font-paragraph text-xs text-muted-text">
            💡 Pasa el mouse sobre los marcadores para ver detalles
          </p>
        </div>
      </div>

      {/* Error Message */}
      {locationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm"
        >
          <p className="font-paragraph text-xs text-red-700">{locationError}</p>
        </motion.div>
      )}

      {/* Info Panel - Enhanced with Job Details */}
      {hoveredJobId && jobsWithCoords.find(j => j._id === hoveredJobId) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white rounded-lg border border-border shadow-lg p-4 max-w-sm"
        >
          {(() => {
            const job = jobsWithCoords.find(j => j._id === hoveredJobId);
            const distance = userLocation && job?.latitude && job?.longitude
              ? calculateDistance(userLocation.latitude, userLocation.longitude, job.latitude, job.longitude)
              : null;

            return (
              <>
                {job?.jobImage && (
                  <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-background">
                    <Image src={job.jobImage} alt={job.jobTitle} className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-heading text-sm font-semibold text-foreground mb-1">
                  {job?.jobTitle}
                </h4>
                <p className="font-paragraph text-xs text-muted-text mb-2">
                  {job?.description?.substring(0, 80)}...
                </p>
                <div className="flex items-center gap-1 text-xs text-secondary font-paragraph mb-2">
                  <MapPin size={14} />
                  {job?.locationAddress}
                </div>
                {distance && (
                  <p className="font-paragraph text-xs text-accent font-semibold mb-2">
                    📍 {distance.toFixed(1)} km de distancia
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="font-heading text-sm font-bold text-secondary">
                    RD$ {job?.budget?.toLocaleString()}
                  </p>
                  <button
                    onClick={() => hoveredJobId && onJobSelect(hoveredJobId)}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-secondary to-accent text-white rounded-lg text-xs font-semibold hover:shadow-md transition-shadow"
                  >
                    Ver
                    <ChevronRight size={14} />
                  </button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Empty State */}
      {jobsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <MapPin size={48} className="text-muted-text mx-auto mb-3 opacity-50" />
            <p className="font-paragraph text-muted-text">No hay trabajos con ubicación disponibles</p>
          </div>
        </div>
      )}
    </div>
  );
}
