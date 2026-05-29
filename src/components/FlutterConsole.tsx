import React, { useState } from 'react';
import { FLUTTER_CODEBASE, FlutterFile } from '../flutterCode';
import { FileCode, FolderOpen, ChevronRight, Copy, Check, Download, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export default function FlutterConsole() {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownloadFile = (file: FlutterFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  };

  const handleDownloadProject = () => {
    // Generate a single composite script download or bulk instruction download
    const documentation = `========================================================================
     OLOMÁN EXPRESS DRIVER FLUTTER APP - INSTRUCCIONES DE MONTAJE
========================================================================

Este es el proyecto base solicitado para el sistema de recogida de encomiendas
de USA a Honduras, estructurado profesionalmente.

ESTRUCTURA DE ARCHIVOS INCORPORADA:
${FLUTTER_CODEBASE.map(f => ` - ${f.path} : ${f.description}`).join('\n')}

========================================================================
PASOS PARA DESPLEGAR EL PROYECTO LOCALMENTE:

1. REQUISITOS PREVIOS:
   - Instalar Flutter SDK (versión 3.19 o superior recomendada).
   - Tener un emulador de iOS/Android o dispositivo físico conectado.
   - Cuenta de Firebase Console activa.

2. CREAR PROYECTO FLUTTER:
   Abra su terminal y ejecute:
   $ flutter create --org com.olomanexpress oloman_express_driver
   $ cd oloman_express_driver

3. AGREGAR DEPENDENCIAS:
   Instale los paquetes imprescindibles agregándolos a su pubspec.yaml:
   $ flutter pub add firebase_core cloud_firestore firebase_storage image_picker intl

4. REEMPLAZAR CÓDIGOS:
   Reemplace los archivos generados con los códigos provistos en esta consola
   respetando las ubicaciones de carpeta (lib/models, lib/screens, lib/services).

5. CONFIGURACIÓN DE FIREBASE (CRITICAL):
   Ejecute FlutterFire CLI para enlazar su base de datos Firestore y Storage:
   $ flutterfire configure
   Esto creará automáticamente el archivo lib/firebase_options.dart.

6. EJECUTAR APP:
   $ flutter run

Disfrute de la experiencia Olomán Express con interfaz premium de alto rendimiento.
`;

    const blob = new Blob([documentation], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'INSTRUCCIONES_FLUTTER_OLOMAN.txt';
    document.body.appendChild(link);
    link.click();
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-800">
      
      {/* Columna Izquierda: Arquitectura de Carpetas & Archivos */}
      <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-[700px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <FolderOpen size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#002C54]">Estructura de Carpetas</h3>
            <p className="text-[10px] text-slate-400 font-medium">Arquitectura Flutter / Dart 3</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
          
          {/* Carpeta Raíz */}
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <FolderOpen size={14} className="text-[#002C54]" />
            <span>oloman_express_app/</span>
          </div>

          <div className="pl-4 border-l border-slate-200 space-y-2.5">
            {/* Carpeta lib */}
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <FolderOpen size={14} className="text-[#FF6B00]" />
              <span>lib/</span>
            </div>

            <div className="pl-4 border-l border-slate-200 space-y-3">
              {/* main.dart */}
              <button
                onClick={() => setSelectedFile(FLUTTER_CODEBASE.find(f => f.name === 'main.dart')!)}
                className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg transition-all ${
                  selectedFile.name === 'main.dart' ? 'bg-[#002C54] text-white font-bold' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileCode size={13} className={selectedFile.name === 'main.dart' ? 'text-white' : 'text-[#FF6B00]'} />
                  main.dart
                </span>
                <ChevronRight size={12} className="opacity-50" />
              </button>

              {/* Carpeta models */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider pl-1 py-1">
                  <span>📂 models/</span>
                </div>
                <div className="pl-2 space-y-1">
                  {FLUTTER_CODEBASE.filter(f => f.path.includes('/models/')).map(file => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg transition-all ${
                        selectedFile.name === file.name ? 'bg-[#002C54] text-white font-bold' : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <FileCode size={12} className={selectedFile.name === file.name ? 'text-white' : 'text-slate-400'} />
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carpeta screens */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider pl-1 py-1">
                  <span>📂 screens/</span>
                </div>
                <div className="pl-2 space-y-1">
                  {FLUTTER_CODEBASE.filter(f => f.path.includes('/screens/')).map(file => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg transition-all ${
                        selectedFile.name === file.name ? 'bg-[#002C54] text-white font-bold' : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <FileCode size={12} className={selectedFile.name === file.name ? 'text-white' : 'text-slate-400'} />
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carpeta services */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider pl-1 py-1">
                  <span>📂 services/</span>
                </div>
                <div className="pl-2 space-y-1">
                  {FLUTTER_CODEBASE.filter(f => f.path.includes('/services/')).map(file => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg transition-all ${
                        selectedFile.name === file.name ? 'bg-[#002C54] text-white font-bold' : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <FileCode size={12} className={selectedFile.name === file.name ? 'text-white' : 'text-slate-400'} />
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Instrucciones de Descarga */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleDownloadProject}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-2xl text-xs font-bold transition shadow-md shadow-orange-500/10 active:scale-95"
          >
            <Download size={15} />
            Descargar Instrucciones de Montaje
          </button>
        </div>
      </div>

      {/* Columna Derecha: Visor de Código & Info de Firebase */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Descripción de Rol de Archivo */}
        <div className="bg-gradient-to-r from-[#002C54] to-[#003c73] text-white rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#FF6B00] bg-white/10 px-2 py-0.5 rounded-full inline-block mb-2">
                {selectedFile.path}
              </span>
              <h3 className="text-lg font-bold tracking-tight">{selectedFile.name}</h3>
              <p className="text-xs text-white/70 mt-1">{selectedFile.description}</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleCopy(selectedFile.code)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold select-none transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? '¡Copiado!' : 'Copiar Código'}
              </button>
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-semibold transition"
              >
                <Download size={14} />
                Guardar .dart
              </button>
            </div>
          </div>
        </div>

        {/* Código Editor de Solo Lectura */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-800 flex-1 h-[450px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs font-mono text-slate-500">
            <span>Editor Flutter Dart V3</span>
            <span className="text-[10px] text-slate-600">UTF-8 • Dart-SDK</span>
          </div>
          
          <div className="flex-1 overflow-auto">
            <pre className="font-mono text-xs text-slate-100 p-2 leading-relaxed select-all">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>

        {/* Integración con Firebase / Google Maps Checklist */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#002C54] uppercase tracking-wide">Esquema Firebase Firestore</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                La base de datos estructurada almacena la colección <code className="bg-slate-100 px-1 py-0.5 rounded text-[#FF6B00] font-bold">/clientes</code> y la sub-colección <code className="bg-slate-100 px-1 py-0.5 rounded text-[#002C54] font-bold">/cajas</code> vinculadas atómicamente incrementando con <code className="font-bold">FieldValue.increment()</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#002C54] uppercase tracking-wide">Pasarela de Maps e Image Recog</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                Inicializa la cámara local con <code className="font-bold">image_picker</code> guardando en Firebase Storage. Abre navegación GPS mediante esquemas URIs nativos (<code className="font-bold text-sky-600">geo:</code> o <code className="font-bold text-sky-600">google.navigation:</code>).
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
