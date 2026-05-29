export interface Client {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccionUSA: string;
  destinoHonduras: string;
  cajasAsignadas: number;
  firmaUrl?: string; // Digital signature base64 drawing
  metodoPago?: 'Zelle' | 'Efectivo USA' | 'Efectivo Honduras' | 'Pendiente';
}

export interface Box {
  id: string;
  clientId: string;
  etiquetaBarra: string; // e.g. OLM-10023
  tamano: 'pequeña' | 'mediana' | 'grande';
  precio: number;
  notas: string;
  photoUrl: string; // base64 photo captured or custom box stock image
  estado: 'pendiente' | 'recogido' | 'entregado en bodega';
  createdAt: string;
  categoria?: 'Ropa y Calzado' | 'Herramientas' | 'Electrónicos' | 'Repuestos' | 'Medicinas/Alimento' | 'Varios';
}

export interface DriveSession {
  driverName: string;
  badgeCode: string;
  routeId: string;
  routeName: string;
}
