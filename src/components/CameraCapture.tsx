import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Copy, CheckSquare } from 'lucide-react';

interface CameraCaptureProps {
  onPhotoCaptured: (base64Data: string) => void;
  boxSize: 'pequeña' | 'mediana' | 'grande';
}

// Catálogo de imágenes de caja según el tamaño para fallback premium
const BOX_FALLBACKS = {
  pequeña: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop",
  mediana: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400&auto=format&fit=crop",
  grande: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop",
};

export default function CameraCapture({ onPhotoCaptured, boxSize }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Intentar inicializar la cámara al cargar
  const startCamera = async () => {
    setErrorMsg(null);
    setPhoto(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
      setIsStreaming(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setHasCamera(false);
      setIsStreaming(false);
      setErrorMsg("No se pudo iniciar la cámara. Usando representaciones ilustrativas integradas.");
      // Fallback automático inmediato con imagen de catálogo
      const fallbackUrl = BOX_FALLBACKS[boxSize];
      onPhotoCaptured(fallbackUrl);
    }
  };

  // Detener cámara al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        onPhotoCaptured(dataUrl);
        setIsStreaming(false);
        // Apagar stream temporalmente
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      }
    } catch (err) {
      console.error("Snapshot capture error:", err);
    }
  };

  const resetCamera = () => {
    setPhoto(null);
    startCamera();
  };

  // Cargar imagen de catálogo si elige no usar cámara
  const selectCatalogImage = () => {
    const fallbackUrl = BOX_FALLBACKS[boxSize];
    setPhoto(fallbackUrl);
    onPhotoCaptured(fallbackUrl);
    setIsStreaming(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Camera size={14} className="text-[#FF6B00]" />
          Fotografía de Verificación
        </span>
        <div className="flex gap-2">
          {!photo && (
            <button
              type="button"
              onClick={selectCatalogImage}
              className="text-[11px] px-2.5 py-1 rounded bg-[#002C54]/5 text-[#002C54] hover:bg-[#002C54]/10 transition font-medium"
            >
              Usar Ilustrativa
            </button>
          )}
          {photo && (
            <button
              type="button"
              onClick={resetCamera}
              className="text-[11px] px-2.5 py-1 rounded bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 transition flex items-center gap-1 font-medium"
            >
              <RefreshCw size={10} /> Recapturar
            </button>
          )}
        </div>
      </div>

      <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-200">
        {photo ? (
          <img
            src={photo}
            alt="Código de recolección de caja"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : isStreaming ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform scale-x-[-1]"
              playsInline
              muted
            />
            <div className="absolute inset-0 border-2 border-dashed border-[#FF6B00]/60 m-12 pointer-events-none rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Enmarcar caja aquí</span>
            </div>
            <button
              type="button"
              onClick={captureSnapshot}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-700/50 hover:scale-105 active:scale-95 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF6B00]" />
            </button>
          </div>
        ) : (
          <div className="p-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] mb-3">
              <Camera size={22} />
            </div>
            {errorMsg ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium px-4">{errorMsg}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 uppercase tracking-wide">
                  <CheckSquare size={12} className="text-emerald-500" /> Ilustración Cargada
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Captura la condición física de la caja antes de registrarla en la ruta.</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#002C54] text-white font-bold text-xs rounded-xl shadow hover:bg-[#00284d] active:scale-95 transition-all"
                >
                  Activar Cámara
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
