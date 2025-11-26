import { useEffect, useRef, useState } from 'react';
import { TrabajosdeServicio } from '@/entities';
import { MapPin, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobsMapProps {
  jobs: TrabajosdeServicio[];
  onJobSelect: (jobId: string) => void;
  selectedJobId?: string;
}

export default function JobsMap({ jobs, onJobSelect, selectedJobId }: JobsMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

    // Draw jobs
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
    });

    ctx.restore();

    // Draw border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [zoom, pan, jobsWithCoords, selectedJobId, hoveredJobId]);

  // Handle mouse move for hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
  };

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
        width={800}
        height={500}
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
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-border shadow-sm p-4">
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
            <span className="font-paragraph text-xs text-muted-text">Trabajo destacado</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {hoveredJobId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white rounded-lg border border-border shadow-lg p-4 max-w-xs"
        >
          {jobsWithCoords.find(j => j._id === hoveredJobId) && (
            <>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-1">
                {jobsWithCoords.find(j => j._id === hoveredJobId)?.jobTitle}
              </h4>
              <p className="font-paragraph text-xs text-muted-text mb-2">
                {jobsWithCoords.find(j => j._id === hoveredJobId)?.description?.substring(0, 50)}...
              </p>
              <div className="flex items-center gap-1 text-xs text-secondary font-paragraph mb-2">
                <MapPin size={14} />
                {jobsWithCoords.find(j => j._id === hoveredJobId)?.locationAddress}
              </div>
              <p className="font-heading text-sm font-bold text-secondary">
                RD$ {jobsWithCoords.find(j => j._id === hoveredJobId)?.budget?.toLocaleString()}
              </p>
            </>
          )}
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
