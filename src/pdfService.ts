import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Client, Box, DriveSession } from './types';

// Generar el recibo oficial para un cliente individual
export const buildClientReceiptPDF = (client: Client, boxes: Box[], session: DriveSession): jsPDF => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

  // COLORES CORPORATIVOS
  const blueColor = [0, 44, 84];     // #002C54
  const orangeColor = [255, 107, 0]; // #FF6B00
  const darkGray = [26, 26, 26];

  // --- CABECERA ESTILO LOGÍSTICA PREMIUM ---
  // Franja decorativa superior
  doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.rect(0, 0, width, 12, 'F');
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(0, 12, width, 2, 'F');

  // Nombre de la Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('OLOMÁN EXPRESS', 15, 30);
  
  // Slogan & Info de Transferencia
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Envíos Exclusivos USA a Honduras • Confiable y Seguro', 15, 36);
  doc.text('Contacto: +1 (832) 396-2837 | info@olomanexpress.com', 15, 41);

  // LOGO "OE" Simulado con círculos naranjas
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.circle(width - 30, 31, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('OE', width - 30, 35, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text('RECIBO DE RECOLECCIÓN', width - 15, 48, { align: 'right' });
  
  const receiptNo = `OE-TX-${client.id.replace('c-', '').toUpperCase().slice(0, 8)}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text(`No. Recibo: ${receiptNo}`, width - 15, 53, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Código de Ruta: ${session.routeId}`, width - 15, 58, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Recolección: ${dateStr}`, width - 15, 62, { align: 'right' });
  doc.text(`Forma de Pago: ${client.metodoPago || 'Zelle / Efectivo'}`, width - 15, 66, { align: 'right' });
  doc.text(`Conductor: ${session.driverName} (${session.badgeCode})`, width - 15, 70, { align: 'right' });

  // --- INFORMACIÓN DE ENTREGA EN PARALELO ---
  // Dibujar contenedor para remitente/destinatario
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, 77, (width - 35) / 2, 40, 3, 3, 'F');
  doc.roundedRect(10 + (width / 2), 77, (width - 35) / 2, 40, 3, 3, 'F');

  // Remitente (USA)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('Remitente (USA)', 20, 84);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(client.nombre, 20, 90);
  doc.text(`Tel: ${client.telefono}`, 20, 95);
  
  // Ajustar dirección en caso de ser muy larga
  const origAddress = client.direccionUSA || '';
  const splitAddress = doc.splitTextToSize(origAddress, (width - 45) / 2);
  doc.text(splitAddress, 20, 100);

  // Destinatario (Honduras)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text('Destinatario / Entrega (Honduras)', 15 + (width / 2), 84);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(client.nombre, 15 + (width / 2), 90);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Lugar de Destino:', 15 + (width / 2), 95);
  doc.setFont('helvetica', 'normal');
  doc.text(client.destinoHonduras || 'Honduras - Oficina Principal', 15 + (width / 2), 100);

  // --- TABLA DE CAPTURA DE ENVÍOS (CAJAS RECOGIDAS) ---
  const tableBody = boxes.map((box, index) => [
    index + 1,
    box.etiquetaBarra,
    `${box.tamano.toUpperCase()}${box.categoria ? '\n(' + box.categoria + ')' : ''}`,
    box.notas || 'Sin notas del paquete',
    `$${box.precio.toFixed(2)}`,
    box.estado.toUpperCase()
  ]);

  (doc as any).autoTable({
    startY: 125,
    head: [['#', 'ETIQUETA / RASTREO', 'TAMAÑO / TIPO', 'INFORMACIÓN / CONTENIDO', 'TARIFA ($)', 'ESTADO']],
    body: tableBody,
    headStyles: {
      fillColor: blueColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkGray,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 32, halign: 'center' },
      3: { cellWidth: 60 },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'center' },
    },
    margin: { left: 15, right: 15 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 180;
  const totalCobro = boxes.reduce((acc, box) => acc + box.precio, 0);

  let currentY = finalY;
  // Margen de seguridad: si no quedan mínimo 65mm en la página, saltar para evitar traslape
  if (currentY + 65 > height) {
    doc.addPage();
    // Franja decorativa superior para página secundaria
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, width, 10, 'F');
    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.rect(0, 10, width, 1.5, 'F');
    currentY = 15;
  }

  // --- TOTALES Y RESUMEN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('Resumen de Cobro:', 15, currentY + 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Cantidad total de cajas: ${boxes.length}`, 15, currentY + 20);
  doc.text('Políticas de Garantía: El envío cubre transporte marítimo internacional.', 15, currentY + 25);
  doc.text('Los tiempos de entrega aproximados son de 15 a 21 días hábiles.', 15, currentY + 30);

  // Caja de Total
  doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.roundedRect(width - 80, currentY + 10, 65, 25, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL A COBRAR:', width - 75, currentY + 18);
  doc.setFontSize(16);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text(`$ ${totalCobro.toFixed(2)} USD`, width - 75, currentY + 28);

  // Sello Oficial de Despacho y Recolección
  doc.setDrawColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, height - 48, 60, 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text('CARGA VERIFICADA', 50, height - 41, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Olomán Express Logistics Network', 50, height - 36, { align: 'center' });

  // Línea de firma del transportador
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.2);
  doc.line(width - 80, height - 35, width - 20, height - 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Firma Transportador / Ruta', width - 50, height - 30, { align: 'center' });

  // Pie de página comercial
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('¡Gracias por confiar en Olomán Express! Tu carga en las mejores manos.', width / 2, height - 12, { align: 'center' });

  return doc;
};

export const generateClientReceiptPDF = (client: Client, boxes: Box[], session: DriveSession) => {
  const doc = buildClientReceiptPDF(client, boxes, session);
  doc.save(`Recibo_Oloman_${client.nombre.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

export const generateClientReceiptPdfBlobUrl = (client: Client, boxes: Box[], session: DriveSession): string => {
  const doc = buildClientReceiptPDF(client, boxes, session);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
};

// Generar el manifiesto general de ruta para el conductor
export const generateRouteManifestPDF = (clients: Client[], boxes: Box[], session: DriveSession) => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

  const blueColor = [0, 44, 84];     // #002C54
  const orangeColor = [255, 107, 0]; // #FF6B00
  const darkGray = [26, 26, 26];

  // Decoraciones corporativas
  doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.rect(0, 0, width, 14, 'F');
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(0, 14, width, 2, 'F');

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('OLOMÁN EXPRESS LOGISTICS', 15, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text('MANIFIESTO DIARIO DE RUTA Y RECOGIDAS', 15, 36);

  // Datos en la cabecera
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA RUTA:', 15, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`Identificador: ${session.routeId}`, 15, 54);
  doc.text(`Nombre de Ruta: ${session.routeName}`, 15, 59);
  doc.text(`Conductor Asignado: ${session.driverName}`, 15, 64);
  doc.text(`Identificación: ${session.badgeCode}`, 15, 69);

  // Panel derecho de datos
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE CARGA:', width - 85, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Emisión: ${dateStr}`, width - 85, 54);
  doc.text(`Clientes en Ruta: ${clients.length}`, width - 85, 59);
  doc.text(`Total Cajas Recogidas: ${boxes.length}`, width - 85, 64);
  
  const totalMonto = boxes.reduce((acc, box) => acc + box.precio, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Monto Estimado Cobro Total: $ ${totalMonto.toFixed(2)} USD`, width - 85, 69);

  // Tabla con desglose para Bodega de Recepción
  const tableData = boxes.map((box, idx) => {
    const owner = clients.find(c => c.id === box.clientId);
    return [
      idx + 1,
      box.etiquetaBarra,
      owner ? owner.nombre : 'Cliente Desconocido',
      owner ? owner.destinoHonduras : 'N/A',
      box.tamano.toUpperCase(),
      `$${box.precio.toFixed(2)}`,
      box.estado.toUpperCase()
    ];
  });

  (doc as any).autoTable({
    startY: 80,
    head: [['#', 'ETIQUETA', 'CLIENTE / REMITENTE', 'DESTINO HONDURAS', 'TAMAÑO', 'MONTO ($)', 'ESTADO']],
    body: tableData,
    headStyles: {
      fillColor: blueColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkGray
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Firmas de Verificación de Carga en Bodega
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Firmas de Entrega en Bodega:', 15, finalY + 15);
  
  doc.line(20, height - 35, 75, height - 35);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma Despachador (Conductor)', 47, height - 30, { align: 'center' });

  doc.line(width - 75, height - 35, width - 20, height - 35);
  doc.text('Firma Supervisor de Bodega', width - 47, height - 30, { align: 'center' });

  // Pie de página comercial
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Olomán Express Logistics system - Texas, USA / Yoro, Honduras.', width / 2, height - 12, { align: 'center' });

  doc.save(`Manifiesto_Ruta_${session.routeId}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
