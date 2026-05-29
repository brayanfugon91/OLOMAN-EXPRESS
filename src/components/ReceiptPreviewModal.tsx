import React, { useState, useEffect } from 'react';
import { 
  X, Download, MessageCircle, FileText, Check, 
  CreditCard, MapPin, Package, PenTool, Calendar, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Client, Box, DriveSession } from '../types';
import { generateClientReceiptPdfBlobUrl, generateClientReceiptPDF } from '../pdfService';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  boxes: Box[];
  session: DriveSession;
  onWhatsAppShare: () => void;
}

export default function ReceiptPreviewModal({ 
  isOpen, 
  onClose, 
  client, 
  boxes, 
  session,
  onWhatsAppShare 
}: ReceiptPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'ticket' | 'pdf'>('ticket');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate a memory-safe Blob URL for live PDF preview
      const url = generateClientReceiptPdfBlobUrl(client, boxes, session);
      setPdfUrl(url);
      
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [isOpen, client, boxes, session]);

  if (!isOpen) return null;

  const totalMonto = boxes.reduce((acc, box) => acc + box.precio, 0);
  const receiptNo = `OE-TX-${client.id.replace('c-', '').toUpperCase().slice(0, 8)}`;
  const dateStr = new Date().toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownload = () => {
    generateClientReceiptPDF(client, boxes, session);
  };

  const handleCopyReceiptText = () => {
    let boxesText = '';
    boxes.forEach((b, i) => {
      boxesText += `• Caja ${b.tamano.toUpperCase()} (${b.etiquetaBarra})${b.categoria ? ' - ' + b.categoria : ''}: $${b.precio} USD\n`;
    });

    const summary = `*OLOMÁN EXPRESS - DETALLES DEL RECIBO*\n` +
      `No. Recibo: ${receiptNo}\n` +
      `Cliente: ${client.nombre}\n` +
      `Total: $${totalMonto.toFixed(2)} USD\n\n` +
      `Cajas Recogidas:\n${boxesText}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-100 flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header styling */}
        <div className="bg-[#002C54] text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-black text-[#FF6B00] bg-orange-950/40 px-2 py-0.5 rounded-full">
                Vista Previa Oficinal
              </span>
              <h2 className="text-sm font-black tracking-tight uppercase mt-0.5">Recibo {receiptNo}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
            id="close-preview-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch button control bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-2 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'ticket' 
                ? 'bg-white text-[#002C54] shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📱 Vista Ticket Digital
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'pdf' 
                ? 'bg-white text-[#002C54] shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📄 Vista Documento PDF
          </button>
        </div>

        {/* Main interactive screen frame */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/50 text-slate-850">
          {activeTab === 'ticket' ? (
            /* Tab 1: Virtual Invoice Slip Visual Layout */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 space-y-5 max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF6B00]"></div>
              
              {/* Fake thermal ticket header */}
              <div className="text-center space-y-1 pt-2">
                <span className="text-xl font-black text-[#002C54] tracking-tight block">OLOMÁN EXPRESS</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Envíos USA a Honduras • Confiable y Seguro
                </span>
                <div className="inline-block mt-3 bg-blue-50 text-[#002C54] text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                  CÓDIGO DE RUTA: {session.routeId}
                </div>
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-slate-300 my-2"></div>

              {/* Receipt metadata general information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Fecha de Emisión</span>
                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar size={12} className="text-[#FF6B00]" /> {dateStr}
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Forma de Pago</span>
                  <div className="flex justify-end mt-0.5">
                    <span className="bg-emerald-550 text-white font-extrabold text-[9px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <CreditCard size={10} /> {client.metodoPago || 'Zelle'}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 space-y-0.5 pt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Conductor Asignado</span>
                  <p className="font-semibold text-slate-700">{session.driverName} ({session.badgeCode})</p>
                </div>
              </div>

              {/* Sender & Recipient addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-[#002C54] tracking-wider block">Remitente (USA)</span>
                  <p className="text-xs font-black text-slate-800">{client.nombre}</p>
                  <p className="text-[11px] text-slate-500">Tel: {client.telefono}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{client.direccionUSA}</p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[9px] uppercase font-black text-[#FF6B00] tracking-wider block">Destinatario (HN)</span>
                  <p className="text-xs font-black text-slate-800">{client.nombre}</p>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Destino de Entrega:</span>
                    <p className="text-[#FF6B00] font-black">{client.destinoHonduras || 'Oficina Principal'}</p>
                  </div>
                </div>
              </div>

              {/* Items loaded table breakdown */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Cajas Registradas ({boxes.length})</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  {boxes.map((b, idx) => (
                    <div key={b.id} className="p-3 text-xs flex justify-between items-center gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-250 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">{idx + 1}</span>
                          <span className="font-black text-slate-800 tracking-wider">{b.etiquetaBarra}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Caja {b.tamano.toUpperCase()} {b.categoria && <span className="text-[#002C54] font-bold">({b.categoria})</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 italic font-mono truncate max-w-[240px]">"{b.notas || 'Sin notas descriptivas'}"</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-850 block">$ {b.precio.toFixed(2)} USD</span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase inline-block mt-0.5">{b.estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital receipt totals */}
              <div className="bg-[#002C54] text-white p-4 rounded-xl flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wide text-slate-300 font-black">Total de Envíos</span>
                  <p className="text-[11px] text-orange-200 font-medium">{boxes.length} Cajas cargadas</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wide text-orange-200 font-black block">Total Cobro Estimado:</span>
                  <span className="text-xl font-black text-[#FF6B00] tracking-tight">$ {totalMonto.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Cargo Seal Conformance View panel */}
              <div className="border border-slate-200 p-3 rounded-xl flex flex-col justify-center items-center relative min-h-[50px] bg-slate-50">
                <div className="flex flex-col items-center justify-center">
                  <ShieldCheck size={22} className="text-[#FF6B00]" />
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-widest mt-1">Verificación de Cargamento ✓</span>
                </div>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mt-1">Olomán Express Network</span>
              </div>
              
              <div className="text-center text-[9px] text-slate-400 pt-1 font-medium italic">
                “¡Gracias por elegir Olomán Express! Nos encargamos de que su envío llegue seguro.”
              </div>
            </div>
          ) : (
            /* Tab 2: Native PDF Iframe Preview */
            <div className="w-full flex flex-col space-y-4 h-full min-h-[480px]">
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl flex items-start gap-2.5 text-orange-850 text-xs">
                <ShieldCheck size={18} className="text-[#FF6B00] shrink-0 mt-0.5" />
                <p>
                  Esta es la de <strong>Vista Previa del Documento PDF Real</strong> generada dinámicamente con los estándares y firmas. Utilice los controles integrados para imprimir o descargar desde su explorador.
                </p>
              </div>
              
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-inner min-h-[440px]">
                {pdfUrl ? (
                  <iframe 
                    src={pdfUrl} 
                    className="w-full h-[440px] border-none block"
                    title="Previsualización de Recibo PDF"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                    Generando el documento de ruta, por favor espere...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action footer controls */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row gap-2.5 shrink-0 justify-end">
          <button
            onClick={handleCopyReceiptText}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              copied 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                : 'bg-white hover:bg-slate-100 text-slate-650 border-slate-250'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" /> Copiado!
              </>
            ) : (
              'Copiar Resumen Texto'
            )}
          </button>
          
          <button
            onClick={onWhatsAppShare}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <MessageCircle size={14} /> Compartir WhatsApp
          </button>
          
          <button
            onClick={handleDownload}
            className="py-2.5 px-5 bg-[#002C54] hover:bg-[#00213d] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Download size={14} /> Descargar PDF Oficial
          </button>
        </div>
      </motion.div>
    </div>
  );
}
