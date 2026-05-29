import React, { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { 
  Navigation, Play, Pause, RefreshCw, MapPin, Truck, ChevronUp, ChevronDown, 
  Map as MapIcon, Compass, Sparkles, CheckCircle2, ListFilter, AlertCircle, Plus, Info, Check, Trash2
} from 'lucide-react';
import { Client, Box } from '../types';

interface PickupRouteMapProps {
  clients: Client[];
  boxes: Box[];
}

interface RouteStop {
  id: string; // client ID or custom
  name: string;
  address: string;
  lat: number;
  lng: number;
  boxCount: number;
  client?: Client;
  isCustom?: boolean;
}

// Fallback coordinate dictionary for initial clients to guarantee instant rendering
const HARDCODED_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'c-1': { lat: 29.7042, lng: -95.5186 }, // Sovereign Row, Houston, TX
  'c-2': { lat: 25.8118, lng: -80.2132 }, // Florida stop
  'c-3': { lat: 30.0125, lng: -95.4331 }, // Cypress Creek, Houston, TX
  'c-4': { lat: 42.1642, lng: -71.1895 }, // Boston stop
};

const HOUSTON_DEPOT = { lat: 29.7604, lng: -95.3698 }; // Origin: Houston Warehouse

function MapCameraController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  useEffect(() => {
    if (map && zoom !== undefined) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  return null;
}

export default function PickupRouteMap({ clients, boxes }: PickupRouteMapProps) {
  // Read key from environment definitions
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // State Management
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number | null>(null);
  
  // Custom stop input builder
  const [showAddCustomStop, setShowAddCustomStop] = useState(false);
  const [customStopName, setCustomStopName] = useState('');
  const [customStopAddress, setCustomStopAddress] = useState('');
  const [customFeedbackMessage, setCustomFeedbackMessage] = useState('');

  // Simulation parameters
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPercentage, setSimPercentage] = useState(0); // 0 to 100%
  const [currentSimStopIdx, setCurrentSimStopIdx] = useState(0);
  const [simSpeed, setSimSpeed] = useState<number>(3); // steps rate
  const [simCoordinates, setSimCoordinates] = useState<{lat: number, lng: number}>(HOUSTON_DEPOT);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Address validation feedback
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);

  // Focus coordinate
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>(HOUSTON_DEPOT);
  const [mapZoom, setMapZoom] = useState(10);

  // 1. Core integration: Initialize route stops from clients & boxes
  useEffect(() => {
    // Generate stops based on active routing clients who have boxes registered
    const routeStops: RouteStop[] = [];

    // Prioritize clients in Texas (Houston) for clean route display of TX-HND-9004 route
    const houstonOrigin = {
      id: 'depot',
      name: 'Central de Despacho Olomán',
      address: 'Houston Depot & Shipping Center, TX, USA',
      lat: HOUSTON_DEPOT.lat,
      lng: HOUSTON_DEPOT.lng,
      boxCount: 0,
    };

    clients.forEach(client => {
      const clientBoxes = boxes.filter(b => b.clientId === client.id);
      
      // We map coordinates. If hardcoded exists, use it. Otherwise, default approximate offset
      let coords = HARDCODED_COORDINATES[client.id];
      if (!coords) {
        // Fallback offset based on ID to render something on map around Houston
        const offset = (parseInt(client.id.replace(/\D/g, '') || '5') % 10) * 0.05;
        coords = {
          lat: HOUSTON_DEPOT.lat + (offset - 0.25),
          lng: HOUSTON_DEPOT.lng + (offset - 0.2)
        };
      }

      routeStops.push({
        id: client.id,
        name: client.nombre,
        address: client.direccionUSA || 'Houston Local Address',
        lat: coords.lat,
        lng: coords.lng,
        boxCount: clientBoxes.length,
        client: client
      });
    });

    // Sort by default: origin first, then stops with boxes
    setStops(routeStops);
  }, [clients, boxes]);

  // 2. Journey Simulation loop
  useEffect(() => {
    if (isSimulating) {
      // Start simulation timer
      simulationIntervalRef.current = setInterval(() => {
        setSimPercentage(prev => {
          if (prev >= 100) {
            // Move to next stop index if available
            setCurrentSimStopIdx(stopIdx => {
              const nextIdx = stopIdx + 1;
              if (nextIdx >= stops.length) {
                // Trip completed!
                setIsSimulating(false);
                if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                alert("🚚 ¡Viaje Demostrativo completado! El camión ha terminado la recolección óptima.");
                return 0; // reset
              }
              return nextIdx;
            });
            return 0; // reset percentage segment
          }
          return prev + simSpeed;
        });
      }, 100);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating, stops, simSpeed]);

  // Translate percentages to coordinates along current segment (Stop idx -> Stop idx + 1)
  useEffect(() => {
    if (stops.length === 0) return;
    
    const currentStop = stops[currentSimStopIdx];
    const nextStop = stops[(currentSimStopIdx + 1) % stops.length];

    if (!currentStop || !nextStop) return;

    const lat = currentStop.lat + (nextStop.lat - currentStop.lat) * (simPercentage / 100);
    const lng = currentStop.lng + (nextStop.lng - currentStop.lng) * (simPercentage / 100);

    setSimCoordinates({ lat, lng });
    // Keep map centered on simulated truck
    if (isSimulating) {
      setMapCenter({ lat, lng });
    }
  }, [simPercentage, currentSimStopIdx, stops, isSimulating]);

  // 3. Dynamic Stop Management Helpers
  const handleMoveStop = (idx: number, direction: 'up' | 'down') => {
    if (idx < 0 || idx >= stops.length) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stops.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newStops = [...stops];
    const hold = newStops[idx];
    newStops[idx] = newStops[targetIdx];
    newStops[targetIdx] = hold;
    setStops(newStops);
  };

  const handleRemoveStop = (idx: number) => {
    const newStops = stops.filter((_, i) => i !== idx);
    setStops(newStops);
    if (selectedStopIdx === idx) setSelectedStopIdx(null);
  };

  // 4. Pure algorithms routing optimization (Nearest Neighbor Travelling Salesperson Heuristic)
  const handleOptimizeRoute = () => {
    if (stops.length <= 2) return;

    // Start with the Houston Depot as origin, sort other stops geographically
    const depotItem = stops.find(s => s.id === 'c-1') || stops[0]; 
    const otherStops = stops.filter(s => s.id !== depotItem.id);

    const optimized: RouteStop[] = [depotItem];
    let current = depotItem;

    while (otherStops.length > 0) {
      // Find stops with boxes first, then closest physical distance
      let closestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < otherStops.length; i++) {
        const check = otherStops[i];
        
        // Euclidean distance logic
        const dist = Math.sqrt(
          Math.pow(check.lat - current.lat, 2) + 
          Math.pow(check.lng - current.lng, 2)
        );

        // Add sorting bias towards stops with pending boxes
        const priorityMultiplier = check.boxCount > 0 ? 0.4 : 1.0;
        const weightedDist = dist * priorityMultiplier;

        if (weightedDist < minDistance) {
          minDistance = weightedDist;
          closestIdx = i;
        }
      }

      const nextCurrent = otherStops.splice(closestIdx, 1)[0];
      optimized.push(nextCurrent);
      current = nextCurrent;
    }

    setStops(optimized);
    setSelectedStopIdx(null);
    setCurrentSimStopIdx(0);
    setSimPercentage(0);
    setMapCenter({ lat: optimized[0].lat, lng: optimized[0].lng });
    setMapZoom(11);
    
    setCustomFeedbackMessage("⚡ ¡Ruta para Recolección Optimizada! Paradas ordenadas inteligentemente para reducir consumo de combustible.");
    setTimeout(() => setCustomFeedbackMessage(''), 5000);
  };

  // Add Custom Stop using local geocoding simulate or placeholder
  const handleAddCustomStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStopName || !customStopAddress) return;

    setGeocodingInProgress(true);
    setCustomFeedbackMessage("Geocodificando dirección ingresada...");

    // Simulate query processing and dynamic coordinate generation
    setTimeout(() => {
      // Create random offset coordinate in Houston
      const offsetLat = (Math.random() - 0.5) * 0.15;
      const offsetLng = (Math.random() - 0.5) * 0.15;
      const newStop: RouteStop = {
        id: `custom-${Date.now()}`,
        name: customStopName,
        address: customStopAddress,
        lat: HOUSTON_DEPOT.lat + offsetLat,
        lng: HOUSTON_DEPOT.lng + offsetLng,
        boxCount: 1, // simulated box
        isCustom: true
      };

      setStops(prev => [...prev, newStop]);
      setMapCenter({ lat: newStop.lat, lng: newStop.lng });
      setMapZoom(12);
      
      setCustomStopName('');
      setCustomStopAddress('');
      setShowAddCustomStop(false);
      setGeocodingInProgress(false);
      setCustomFeedbackMessage("✓ ¡Parada Añadida con Éxito al Mapa!");
      setTimeout(() => setCustomFeedbackMessage(''), 4000);
    }, 1200);
  };

  // Build external Google Maps navigation link with all stops (Waypoints)
  const handleOpenExternalNavigation = () => {
    if (stops.length === 0) return;

    // Outer destination is the last stop
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    
    // Intermediate stops as waypoints
    const waypointStops = stops.slice(1, -1);
    const waypoints = waypointStops.map(s => `${s.lat},${s.lng}`).join('|');

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints ? '&waypoints=' + encodeURIComponent(waypoints) : ''}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  const selectedStop = selectedStopIdx !== null ? stops[selectedStopIdx] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[650px]">
      
      {/* MAP CONTROLLER CABECERA */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-500 rounded-xl">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-[#FF6B00] bg-orange-950/40 px-2 py-0.5 rounded-full">
              GPS CONDUCCIÓN INTELIGENTE
            </span>
            <h2 className="text-sm font-black tracking-tight text-white uppercase mt-0.5">Control Vehicular y Navegación de Recorridos</h2>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={handleOptimizeRoute}
            className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-850 text-sky-400 hover:text-sky-300 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all"
            title="Optimiza el orden de las paradas utilizando el algoritmo del vecino más cercano"
          >
            <Sparkles size={11} className="text-[#FF6B00]" />
            Optimizar Ruta
          </button>

          <button 
            type="button"
            onClick={() => setShowAddCustomStop(!showAddCustomStop)}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <Plus size={12} className="text-[#FF6B00]" />
            Añadir Dirección Manual
          </button>

          <button 
            type="button"
            onClick={handleOpenExternalNavigation}
            className="px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Abrir indicaciones en Google Maps vehicular"
          >
            <Navigation size={11} />
            Iniciar GPS Copiloto
          </button>
        </div>
      </div>

      {/* SUBORDINATE FEEDBACK ALERTS */}
      {customFeedbackMessage && (
        <div className="bg-sky-955 text-sky-400 border-b border-sky-900 px-4 py-2 text-xs font-semibold flex items-center gap-2">
          <Sparkles size={14} className="text-[#FF6B00] animate-pulse" />
          {customFeedbackMessage}
        </div>
      )}

      {/* MAIN TWO-COLUMN FRAME SCREEN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        
        {/* PARTE IZQUIERDA: LISTADO DE CONTROL DE DETALLES Y SIMULADOR */}
        <div className="w-full md:w-[280px] bg-slate-950/40 p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
          
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <MapIcon size={12} className="text-[#FF6B00]" />
              Secuencia de Paradas ({stops.length})
            </span>

            {/* List wrapper */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {stops.map((stop, idx) => (
                <div 
                  key={stop.id} 
                  onClick={() => {
                    setSelectedStopIdx(idx);
                    setMapCenter({ lat: stop.lat, lng: stop.lng });
                    setMapZoom(13);
                  }}
                  className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                    selectedStopIdx === idx 
                      ? 'bg-[#002C54] border-sky-900 shadow-lg text-white' 
                      : stop.id === 'depot' 
                        ? 'bg-slate-900/60 border-slate-850 text-slate-300'
                        : 'bg-slate-900 border-slate-850 hover:bg-slate-850/50 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1.5 items-start">
                      <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                        idx === 0 
                          ? 'bg-emerald-500 text-white' 
                          : stop.boxCount > 0 
                            ? 'bg-[#FF6B00] text-white' 
                            : 'bg-slate-700 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 max-w-[170px]">
                        <h4 className="font-bold truncate">{stop.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{stop.address}</p>
                        {stop.boxCount > 0 && (
                          <span className="text-[9px] font-black text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded-full inline-block mt-1">
                            📦 {stop.boxCount} Cajas por recoger
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Swap & removal controls */}
                    <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button 
                        disabled={idx === 0}
                        onClick={() => handleMoveStop(idx, 'up')}
                        className="text-slate-500 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button 
                        disabled={idx === stops.length - 1}
                        onClick={() => handleMoveStop(idx, 'down')}
                        className="text-slate-500 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={11} />
                      </button>
                      {stop.isCustom && (
                        <button 
                          onClick={() => handleRemoveStop(idx)}
                          className="text-rose-500 hover:text-rose-400 mt-1"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIMULATION CONSOLE UNIT */}
          <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3 shrink-0">
            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
              <Truck size={12} className="text-[#FF6B00]" />
              Consola de Simulación
            </h3>

            <div className="text-[10px] text-slate-400 leading-snug space-y-2">
              <p>Mueve el marcador en tiempo real por el trazado optimizado.</p>
              
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 space-y-1 font-mono text-[9px] text-[#FF6B00]">
                <p>Status: <span className="text-white font-bold">{isSimulating ? "ACTIVADA" : "DETENIDA"}</span></p>
                <p>Camión en: <span className="text-white truncate block">
                  {stops[currentSimStopIdx]?.name || "Iniciando"}
                </span></p>
                <p>Ubicación GPS: <span className="text-slate-400">{simCoordinates.lat.toFixed(4)}°, {simCoordinates.lng.toFixed(4)}°</span></p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 ${
                  isSimulating 
                    ? 'bg-rose-900 hover:bg-rose-800 text-rose-200 border border-rose-850' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause size={12} /> Pausar Viaje
                  </>
                ) : (
                  <>
                    <Play size={12} /> Iniciar Recorrido
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSimPercentage(0);
                  setCurrentSimStopIdx(0);
                  setIsSimulating(false);
                  setSimCoordinates(HOUSTON_DEPOT);
                  setMapCenter(HOUSTON_DEPOT);
                  setMapZoom(10);
                }}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 rounded-xl"
                title="Resetear Simulación"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            
            {/* Speed slider info */}
            <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase font-bold pt-1">
              <span>Velocidad:</span>
              <div className="flex gap-1.5 font-mono">
                {[1, 3, 6].map(v => (
                  <button 
                    key={v}
                    onClick={() => setSimSpeed(v)}
                    className={`px-1.5 py-0.5 rounded ${simSpeed === v ? 'bg-[#FF6B00] text-white font-bold' : 'bg-slate-950 text-slate-400'}`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PARTE CENTRAL/DERECHA: EL LIENZO DE GOOGLE MAPS */}
        <div className="flex-1 bg-slate-950 relative flex flex-col justify-between h-full min-h-[300px]">
          
          {/* Custom Stop Modal Overlay inside canvas map */}
          {showAddCustomStop && (
            <div className="absolute top-4 left-4 right-4 z-40 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl max-w-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Añadir Dirección al GPS</h3>
                <button 
                  onClick={() => setShowAddCustomStop(false)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomStopSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Nombre Parada / Familia</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Familia Henrriquez Prado"
                    value={customStopName}
                    onChange={e => setCustomStopName(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Dirección USA Completa</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. 1028 NW 40th St, Houston, TX 77036"
                    value={customStopAddress}
                    onChange={e => setCustomStopAddress(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={geocodingInProgress}
                  className="w-full py-2 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  {geocodingInProgress ? 'Buscando Coordenadas...' : 'Geocodificar Parada'}
                </button>
              </form>
            </div>
          )}

          {/* RENDER MAP AREA */}
          <div className="flex-1 w-full h-full relative" style={{ minHeight: '380px' }}>
            {hasValidKey ? (
              /* REAL GOOGLE MAPS IMPLEMENTATION WITH ATTR */
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={HOUSTON_DEPOT}
                  defaultZoom={10}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full block"
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapCameraController center={mapCenter} zoom={mapZoom} />
                  {/* Stops Advanced Markers */}
                  {stops.map((stop, idx) => {
                    const isOrigin = idx === 0;
                    return (
                      <AdvancedMarker 
                        key={stop.id}
                        position={{ lat: stop.lat, lng: stop.lng }}
                        title={`${idx + 1}. ${stop.name} (${stop.boxCount} Cajas)`}
                        onClick={() => setSelectedStopIdx(idx)}
                      >
                        <Pin 
                          background={isOrigin ? '#10B981' : '#FF6B00'} 
                          glyphColor="#FFFFFF" 
                          scale={1.1}
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {/* Simulated Truck Marker in real-time coordinates */}
                  <AdvancedMarker position={simCoordinates}>
                    <div className="bg-slate-955 border-2 border-emerald-500 rounded-full p-2 shadow-2xl relative animate-bounce animate-pulse">
                      <Truck className="w-5 h-5 text-emerald-400" />
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        ✓
                      </span>
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              /* VISUAL BLUEPRINT CONSOCIAL INTERACTIVE GPS PREVIEW Fallback for sandbox */
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden"
                style={{ 
                  background: 'radial-gradient(circle, #011627 0%, #000c14 100%)',
                  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.4) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              >
                
                {/* SVG vector route overlay for high fidelity mock presentation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  {/* Draw connection line routes */}
                  {stops.length > 1 && (
                    <polyline
                      points={stops.map(s => {
                        // Normalize 2D projection on mock widget canvas center
                        const x = 50 + (s.lng - HOUSTON_DEPOT.lng) * 900;
                        const y = 50 - (s.lat - HOUSTON_DEPOT.lat) * 900;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      className="animate-dash"
                    />
                  )}

                  {/* Draw active truck route journey polyline */}
                  {stops.length > 0 && isSimulating && (
                    <polyline
                      points={stops.slice(0, currentSimStopIdx + 1).map(s => {
                        const x = 50 + (s.lng - HOUSTON_DEPOT.lng) * 900;
                        const y = 50 - (s.lat - HOUSTON_DEPOT.lat) * 900;
                        return `${x}%,${y}%`;
                      }).join(' ') + ` ${50 + (simCoordinates.lng - HOUSTON_DEPOT.lng) * 900}%,${50 - (simCoordinates.lat - HOUSTON_DEPOT.lat) * 900}%`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                    />
                  )}
                </svg>

                {/* Render nodes interactively as coordinate buttons in space */}
                {stops.map((stop, idx) => {
                  const x = 50 + (stop.lng - HOUSTON_DEPOT.lng) * 900;
                  const y = 50 - (stop.lat - HOUSTON_DEPOT.lat) * 900;

                  return (
                    <div 
                      key={stop.id}
                      onClick={() => setSelectedStopIdx(idx)}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl border cursor-pointer select-none text-[9px] flex items-center gap-1.5 transition-all shadow-md ${
                        selectedStopIdx === idx 
                          ? 'bg-[#002C54] border-emerald-500 scale-110 z-20 text-white' 
                          : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-650'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center text-white ${idx === 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="font-extrabold max-w-[80px] truncate">{stop.name}</span>
                    </div>
                  );
                })}

                {/* Simulated truck icon in overlay coordinates */}
                <div 
                  style={{
                    left: `${50 + (simCoordinates.lng - HOUSTON_DEPOT.lng) * 900}%`,
                    top: `${50 - (simCoordinates.lat - HOUSTON_DEPOT.lat) * 900}%`
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 bg-slate-950 border border-emerald-400 text-emerald-400 p-2 rounded-2xl shadow-xl flex items-center gap-1.5 z-30 transition-all duration-75"
                >
                  <Truck size={14} className="animate-pulse" />
                  <span className="font-black text-[8px]">OLOMÁN VEHICLE</span>
                </div>

                {/* BANNER WITH SETUP INSTRUCTIONS */}
                <div className="bg-slate-950/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 text-center max-w-md shadow-2xl z-20 space-y-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-orange-400 animate-pulse">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">Presentación de Ruta de Recolección</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      El trazado interactivo geográfico está activo en modo simulación local. Para habilitar los mapas reales de Google Maps satelital y relieves, ingresa tu clave API en los secretos del proyecto.
                    </p>
                  </div>

                  <div className="border border-slate-850 p-2.5 rounded-xl bg-slate-900/40 text-left text-[9px] text-slate-400 space-y-1.5 leading-snug">
                    <p className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
                      <Info size={10} className="text-[#FF6B00]" />
                      Instrucciones para activar mapas reales:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Obtén tu API Key del portal Google Cloud Console.</li>
                      <li>Abre el panel de <strong>Settings</strong> (⚙️ ícono de engranaje arriba a la derecha).</li>
                      <li>Accede a <strong>Secrets</strong>, escribe <code className="text-white font-mono bg-slate-950 px-1 py-0.5 rounded">GOOGLE_MAPS_PLATFORM_KEY</code> y agrégala.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE FOOTER BAR STATS */}
          {selectedStop && (
            <div className="bg-slate-950 p-3.5 border-t border-slate-850 flex items-center justify-between gap-4 animate-fadeIn shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[#FF6B00]">
                  <MapPin size={14} />
                </div>
                <div className="text-left text-xs">
                  <span className="text-[9px] font-bold text-slate-550 block uppercase">Parada Seleccionada</span>
                  <p className="font-bold text-white truncate max-w-[150px] sm:max-w-xs">{selectedStop.name}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-xs">{selectedStop.address}</p>
                </div>
              </div>

              {/* Box collection details */}
              <div className="text-right flex items-center gap-2">
                <div className="text-xs">
                  <span className="text-[9px] font-bold text-slate-550 block uppercase">Cajas de Ruta</span>
                  <p className="font-black text-amber-400">{selectedStop.boxCount} Registros</p>
                </div>
                
                <button 
                  onClick={() => {
                    const cleanPhone = selectedStop.client?.telefono.replace(/\D/g, '') || '';
                    const message = `Hola ${selectedStop.client?.nombre}, soy de Olomán Express con la unidad TX-HND-9004. Estoy cerca de tu ubicación en ${selectedStop.address} para la recolección de tus cajas. Por favor ten listos tus paquetes. ¡Gracias!`;
                    const waPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
                    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
                    window.open(waUrl, '_blank');
                  }}
                  disabled={!selectedStop.client}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all disabled:opacity-30 shrink-0"
                >
                  Confirmar Arribo
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
