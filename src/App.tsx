import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Search, Truck, MapPin, Eye, Check, Lock, LogOut, Code, 
  Pencil, Trash2, LayoutDashboard, ChevronRight, Download, RefreshCw, X, 
  FileSpreadsheet, Package, Info, AlertCircle, Smartphone, Monitor, ChevronLeft,
  MessageCircle, PenTool, CreditCard, Share2, Compass, Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Box, DriveSession } from './types';
import { generateClientReceiptPDF, generateRouteManifestPDF } from './pdfService';
import CameraCapture from './components/CameraCapture';
import FlutterConsole from './components/FlutterConsole';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import PickupRouteMap from './components/PickupRouteMap';
import { OlomanLogo } from './components/OlomanLogo';

export default function App() {
  // Session / Authentication state
  const [driverSession, setDriverSession] = useState<DriveSession | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Core Data Lists
  const [clients, setClients] = useState<Client[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  
  // UI Panels
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'boxes-list' | 'flutter-dev' | 'navigation-map'>('dashboard');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);
  const [isMobileSim, setIsMobileSim] = useState(true); // Toggle to simulate phone device frame

  // Forms Search & Filters
  const [clientSearch, setClientSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState<'todos' | 'pequeña' | 'mediana' | 'grande'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'recogido' | 'entregado en bodega'>('todos');

  // New Client Form Modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccionUSA: '',
    destinoHonduras: 'Yoro, El Negrito'
  });

  // Box Registration Form
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [activeClientForBox, setActiveClientForBox] = useState<Client | null>(null);
  const [boxFormSize, setBoxFormSize] = useState<'pequeña' | 'mediana' | 'grande'>('mediana');
  const [boxFormNotes, setBoxFormNotes] = useState('');
  const [boxFormPhoto, setBoxFormPhoto] = useState('');
  const [boxFormCategory, setBoxFormCategory] = useState<'Ropa y Calzado' | 'Herramientas' | 'Electrónicos' | 'Repuestos' | 'Medicinas/Alimento' | 'Varios'>('Ropa y Calzado');

  // Receipt Preview States
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);

  // Editing Box Price state
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  // Auto-fill Driver code PIN shortcut for evaluation
  const demoPinShortcut = () => {
    setPinInput('1803');
    setLoginError(false);
  };

  // Load and parse dataset from localStorage or insert rich default logistics mockup values
  useEffect(() => {
    const savedClients = localStorage.getItem('oloman_clients');
    const savedBoxes = localStorage.getItem('oloman_boxes');
    const savedSession = localStorage.getItem('oloman_session');

    if (savedClients && savedBoxes) {
      setClients(JSON.parse(savedClients));
      setBoxes(JSON.parse(savedBoxes));
    } else {
      // DEFAULT PREMIUM DEMO DATA: Focused on USA to Yoro/Honduras logistic flows
      const defaultClients: Client[] = [
        { 
          id: 'c-1', 
          nombre: 'Melissa Portillo', 
          email: 'hOhuuuuu@icloud.com', 
          telefono: '+1 565940494', 
          direccionUSA: '7402 Sovereign Row, Houston, TX 77036', 
          destinoHonduras: 'El Negrito, Yoro', 
          cajasAsignadas: 2 
        },
        { 
          id: 'c-2', 
          nombre: 'Carlos Roberto Meza Aguilar', 
          email: 'carlos.meza@outlook.com', 
          telefono: '+1 (305) 982-4112', 
          direccionUSA: '1028 NW 40th St, Miami, FL 33127', 
          destinoHonduras: 'San Pedro Sula, Cortés', 
          cajasAsignadas: 1 
        },
        { 
          id: 'c-3', 
          nombre: 'Xiomara Castro Henrriquez', 
          email: 'xiomara.castro@gmail.com', 
          telefono: '+1 (713) 401-2993', 
          direccionUSA: '820 Cypress Creek Pkwy, Houston, TX 77090', 
          destinoHonduras: 'Yoro Municipio, Yoro', 
          cajasAsignadas: 3 
        },
        { 
          id: 'c-4', 
          nombre: 'Francisco Orellana Galeas', 
          email: 'francisco_galeas@yahoo.com', 
          telefono: '+1 (508) 321-4456', 
          direccionUSA: '508 W 114th St, Boston, MA 10025', 
          destinoHonduras: 'El Progreso, Yoro', 
          cajasAsignadas: 0 
        }
      ];

      const defaultBoxes: Box[] = [
        {
          id: 'b-1',
          clientId: 'c-1',
          etiquetaBarra: 'OLM-TX-10492',
          tamano: 'mediana',
          precio: 120,
          notas: 'Ropa variada y zapatos para niños en El Negrito.',
          photoUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400&auto=format&fit=crop',
          estado: 'recogido',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'b-2',
          clientId: 'c-1',
          etiquetaBarra: 'OLM-TX-10493',
          tamano: 'pequeña',
          precio: 80,
          notas: 'Medicamentos y alimentos no perecederos familiares.',
          photoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop',
          estado: 'pendiente',
          createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
        },
        { 
          id: 'b-3',
          clientId: 'c-2',
          etiquetaBarra: 'OLM-FL-39102',
          tamano: 'grande',
          precio: 180,
          notas: 'Herramientas de taller y artículos electrónicos.',
          photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop',
          estado: 'recogido',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          id: 'b-4',
          clientId: 'c-3',
          etiquetaBarra: 'OLM-TX-44021',
          tamano: 'grande',
          precio: 180,
          notas: 'Utensilios de cocina y regalos navideños familiares.',
          photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop',
          estado: 'entregado en bodega',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 'b-5',
          clientId: 'c-3',
          etiquetaBarra: 'OLM-TX-44022',
          tamano: 'mediana',
          precio: 120,
          notas: 'Repuestos ligeros para moto lineal Yoro.',
          photoUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400&auto=format&fit=crop',
          estado: 'pendiente',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'b-6',
          clientId: 'c-3',
          etiquetaBarra: 'OLM-TX-44023',
          tamano: 'pequeña',
          precio: 80,
          notas: 'Juguetes para el cumpleaños.',
          photoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop',
          estado: 'recogido',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ];

      setClients(defaultClients);
      setBoxes(defaultBoxes);
      localStorage.setItem('oloman_clients', JSON.stringify(defaultClients));
      localStorage.setItem('oloman_boxes', JSON.stringify(defaultBoxes));
    }

    if (savedSession) {
      setDriverSession(JSON.parse(savedSession));
    }
  }, []);

  // Save changes automatically to preserve state persistently
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem('oloman_clients', JSON.stringify(clients));
    }
  }, [clients]);

  useEffect(() => {
    if (boxes.length > 0) {
      localStorage.setItem('oloman_boxes', JSON.stringify(boxes));
    }
  }, [boxes]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple codes allowed: 1803 (Yoro El Negrito anniversary standard) or 2026 (current deployment year standard)
    if (pinInput === '1803' || pinInput === '2026') {
      const activeSession: DriveSession = {
        driverName: 'Fugon Ortega Nolasco Rodriguez',
        badgeCode: `OLE-${pinInput}`,
        routeId: 'TX-HND-9004',
        routeName: 'Houston, TX - Yoro - El Negrito Route'
      };
      setDriverSession(activeSession);
      localStorage.setItem('oloman_session', JSON.stringify(activeSession));
      setLoginError(false);
      setPinInput('');
    } else {
      setLoginError(true);
      // feedback shake logic
    }
  };

  const handleLogout = () => {
    setDriverSession(null);
    localStorage.removeItem('oloman_session');
    setSelectedClientDetail(null);
  };

  // Add client submit handler
  const handleAddNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.nombre || !newClientData.direccionUSA) return;

    const newId = `c-${Date.now()}`;
    const addedClient: Client = {
      id: newId,
      nombre: newClientData.nombre,
      email: newClientData.email || 'info@olomanexpress.com',
      telefono: newClientData.telefono || '+1 (800) 555-OLOMAN',
      direccionUSA: newClientData.direccionUSA,
      destinoHonduras: newClientData.destinoHonduras,
      cajasAsignadas: 0
    };

    const updated = [addedClient, ...clients];
    setClients(updated);
    setNewClientData({
      nombre: '',
      email: '',
      telefono: '',
      direccionUSA: '',
      destinoHonduras: 'Yoro, El Negrito'
    });
    setShowAddClientModal(false);
    setSelectedClientDetail(addedClient);
  };

  // Register New Box Submission with instant auto calculation
  const handleAddBoxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientForBox) return;

    // Price calculation formula
    let boxPrice = 120; // default medium
    if (boxFormSize === 'pequeña') boxPrice = 80;
    if (boxFormSize === 'grande') boxPrice = 180;

    const newBox: Box = {
      id: `b-${Date.now()}`,
      clientId: activeClientForBox.id,
      etiquetaBarra: `OLM-${activeClientForBox.nombre.substring(0,2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      tamano: boxFormSize,
      precio: boxPrice,
      notas: boxFormNotes || 'Paquete de encomienda estándar',
      photoUrl: boxFormPhoto || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400&auto=format&fit=crop',
      estado: 'recogido', // Once registered by driver, it status defaults immediately to 'recogido'
      createdAt: new Date().toISOString(),
      categoria: boxFormCategory
    };

    // Update list of boxes
    const updatedBoxes = [newBox, ...boxes];
    setBoxes(updatedBoxes);

    // Update client counter
    const updatedClients = clients.map(client => {
      if (client.id === activeClientForBox.id) {
        return { ...client, cajasAsignadas: client.cajasAsignadas + 1 };
      }
      return client;
    });
    setClients(updatedClients);

    // Reset Form & close
    setBoxFormNotes('');
    setBoxFormSize('mediana');
    setBoxFormPhoto('');
    setBoxFormCategory('Ropa y Calzado');
    setShowAddBoxModal(false);
    
    // Refresh modal focus details
    const refocusedClient = updatedClients.find(c => c.id === activeClientForBox.id);
    if (refocusedClient) {
      setSelectedClientDetail(refocusedClient);
    }
    setActiveClientForBox(null);
  };

  // Remove box (and discount client box counter)
  const handleDeleteBox = (boxId: string) => {
    const targetBox = boxes.find(b => b.id === boxId);
    if (!targetBox) return;

    const consent = window.confirm("¿Está seguro de eliminar este registro de caja?");
    if (!consent) return;

    // Remove box
    const filteredBoxes = boxes.filter(b => b.id !== boxId);
    setBoxes(filteredBoxes);

    // Decrement client Counter
    const updatedClients = clients.map(client => {
      if (client.id === targetBox.clientId) {
        return { ...client, cajasAsignadas: Math.max(0, client.cajasAsignadas - 1) };
      }
      return client;
    });
    setClients(updatedClients);

    localStorage.setItem('oloman_clients', JSON.stringify(updatedClients));
    localStorage.setItem('oloman_boxes', JSON.stringify(filteredBoxes));

    // Refresh client screen details if shown
    if (selectedClientDetail && selectedClientDetail.id === targetBox.clientId) {
      const refreshed = updatedClients.find(c => c.id === targetBox.clientId);
      if (refreshed) {
        setSelectedClientDetail(refreshed);
      }
    }
  };

  // Upgrades box collection status
  const handleToggleBoxStatus = (boxId: string, nextStatus: 'pendiente' | 'recogido' | 'entregado en bodega') => {
    const updated = boxes.map(b => {
      if (b.id === boxId) {
        return { ...b, estado: nextStatus };
      }
      return b;
    });
    setBoxes(updated);
  };

  // Save edited box price and persist to local storage
  const handleSavePrice = (boxId: string) => {
    const numericPrice = parseFloat(editingPriceValue);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setEditingBoxId(null);
      return;
    }

    const updated = boxes.map(b => {
      if (b.id === boxId) {
        return { ...b, precio: numericPrice };
      }
      return b;
    });

    setBoxes(updated);
    localStorage.setItem('oloman_boxes', JSON.stringify(updated));
    setEditingBoxId(null);
  };

  // Generate and Download customer specific PDF receipt (now triggers custom interactive visual preview modal first)
  const triggerClientPDF = (client: Client) => {
    setPreviewClient(client);
    setShowReceiptPreview(true);
  };

  // Generate and Download driver general manifests loaded PDF
  const triggerRouteManifestPDF = () => {
    const collectedBoxes = boxes.filter(b => b.estado === 'recogido' || b.estado === 'entregado en bodega');
    const session = driverSession || {
      driverName: 'Fugon Ortega Nolasco Rodriguez',
      badgeCode: 'OLE-1803',
      routeId: 'TX-HND-9004',
      routeName: 'Houston, TX - Yoro - El Negrito Route'
    };
    generateRouteManifestPDF(clients, collectedBoxes, session);
  };

  // Direct CSV report download formatted cleanly for Excel imports
  const triggerExcelExport = () => {
    const headers = [
      "Código Barra / Etiqueta", 
      "Cliente Cortador", 
      "Teléfono", 
      "Dirección Recogida USA", 
      "Municipio Destino Honduras", 
      "Tamaño Caja", 
      "Cobro USD", 
      "Estado Recogida", 
      "Notas Internas Conductor", 
      "Fecha Captura"
    ];

    const rows = boxes.map(box => {
      const parent = clients.find(c => c.id === box.clientId);
      return [
        box.etiquetaBarra,
        parent ? `"${parent.nombre}"` : 'Desconocido',
        parent ? `"${parent.telefono}"` : '',
        parent ? `"${parent.direccionUSA.replace(/"/g, '""')}"` : '',
        parent ? `"${parent.destinoHonduras}"` : '',
        box.tamano.toUpperCase(),
        `${box.precio}`,
        box.estado.toUpperCase(),
        `"${box.notas.replace(/"/g, '""')}"`,
        box.createdAt || ''
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Manifiesto_Oloman_Express_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  };

  // Update client payment details on the fly
  const handleUpdateClientPaymentMethod = (clientId: string, method: 'Zelle' | 'Efectivo USA' | 'Efectivo Honduras' | 'Pendiente') => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        return { ...c, metodoPago: method };
      }
      return c;
    });
    setClients(updated);
    localStorage.setItem('oloman_clients', JSON.stringify(updated));
    
    // Update selected client detail reference as well if currently focused
    if (selectedClientDetail && selectedClientDetail.id === clientId) {
      setSelectedClientDetail({ ...selectedClientDetail, metodoPago: method });
    }
  };

  // Delete a client and their registered boxes
  const handleDeleteClient = (clientId: string) => {
    const targetClient = clients.find(c => c.id === clientId);
    if (!targetClient) return;

    const consent = window.confirm(`¿Está seguro de eliminar al cliente "${targetClient.nombre}" y todos sus registros de cajas asociados?`);
    if (!consent) return;

    const updatedClients = clients.filter(c => c.id !== clientId);
    const updatedBoxes = boxes.filter(b => b.clientId !== clientId);

    setClients(updatedClients);
    setBoxes(updatedBoxes);

    localStorage.setItem('oloman_clients', JSON.stringify(updatedClients));
    localStorage.setItem('oloman_boxes', JSON.stringify(updatedBoxes));

    if (selectedClientDetail?.id === clientId) {
      setSelectedClientDetail(null);
    }
  };

  // Direct WhatsApp formatted summary receipt API link
  const triggerWhatsAppReceipt = (client: Client) => {
    const clientBoxes = boxes.filter(b => b.clientId === client.id);
    const total = clientBoxes.reduce((acc, b) => acc + b.precio, 0);
    const receiptNo = `OE-TX-${client.id.replace('c-', '').toUpperCase().slice(0, 8)}`;
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let boxesText = '';
    clientBoxes.forEach((b, i) => {
      boxesText += `• Caja ${b.tamano.toUpperCase()} (${b.etiquetaBarra})${b.categoria ? ' - ' + b.categoria : ''}: *$${b.precio} USD* (${b.estado})\n`;
    });
    
    const messageText = `*OLOMÁN EXPRESS - RECIBO DE RECOLECCIÓN*\n` +
      `-----------------------------------------------\n` +
      `*No. Recibo:* ${receiptNo}\n` +
      `*Fecha:* ${dateStr}\n` +
      `*Ruta:* Houston, TX a Yoro, El Negrito\n` +
      `*Conductor:* ${driverSession?.driverName || 'Fugon Ortega Nolasco Rodriguez'}\n\n` +
      `👤 *Cliente / Remitente:* ${client.nombre}\n` +
      `📞 *Teléfono:* ${client.telefono}\n` +
      `📍 *Dirección USA:* ${client.direccionUSA}\n` +
      `🎯 *Destino Honduras:* ${client.destinoHonduras}\n` +
      `💳 *Forma de Pago:* ${client.metodoPago || 'Zelle / Pendiente'}\n\n` +
      `*Cajas Recogidas:*\n${boxesText}\n` +
      `💰 *TOTAL A COBRAR:* *$${total.toFixed(2)} USD*\n\n` +
      `_¡Gracias por enviar con Olomán Express! Su carga en las mejores de las manos._`;
      
    const cleanPhone = client.telefono.replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
    
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  // Price policies variables
  const priceStats = {
    pequeña: 80,
    mediana: 120,
    grande: 180
  };

  // Logistics math counts
  const totalCajasCatalogadas = boxes.length;
  const numCajasPendientes = boxes.filter(b => b.estado === 'pendiente').length;
  const numCajasRecogidas = boxes.filter(b => b.estado === 'recogido').length;
  const numCajasEnBodega = boxes.filter(b => b.estado === 'entregado en bodega').length;
  const totalCobroEstimado = boxes.reduce((sum, b) => sum + b.precio, 0);
  const totalCobroEfectuado = boxes.filter(b => b.estado === 'recogido' || b.estado === 'entregado en bodega').reduce((sum, b) => sum + b.precio, 0);

  // Filters results
  const filteredClients = clients.filter(c => {
    return c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) || 
           c.destinoHonduras.toLowerCase().includes(clientSearch.toLowerCase()) ||
           c.direccionUSA.toLowerCase().includes(clientSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* HEADER DE CONTROL SUPERIOR (DESKTOP PANEL DE NAVEGACIÓN COMPLEMENTARIA) */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <OlomanLogo variant="dark" className="h-14 w-auto text-slate-100" />
          <div className="hidden sm:block border-l border-slate-800 pl-4 py-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700/50 font-mono px-2 py-0.5 rounded-full font-bold">DRIVERS CORE v1.02</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Logística de Cargas Seguras: Estados Unidos a Honduras (Yoro • El Negrito)</p>
          </div>
        </div>

        {/* Modos Visuales interactivos (Mobile vs Full Screen desktop view) */}
        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button 
            onClick={() => setIsMobileSim(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition font-semibold ${
              isMobileSim ? 'bg-[#FF6B00] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            Vista Smartphone Driver
          </button>
          <button 
            onClick={() => setIsMobileSim(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition font-semibold ${
              !isMobileSim ? 'bg-[#002C54] text-white border border-blue-500/20 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor size={14} />
            Vista Desktop Dispatcher
          </button>
        </div>

        {driverSession && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{driverSession.driverName}</p>
              <p className="text-[10px] text-slate-500 font-mono">{driverSession.badgeCode} • {driverSession.routeId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition duration-150 border border-slate-700/50"
              title="Cerrar Jornada"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      {/* CUERPO DEL PANEL PRINCIPAL */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!driverSession ? (
            /* =========================================
               PANTALLA DE LOGÍN SENCILLO (FÁCIL INGRESO)
               ========================================= */
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="max-w-md mx-auto my-12"
            >
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#002C54]/30 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center space-y-4">
                  <div className="py-2">
                    <OlomanLogo variant="dark" className="h-16 w-auto mx-auto" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Conexión Conductor</h2>
                    <p className="text-xs text-slate-400 mt-1">Olomán Express Cargo App. Ingresa tu número de placa PIN asignado.</p>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Código de Conductor o PIN</label>
                    <input 
                      type="password"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Introduce tu PIN (p. ej. 1803)"
                      className="w-full text-center tracking-widest text-lg font-black font-mono py-4 px-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition"
                    />
                  </div>

                  {loginError && (
                    <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>PIN incorrecto. Revisa o haz clic en el demo rápido abajo.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-[#FF6B00] hover:bg-[#e05e00] rounded-2xl shadow-lg shadow-orange-600/15 transition-all duration-200 active:scale-[0.98]"
                  >
                    Establecer Conexión de Ruta
                  </button>
                </form>

                <div className="border-t border-slate-800/80 pt-6 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">¿Evaluando la aplicación?</span>
                  </div>
                  <button
                    type="button"
                    onClick={demoPinShortcut}
                    className="w-full py-3 px-4 bg-[#002C54]/60 hover:bg-[#002C54] text-[#FF6B00] hover:text-white border border-[#FF6B00]/20 rounded-2xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Check size={14} />
                    Auto-completar PIN Demo (1803)
                  </button>
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    Soporte al conductor activo 24/7. Houston Central: <strong>+1 (832) 396-2837</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =========================================
               VISTA PRINCIPAL AUTENTICADA (DOS LOGY CORES)
               ========================================= */
            <div className="space-y-6">
              
              {isMobileSim ? (
                /* =========================================
                   MODO SINOPSIS SMARTPHONE SIMULATOR (Conductores en campo)
                   ========================================= */
                <div className="flex justify-center py-4">
                  
                  {/* Smartphone Frame Wrapper */}
                  <div className="w-full max-w-[410px] bg-slate-950 rounded-[44px] p-4 border-[10px] border-slate-800 shadow-2xl relative">
                    
                    {/* Altavoz Bocina superior y cámara frontal */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                      <div className="h-1.5 w-12 bg-slate-900 rounded-full mb-1" />
                    </div>

                    {/* Smartphone Screen Canvas */}
                    <div className="bg-slate-950 rounded-[30px] overflow-hidden min-h-[640px] flex flex-col pt-4">
                      
                      {/* Sub-Header del App Flutter */}
                      <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest font-semibold">{driverSession.routeId}</span>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                          <strong>Conductor:</strong> {driverSession.driverName.split(' ')[0]}
                        </div>
                      </div>

                      {/* CONTENIDOS MÓVILES DINÁMICOS POR PESTAÑA */}
                      <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                        <AnimatePresence mode="wait">
                          
                          {/* TAB 1: DASHBOARD MÓVIL */}
                          {activeTab === 'dashboard' && (
                            <motion.div
                              key="mob-dash"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                            >
                              {/* Tarjeta de Ruta Resumen */}
                              <div className="p-4 bg-gradient-to-br from-[#002C54] to-slate-900 rounded-2xl border border-blue-500/10 shadow relative overflow-hidden">
                                <div className="absolute -right-3 -bottom-3 text-white/5 opacity-10">
                                  <Truck size={80} />
                                </div>
                                <h4 className="text-[10px] text-[#FF6B00] uppercase tracking-widest font-bold">Ruta Logística Activa</h4>
                                <h3 className="text-sm font-bold text-white mt-1">U.S. States a Honduras</h3>
                                <p className="text-xs text-slate-300 mt-1">Recogiendo cajas familiares Houston • Miami destino final Yoro.</p>
                                
                                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[11px]">
                                  <div>
                                    <p className="text-slate-400">Vías de Envíos</p>
                                    <p className="font-bold text-white">Marítimo Regular</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-slate-400">Tiempo de Entrega</p>
                                    <p className="font-bold text-[#FF6B00]">15-21 días</p>
                                  </div>
                                </div>
                              </div>

                              {/* Bento Metrics (En columnas en celular) */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                  <p className="text-[9px] uppercase font-bold text-slate-400">Asignados</p>
                                  <p className="text-2xl font-black mt-1 text-white">{clients.length}</p>
                                  <span className="text-[8px] text-slate-500">Familias USA</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                  <p className="text-[9px] uppercase font-bold text-slate-400">Pendientes</p>
                                  <p className="text-2xl font-black mt-1 text-amber-500">{numCajasPendientes}</p>
                                  <span className="text-[8px] text-slate-500 font-mono">Cajas Ruta</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                  <p className="text-[9px] uppercase font-bold text-slate-400">Recogidas</p>
                                  <p className="text-2xl font-black mt-1 text-orange-500">{numCajasRecogidas}</p>
                                  <span className="text-[8px] text-slate-500">En Camión</span>
                                </div>
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                  <p className="text-[9px] uppercase font-bold text-slate-400">En Bodega</p>
                                  <p className="text-2xl font-black mt-1 text-emerald-500">{numCajasEnBodega}</p>
                                  <span className="text-[8px] text-slate-500">Para Honduras</span>
                                </div>
                              </div>

                              {/* Monto de Cobro Parcial */}
                              <div className="bg-slate-900 p-4 border border-slate-800 rounded-2xl flex items-center justify-between">
                                <div>
                                  <p className="text-[9px] uppercase text-slate-400 font-bold">Total Cobro del Día</p>
                                  <p className="text-base font-black text-white mt-0.5">$ {totalCobroEstimado.toFixed(2)} USD</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] uppercase text-slate-400 font-bold">Cobrado</p>
                                  <p className="text-xs font-black text-[#FF6B00] mt-0.5">$ {totalCobroEfectuado.toFixed(2)}</p>
                                </div>
                              </div>

                              {/* Acciones Rápidas del Día */}
                              <div className="space-y-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-1">Listado de Tareas Rápidas</span>
                                <button
                                  onClick={() => setActiveTab('clients')}
                                  className="w-full flex items-center justify-between p-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 transition"
                                >
                                  <span className="flex items-center gap-2">
                                    <Truck size={14} />
                                    <span>Ir a Recoger Encomiendas</span>
                                  </span>
                                  <ChevronRight size={14} />
                                </button>
                                <button
                                  onClick={triggerRouteManifestPDF}
                                  className="w-full flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 text-[#FF6B00] hover:text-white rounded-xl text-xs font-bold transition"
                                >
                                  <span className="flex items-center gap-2">
                                    <Download size={14} />
                                    <span>Generar Manifiesto General</span>
                                  </span>
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {/* TAB 2: LISTADO DE CLIENTES EN RUTA */}
                          {activeTab === 'clients' && (
                            <motion.div
                              key="mob-clients"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                            >
                              {/* Barra de Búsqueda Rápida */}
                              <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                                <input
                                  type="text"
                                  placeholder="Buscar cliente, destino..."
                                  value={clientSearch}
                                  onChange={(e) => setClientSearch(e.target.value)}
                                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                                />
                                {clientSearch && (
                                  <button onClick={() => setClientSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                                    <X size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Cabecera Clientes con Botón Añadir */}
                              <div className="flex items-center justify-between pl-1">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Clientes en Ruta ({filteredClients.length})</span>
                                <button
                                  onClick={() => setShowAddClientModal(true)}
                                  className="text-[10px] px-2 py-1 bg-[#FF6B00]/15 hover:bg-[#FF6B00]/30 text-[#FF6B00] rounded-lg font-bold transition flex items-center gap-1"
                                >
                                  <Plus size={10} /> Añadir Cliente
                                </button>
                              </div>

                              {/* Listado de Clientes con estado */}
                              <div className="space-y-2.5">
                                {filteredClients.map(client => {
                                  const clientBoxes = boxes.filter(b => b.clientId === client.id);
                                  const countPend = clientBoxes.filter(b => b.estado === 'pendiente').length;
                                  const countTotal = clientBoxes.length;

                                  return (
                                    <div
                                      key={client.id}
                                      onClick={() => {
                                        setSelectedClientDetail(client);
                                        setActiveTab('boxes-list');
                                      }}
                                      className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer group"
                                    >
                                      <div className="space-y-1 max-w-[70%]">
                                        <h4 className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition truncate">{client.nombre}</h4>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                          <MapPin size={10} className="text-[#FF6B00] shrink-0" />
                                          <span className="truncate">{client.destinoHonduras}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                          countTotal === 0 ? 'bg-slate-800 text-slate-400' : 
                                          countPend > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                          'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}>
                                          {countTotal === 0 ? 'Sin cajas' : `${countTotal - countPend}/${countTotal} Recogido`}
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1 text-right">{client.telefono.split(' ')[0]}</p>
                                      </div>
                                    </div>
                                  );
                                })}

                                {filteredClients.length === 0 && (
                                  <div className="p-8 text-center text-slate-500 italic text-xs">
                                    No se encontraron clientes asignados.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}

                          {/* TAB 3: GESTIÓN DE CAJAS POR CLIENTE SELECCIONADO */}
                          {activeTab === 'boxes-list' && (
                            <motion.div
                              key="mob-boxes-list"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                            >
                              {selectedClientDetail ? (
                                <div className="space-y-4">
                                  {/* Botón de volver al listado */}
                                  <button 
                                    onClick={() => {
                                      setSelectedClientDetail(null);
                                      setActiveTab('clients');
                                    }}
                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                                  >
                                    <ChevronLeft size={14} /> Volver a Clientes
                                  </button>

                                  {/* Cabecera Detalle de Familia */}
                                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div className="max-w-[85%]">
                                        <h3 className="text-xs font-bold text-white">{selectedClientDetail.nombre}</h3>
                                        <div className="space-y-1 text-[10px] text-slate-400 mt-1">
                                          <p><strong>Teléfono:</strong> {selectedClientDetail.telefono}</p>
                                          <p className="truncate w-[185px]"><strong>Pickup USA:</strong> {selectedClientDetail.direccionUSA}</p>
                                          <p className="text-sky-400 font-bold"><strong>Honduras:</strong> {selectedClientDetail.destinoHonduras}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteClient(selectedClientDetail.id)}
                                        className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition"
                                        title="Eliminar Cliente"
                                      >
                                        <Trash2 size={14} className="shrink-0" />
                                      </button>
                                    </div>

                                    {/* Selector de Método de Pago */}
                                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                      <label className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Método de Pago</label>
                                      <select
                                        value={selectedClientDetail.metodoPago || 'Zelle'}
                                        onChange={(e) => handleUpdateClientPaymentMethod(selectedClientDetail.id, e.target.value as any)}
                                        className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-[#FF6B00]"
                                      >
                                        <option value="Zelle">Zelle</option>
                                        <option value="Efectivo USA">Efectivo USA</option>
                                        <option value="Efectivo Honduras">Ef. Honduras</option>
                                        <option value="Pendiente">Pendiente</option>
                                      </select>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                      <button
                                        onClick={() => {
                                          setActiveClientForBox(selectedClientDetail);
                                          setShowAddBoxModal(true);
                                        }}
                                        className="flex-1 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold transition text-center"
                                      >
                                        + Agregar Caja
                                      </button>
                                      
                                      <button
                                        onClick={() => triggerClientPDF(selectedClientDetail)}
                                        className="px-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 border border-slate-700/80"
                                        title="Descargar Recibo en PDF"
                                        disabled={boxes.filter(b => b.clientId === selectedClientDetail.id).length === 0}
                                      >
                                        <Download size={11} /> PDF
                                      </button>

                                      <button
                                        onClick={() => triggerWhatsAppReceipt(selectedClientDetail)}
                                        className="px-2.5 bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 border border-emerald-900/50"
                                        title="Enviar Recibo por WhatsApp"
                                        disabled={boxes.filter(b => b.clientId === selectedClientDetail.id).length === 0}
                                      >
                                        <MessageCircle size={11} /> WhatsApp
                                      </button>
                                    </div>
                                  </div>

                                  {/* Registro de Cajas del Cliente */}
                                  <div className="space-y-3">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cajas Registradas en la Ficha</span>
                                    
                                    {boxes.filter(b => b.clientId === selectedClientDetail.id).map(box => (
                                      <div key={box.id} className="p-3 bg-slate-900 hover:bg-slate-900/85 rounded-xl border border-slate-800 text-xs space-y-2.5">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="font-mono text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                                              {box.etiquetaBarra}
                                            </span>
                                            <p className="text-[11px] font-semibold text-white uppercase mt-1">Caja {box.tamano}</p>
                                          </div>
                                          <div className="text-right">
                                            {editingBoxId === box.id ? (
                                              <div className="flex items-center gap-1 justify-end">
                                                <input
                                                  type="number"
                                                  value={editingPriceValue}
                                                  onChange={(e) => setEditingPriceValue(e.target.value)}
                                                  onBlur={() => handleSavePrice(box.id)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSavePrice(box.id);
                                                    if (e.key === 'Escape') setEditingBoxId(null);
                                                  }}
                                                  className="w-12 px-1 py-0.5 rounded border border-[#FF6B00] bg-slate-800 text-white text-[10px] font-bold text-center focus:outline-none"
                                                  autoFocus
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1 justify-end group/price">
                                                <span className="text-xs font-black text-[#FF6B00]">$ {box.precio} USD</span>
                                                <button
                                                  onClick={() => {
                                                    setEditingBoxId(box.id);
                                                    setEditingPriceValue(box.precio.toString());
                                                  }}
                                                  className="text-slate-550 hover:text-[#FF6B00] p-0.5 rounded opacity-0 group-hover/price:opacity-100 transition bg-transparent border-none shrink-0"
                                                  title="Editar Precio"
                                                >
                                                  <Pencil size={8} />
                                                </button>
                                              </div>
                                            )}
                                            <p className="text-[9px] text-[#FF6B00]/80 font-mono uppercase font-bold text-right">Tarifa Fija</p>
                                          </div>
                                        </div>

                                        {/* Foto de verificación */}
                                        <div className="aspect-[21/9] rounded-lg bg-slate-950 overflow-hidden relative border border-slate-800/85">
                                          <img
                                            src={box.photoUrl}
                                            className="w-full h-full object-cover"
                                            alt="Cargo verificado"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 rounded-full text-[9px] text-white">
                                            Cámara Verificada
                                          </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800/40">
                                          "{box.notas || 'Sin aclaración'}"
                                        </p>

                                        {/* Status Picker interactivo */}
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px]">
                                          <span className="text-slate-500 font-semibold font-mono">Estado:</span>
                                          <div className="flex gap-1.5">
                                            {(['pendiente', 'recogido', 'entregado en bodega'] as const).map(st => (
                                              <button
                                                key={st}
                                                onClick={() => handleToggleBoxStatus(box.id, st)}
                                                className={`px-2 py-0.5 rounded font-bold transition capitalize ${
                                                  box.estado === st 
                                                    ? st === 'pendiente' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                                      st === 'recogido' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-slate-800/40 text-slate-500'
                                                }`}
                                              >
                                                {st === 'entregado en bodega' ? 'En Bodega' : st}
                                              </button>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => handleDeleteBox(box.id)}
                                            className="text-slate-500 hover:text-red-400 transition ml-2"
                                            title="Eliminar Caja"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    {boxes.filter(b => b.clientId === selectedClientDetail.id).length === 0 && (
                                      <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 italic text-xs">
                                        No hay cajas asignadas a esta familia. Inicie un registro haciendo clic en "Agregar Caja" superior.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6 text-center text-slate-500 italic text-xs space-y-3">
                                  <p>Por favor seleccione primero un cliente desde la pestaña inferior para auditar sus encomiendas.</p>
                                  <button
                                    onClick={() => setActiveTab('clients')}
                                    className="px-4 py-2 bg-slate-900 border border-slate-800 text-[#FF6B00] rounded-xl text-xs font-bold"
                                  >
                                    Ver Clientes
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* TAB 4: FLUTTER CODEBASE PREVIEW */}
                          {activeTab === 'flutter-dev' && (
                            <motion.div
                              key="mob-flutter"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                            >
                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                                <Code size={24} className="text-[#FF6B00] mx-auto animate-pulse" />
                                <h3 className="text-xs font-bold text-white uppercase">Código Flutter Exclusivo</h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Para visualizar la estructura Flutter del Olomán Express con todas sus carpetas solicitadas: cambie a la <strong>"Vista Desktop Dispatcher"</strong> en el panel de control superior.
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {/* TAB: GPS NAVIGATION ROADMAP VIEW */}
                          {activeTab === 'navigation-map' && (
                            <motion.div
                              key="mob-navigation-map"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="h-full flex flex-col"
                            >
                              <PickupRouteMap 
                                clients={clients} 
                                boxes={boxes} 
                              />
                            </motion.div>
                          )}

                        </AnimatePresence>
                      </div>

                      {/* DECK DE NAVEGACIÓN MÓVIL ESTILO FLUTTER APP */}
                      <footer className="bg-slate-950 border-t border-slate-800/80 py-2.5 px-3 flex justify-around gap-1">
                        <button 
                          onClick={() => setActiveTab('dashboard')}
                          className={`flex flex-col items-center gap-1 transition ${
                            activeTab === 'dashboard' ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <LayoutDashboard size={17} />
                          <span className="text-[9px] font-bold">Resumen</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('clients')}
                          className={`flex flex-col items-center gap-1 transition ${
                            activeTab === 'clients' ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Users size={17} />
                          <span className="text-[9px] font-bold">Clientes</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('boxes-list')}
                          className={`flex flex-col items-center gap-1 transition ${
                            activeTab === 'boxes-list' ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Package size={17} />
                          <span className="text-[9px] font-bold">Cajas</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('navigation-map')}
                          className={`flex flex-col items-center gap-1 transition ${
                            activeTab === 'navigation-map' ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Compass size={17} className={activeTab === 'navigation-map' ? 'animate-spin-slow text-[#FF6B00]' : ''} />
                          <span className="text-[9px] font-bold">Mapa GPS</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('flutter-dev')}
                          className={`flex flex-col items-center gap-1 transition ${
                            activeTab === 'flutter-dev' ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Code size={17} />
                          <span className="text-[9px] font-bold">Código Dart</span>
                        </button>
                      </footer>

                    </div>

                    {/* Botón Home físico inferior iphone style */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
                  </div>

                </div>
              ) : (
                /* =========================================
                   MODO DESKTOP DISPATCHER VIEW 
                   ========================================= */
                <motion.div
                  key="desktop-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 text-slate-800"
                >
                  
                  {/* Pestañas de Navegación de Dispatcher */}
                  <div className="flex gap-2 border-b border-slate-800/10 pb-1 text-slate-500">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                        activeTab === 'dashboard' 
                          ? 'border-b-2 border-[#FF6B00] text-[#002C54] font-black' 
                          : 'hover:text-slate-900 text-slate-500'
                      }`}
                    >
                      Tablero General
                    </button>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                        activeTab === 'clients' 
                          ? 'border-b-2 border-[#FF6B00] text-[#002C54] font-black' 
                          : 'hover:text-slate-900 text-slate-500'
                      }`}
                    >
                      Padrón de Clientes
                    </button>
                    <button
                      onClick={() => setActiveTab('navigation-map')}
                      className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                        activeTab === 'navigation-map' 
                          ? 'border-b-2 border-[#FF6B00] text-[#002C54] font-black' 
                          : 'hover:text-slate-900 text-slate-500'
                      }`}
                    >
                      Mapa de Navegación Vehicular
                    </button>
                    <button
                      onClick={() => setActiveTab('flutter-dev')}
                      className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                        activeTab === 'flutter-dev' 
                          ? 'border-b-2 border-[#FF6B00] text-[#002C54] font-black' 
                          : 'hover:text-slate-900 text-slate-500'
                      }`}
                    >
                      Código Fuente Proyecto Flutter
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    
                    {/* ACCORDION 1: DASHBOARD DETALLADO DESKTOP */}
                    {activeTab === 'dashboard' && (
                      <motion.div
                        key="desk-dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                      >
                        {/* Highlights de Carga y Financiero */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          
                          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Conductores Conectados</span>
                            <p className="text-3xl font-black text-[#002C54] mt-1">{driverSession.driverName.split(' ')[0]}</p>
                            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold inline-block mt-3 uppercase tracking-wider">
                              Licencia Especial
                            </span>
                          </div>

                          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Monto Cobrado</span>
                            <p className="text-3xl font-black text-[#FF6B00] mt-1">$ {totalCobroEfectuado.toFixed(2)}</p>
                            <span className="text-[10px] text-slate-400 block mt-2">Sobre un total estimado de ${totalCobroEstimado.toFixed(2)} USD</span>
                          </div>

                          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cajas en Camión</span>
                            <p className="text-3xl font-black text-slate-900 mt-1">{numCajasRecogidas}</p>
                            <span className="text-[10px] text-slate-400 block mt-2">Cajas catalogadas como "Recogidas"</span>
                          </div>

                          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sincronización en la Nube</span>
                            <p className="text-3xl font-black text-emerald-600 mt-1">Firebase</p>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold inline-block mt-3">
                              Cloud Database Active
                            </span>
                          </div>

                        </div>

                        {/* Fila de Reportes Generales */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div>
                            <h3 className="font-extrabold text-[#002C54] text-sm uppercase tracking-wider flex items-center gap-2">
                              <Info size={16} className="text-[#FF6B00]" />
                              Centro de Exportación de Manifiesto Consolidado
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                              Descarga los registros completos de la ruta para tu entrega física en la aduana de Honduras o almacén en Yoro / Cortés.
                            </p>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={triggerRouteManifestPDF}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#002C54] hover:bg-[#001e3a] text-white text-xs font-bold rounded-2xl shadow transition"
                            >
                              <Download size={15} />
                              Descargar Manifiesto PDF
                            </button>
                            <button
                              onClick={triggerExcelExport}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-2xl shadow transition"
                            >
                              <FileSpreadsheet size={15} />
                              Exportar Planilla Excel
                            </button>
                          </div>
                        </div>

                        {/* Listado Consolidado de Cajas del Conductor */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                              <h3 className="text-sm font-bold text-[#002C54] uppercase tracking-wider">Distribución Consolidada de Encomiendas</h3>
                              <p className="text-[11px] text-slate-400 font-medium">Cajas catalogadas por conductor en jornada</p>
                            </div>
                            <span className="bg-slate-900 text-white font-mono text-[10px] px-2.5 py-1 rounded-full font-extrabold">
                              Total: {totalCajasCatalogadas} Cajas
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 font-sans">
                            {boxes.map(box => {
                              const parent = clients.find(c => c.id === box.clientId);
                              return (
                                <div key={box.id} className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                                      <Package size={20} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                          {box.etiquetaBarra}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                          box.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                                          box.estado === 'recogido' ? 'bg-orange-100 text-orange-850' :
                                          'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {box.estado === 'entregado en bodega' ? 'Recibido en Bodega' : box.estado}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1">
                                        <strong>Consignatario:</strong> {parent ? parent.nombre : 'Cargador Desconocido'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right flex flex-col items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#002C54]/5 px-2.5 py-1 rounded-lg">
                                      Caja {box.tamano}
                                    </span>
                                    <p className="text-[10px] text-slate-400 italic mt-1 font-medium">Destino: {parent ? parent.destinoHonduras : 'N/A'}</p>
                                  </div>

                                  <div className="text-right">
                                    {editingBoxId === box.id ? (
                                      <div className="flex items-center gap-1 justify-end">
                                        <span className="text-[12px] text-slate-400 font-mono font-bold">$</span>
                                        <input
                                          type="number"
                                          value={editingPriceValue}
                                          onChange={(e) => setEditingPriceValue(e.target.value)}
                                          onBlur={() => handleSavePrice(box.id)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSavePrice(box.id);
                                            if (e.key === 'Escape') setEditingBoxId(null);
                                          }}
                                          className="w-16 px-1.5 py-0.5 rounded border border-[#FF6B00] bg-white text-slate-800 text-xs font-bold text-center focus:outline-none"
                                          autoFocus
                                        />
                                        <span className="text-[10px] text-[#FF6B00] font-bold">USD</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 justify-end group/price">
                                        <p className="text-lg font-black text-[#FF6B00]">$ {box.precio.toFixed(2)} USD</p>
                                        <button
                                          onClick={() => {
                                            setEditingBoxId(box.id);
                                            setEditingPriceValue(box.precio.toString());
                                          }}
                                          className="text-slate-400 hover:text-[#FF6B00] p-1 rounded opacity-0 group-hover/price:opacity-100 transition bg-transparent hover:bg-slate-50 border-none shrink-0"
                                          title="Editar Precio"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                      </div>
                                    )}
                                    <p className="text-[9px] text-[#002C54] font-bold tracking-wider">Tasa Garantizada</p>
                                  </div>
                                </div>
                              );
                            })}
                            {boxes.length === 0 && (
                              <div className="p-12 text-center text-slate-400 italic">No hay cajas registradas actualmente.</div>
                            )}
                          </div>
                        </div>

                      </motion.div>
                    )}

                    {/* ACCORDION 2: PADRÓN DE CLIENTES DESKTOP */}
                    {activeTab === 'clients' && (
                      <motion.div
                        key="desk-clients"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                          <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                            <input
                              type="text"
                              placeholder="Buscar cliente, destino..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                            />
                          </div>

                          <button
                            onClick={() => setShowAddClientModal(true)}
                            className="bg-[#002C54] text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:shadow-lg transition-all"
                          >
                            <Plus size={14} /> Añadir Nuevo Cliente
                          </button>
                        </div>

                        {/* Listado con Cajas detalladas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filteredClients.map(client => {
                            const clientBoxes = boxes.filter(b => b.clientId === client.id);
                            return (
                              <div key={client.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="max-w-[70%]">
                                    <h3 className="font-extrabold text-[#002C54] text-sm uppercase tracking-wide truncate">{client.nombre}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">ID Cliente: {client.id} • Tel: {client.telefono}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-orange-50 text-[#FF6B00] border border-orange-100 text-[10px] font-bold px-3 py-1 rounded-full font-mono uppercase shrink-0">
                                      {clientBoxes.length} Cajas
                                    </span>
                                    <button
                                      onClick={() => handleDeleteClient(client.id)}
                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all shrink-0"
                                      title="Eliminar Cliente"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500">
                                  <p className="truncate"><strong>Dirección USA:</strong> {client.direccionUSA}</p>
                                  <p className="text-sky-600 font-bold"><strong>Destino Honduras:</strong> {client.destinoHonduras}</p>
                                </div>

                                {/* DESGLOSE TOTAL DE CAJAS (TAMAÑOS Y PRECIOS) */}
                                <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-2">
                                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1.5">
                                    <Package size={11} className="text-[#FF6B00]" /> Cajas Catalogadas (Precios y Tamaños)
                                  </span>
                                  {clientBoxes.length > 0 ? (
                                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                      {clientBoxes.map(box => (
                                        <div key={box.id} className="flex justify-between items-center bg-white border border-slate-200/50 rounded-xl p-2 text-[11px]">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-[9px] font-extrabold bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase">
                                              {box.tamano}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[10px] truncate max-w-[80px]" title={box.etiquetaBarra}>
                                              {box.etiquetaBarra}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                              box.estado === 'pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                              box.estado === 'recogido' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                              'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                              {box.estado === 'entregado en bodega' ? 'En Bodega' : box.estado}
                                            </span>
                                            {editingBoxId === box.id ? (
                                              <div className="flex items-center gap-1">
                                                <input
                                                  type="number"
                                                  value={editingPriceValue}
                                                  onChange={(e) => setEditingPriceValue(e.target.value)}
                                                  onBlur={() => handleSavePrice(box.id)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSavePrice(box.id);
                                                    if (e.key === 'Escape') setEditingBoxId(null);
                                                  }}
                                                  className="w-12 px-1 py-0.5 rounded border border-[#FF6B00] bg-white text-slate-800 text-[11px] font-bold text-center focus:outline-none"
                                                  autoFocus
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1 group/price">
                                                <span className="font-bold text-slate-800 font-mono">${box.precio}</span>
                                                <button
                                                  onClick={() => {
                                                    setEditingBoxId(box.id);
                                                    setEditingPriceValue(box.precio.toString());
                                                  }}
                                                  className="text-slate-400 hover:text-[#FF6B00] p-0.5 rounded opacity-0 group-hover/price:opacity-100 transition duration-150"
                                                  title="Editar Precio"
                                                >
                                                  <Pencil size={9} />
                                                </button>
                                              </div>
                                            )}
                                            <button
                                              onClick={() => handleDeleteBox(box.id)}
                                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition"
                                              title="Eliminar Caja"
                                            >
                                              <Trash2 size={11} className="shrink-0" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center text-[11px] font-black text-[#002C54]">
                                        <span>Valor Total Carga:</span>
                                        <span className="text-[#FF6B00] font-mono text-xs">
                                          ${clientBoxes.reduce((sum, b) => sum + b.precio, 0).toFixed(2)} USD
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-405 italic py-1 text-center font-medium">No hay cajas registradas para esta familia.</p>
                                  )}
                                </div>

                                {/* Controles de Pago */}
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1">
                                    <CreditCard size={10} className="text-[#FF6B00]" /> Método de Pago
                                  </span>
                                  <select
                                    value={client.metodoPago || 'Zelle'}
                                    onChange={(e) => handleUpdateClientPaymentMethod(client.id, e.target.value as any)}
                                    className="w-full bg-white text-slate-800 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#FF6B00]"
                                  >
                                    <option value="Zelle">Zelle</option>
                                    <option value="Efectivo USA">Efectivo USA</option>
                                    <option value="Efectivo Honduras">Efectivo Honduras</option>
                                    <option value="Pendiente">Pendiente de cobro</option>
                                  </select>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setActiveClientForBox(client);
                                      setShowAddBoxModal(true);
                                    }}
                                    className="flex-1 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl transition text-center hover:bg-[#e05e00] shadow-md shadow-orange-500/10"
                                  >
                                    Registrar Caja
                                  </button>
                                  
                                  <button
                                    onClick={() => triggerClientPDF(client)}
                                    className="px-3 py-2 bg-slate-100 text-[#002C54] text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-1 border border-slate-200"
                                    disabled={clientBoxes.length === 0}
                                    title="Descargar Recibo en PDF"
                                  >
                                    <Download size={13} /> PDF
                                  </button>

                                  <button
                                    onClick={() => triggerWhatsAppReceipt(client)}
                                    className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-200"
                                    disabled={clientBoxes.length === 0}
                                    title="Enviar Recibo por WhatsApp"
                                  >
                                    <MessageCircle size={13} /> WhatsApp
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ACCORDION 3: PROYECTO FLUTTER DEVELOPER CONSOLE */}
                    {activeTab === 'flutter-dev' && (
                      <motion.div
                        key="desk-flutter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <FlutterConsole />
                      </motion.div>
                    )}

                    {/* ACCORDION 4: MAPS DE NAVEGACIÓN VEHICULAR Y ENRUTAMIENTO */}
                    {activeTab === 'navigation-map' && (
                      <motion.div
                        key="desk-navigation-map"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <PickupRouteMap 
                          clients={clients} 
                          boxes={boxes} 
                        />
                      </motion.div>
                    )}

                  </AnimatePresence>

                </motion.div>
              )}
              
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* =========================================
         REGISTRO MODALS & DIALOGS (HTML FLOATS POR RESPONSIVIDAD)
         ========================================= */}
      
      {/* 1. REGISTRAR NUEVO CLIENTE (USA A HONDURAS) */}
      <AnimatePresence>
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-slate-100"
            >
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div>
                <h3 className="text-base font-black text-[#002C54] uppercase tracking-wide">Ficha Nuevo Cliente</h3>
                <p className="text-xs text-slate-400">Registrar remitente y destino final en Honduras.</p>
              </div>

              <form onSubmit={handleAddNewClient} className="space-y-4 text-xs font-medium">
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newClientData.nombre}
                    onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                    placeholder="p. ej. Roberto Henriquez Castro"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Teléfono de Enlace</label>
                  <input
                    type="text"
                    value={newClientData.telefono}
                    onChange={(e) => setNewClientData({ ...newClientData, telefono: e.target.value })}
                    placeholder="p. ej. +1 (832) 110-2983"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Correo Electrónico (Vouchers)</label>
                  <input
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="p. ej. roberto@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Dirección USA (Pickup)</label>
                  <input
                    type="text"
                    required
                    value={newClientData.direccionUSA}
                    onChange={(e) => setNewClientData({ ...newClientData, direccionUSA: e.target.value })}
                    placeholder="p. ej. 7402 Sovereign Row, Houston, TX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Destino El Negrito / Honduras</label>
                  <select
                    value={newClientData.destinoHonduras}
                    onChange={(e) => setNewClientData({ ...newClientData, destinoHonduras: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Yoro, El Negrito">El Negrito, Yoro (Oficina Olomán)</option>
                    <option value="Yoro, Municipio Yoro">Yoro, Cabecera</option>
                    <option value="Cortés, San Pedro Sula">San Pedro Sula, Cortés</option>
                    <option value="Yoro, El Progreso">El Progreso, Yoro</option>
                    <option value="Atlántida, Tela">Tela, Atlántida</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#002C54] hover:bg-[#00213d] text-white rounded-xl text-xs font-black uppercase tracking-widest transition"
                >
                  Registrar Ficha Cliente
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REGISTRAR NUEVA CAJA (REGISTRO LOGÍSTICO COMPLETO) */}
      <AnimatePresence>
        {showAddBoxModal && activeClientForBox && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 relative border border-slate-100 my-8"
            >
              <button 
                onClick={() => {
                  setShowAddBoxModal(false);
                  setActiveClientForBox(null);
                  setBoxFormNotes('');
                  setBoxFormPhoto('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#FF6B00] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  Ficha de Registro de Caja
                </span>
                <h3 className="text-base font-black text-[#002C54] uppercase tracking-wide mt-1.5">{activeClientForBox.nombre}</h3>
                <p className="text-xs text-slate-400">Ubicación del Envío: {activeClientForBox.destinoHonduras}</p>
              </div>

              <form onSubmit={handleAddBoxSubmit} className="space-y-4 text-xs font-medium">
                
                {/* 1. Selector de tamaño de caja (Precios automáticos regulados) */}
                <div className="space-y-2">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Tamaño de la Caja</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 'pequeña', tag: 'Pequeña ($80)', formula: '80' },
                      { size: 'mediana', tag: 'Mediana ($120)', formula: '120' },
                      { size: 'grande', tag: 'Grande ($180)', formula: '180' }
                    ].map(item => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setBoxFormSize(item.size as any)}
                        className={`py-3 text-center rounded-xl font-bold transition flex flex-col justify-center gap-1 border ${
                          boxFormSize === item.size 
                            ? 'bg-[#002C54] text-white border-[#002C54]' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="text-[11px] block">{item.size.toUpperCase()}</span>
                        <span className={`text-[10px] ${boxFormSize === item.size ? 'text-[#FF6B00]' : 'text-slate-500'}`}>
                          $ {item.formula} USD
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Captura Fotográfica mediante Cámara WebRTC */}
                <div className="space-y-2">
                  <CameraCapture 
                    boxSize={boxFormSize} 
                    onPhotoCaptured={(data) => setBoxFormPhoto(data)} 
                  />
                </div>

                {/* 2.5 Categoría de Contenido de la Caja */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Categoría Principal de Contenido</label>
                  <select
                    value={boxFormCategory}
                    onChange={(e) => setBoxFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Ropa y Calzado">👕 Ropa y Calzado</option>
                    <option value="Herramientas">🔧 Herramientas de Trabajo</option>
                    <option value="Electrónicos">📺 Artículos Electrónicos</option>
                    <option value="Repuestos">🏍️ Repuestos (Vehículos / Motos)</option>
                    <option value="Medicinas/Alimento">💊 Medicinas y Alimento</option>
                    <option value="Varios">📦 Varios / Encomienda Estándar</option>
                  </select>
                </div>

                {/* 3. Notas / Declaración de Contenidos */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Notas / Declaración de Equipaje</label>
                  <textarea
                    rows={2}
                    value={boxFormNotes}
                    onChange={(e) => setBoxFormNotes(e.target.value)}
                    placeholder="p. ej. Utensilios domésticos, ropa usada y regalos, juguetes..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                {/* Resumen Final de Cobros */}
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase text-[#002C54] font-bold">Total a cobrar por caja:</p>
                    <p className="text-[10px] text-slate-500">Regulado por tamaño del contenedor</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#FF6B00]">
                      $ {boxFormSize === 'pequeña' ? '80.00' : boxFormSize === 'mediana' ? '120.00' : '180.00'} USD
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBoxModal(false);
                      setActiveClientForBox(null);
                      setBoxFormNotes('');
                      setBoxFormPhoto('');
                    }}
                    className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 text-xs font-bold uppercase transition"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/10 transition"
                  >
                    Registrar Caja
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Preview Overlay Modal */}
      {showReceiptPreview && previewClient && (
        <ReceiptPreviewModal
          isOpen={showReceiptPreview}
          onClose={() => {
            setShowReceiptPreview(false);
            setPreviewClient(null);
          }}
          client={previewClient}
          boxes={boxes.filter(b => b.clientId === previewClient.id)}
          session={driverSession || {
            driverName: 'Fugon Ortega Nolasco Rodriguez',
            badgeCode: 'OLE-1803',
            routeId: 'TX-HND-9004',
            routeName: 'Houston, TX - Yoro - El Negrito Route'
          }}
          onWhatsAppShare={() => triggerWhatsAppReceipt(previewClient)}
        />
      )}

      {/* FOOTER GENERAL DE INFORMACIÓN CON AUTOPATENTE DE HUMILDAD */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>OLOMÁN EXPRESS ® Logistics Network - Texas USA & Municipio El Negrito, Yoro, Honduras.</p>
        <p className="text-[10px] tracking-wide text-slate-600">Sistema seguro sincronizado en tiempo real con bases de datos en la nube.</p>
      </footer>

    </div>
  );
}
