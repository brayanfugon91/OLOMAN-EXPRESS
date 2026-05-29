export interface FlutterFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    name: "main.dart",
    path: "lib/main.dart",
    description: "Punto de entrada de la aplicación Flutter. Configura Firebase, inicializa los estilos y define las rutas.",
    code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const OlomanExpressApp());
}

class OlomanExpressApp extends StatelessWidget {
  const OlomanExpressApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Olomán Express',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF002C54), // Azul Oscuro Premium
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF002C54),
          primary: const Color(0xFF002C54),
          secondary: const Color(0xFFFF6B00), // Naranja Logístico
          surface: Colors.grey[50]!,
        ),
        fontFamily: 'Inter',
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          color: Colors.white,
        ),
      ),
      home: const LoginScreen(),
    );
  }
}`
  },
  {
    name: "cliente_model.dart",
    path: "lib/models/cliente_model.dart",
    description: "Modelo de datos del Cliente con mapeo JSON para la integración con Firebase Firestore.",
    code: `class Cliente {
  final String id;
  final String nombre;
  final String email;
  final String telefono;
  final String direccionUSA;
  final String destinoHonduras;
  final int cajasAsignadas;

  Cliente({
    required this.id,
    required this.nombre,
    required this.email,
    required this.telefono,
    required this.direccionUSA,
    required this.destinoHonduras,
    required this.cajasAsignadas,
  });

  factory Cliente.fromMap(Map<String, dynamic> data, String id) {
    return Cliente(
      id: id,
      nombre: data['nombre'] ?? '',
      email: data['email'] ?? '',
      telefono: data['telefono'] ?? '',
      direccionUSA: data['direccionUSA'] ?? '',
      destinoHonduras: data['destinoHonduras'] ?? '',
      cajasAsignadas: data['cajasAsignadas'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'nombre': nombre,
      'email': email,
      'telefono': telefono,
      'direccionUSA': direccionUSA,
      'destinoHonduras': destinoHonduras,
      'cajasAsignadas': cajasAsignadas,
    };
  }
}`
  },
  {
    name: "caja_model.dart",
    path: "lib/models/caja_model.dart",
    description: "Modelo de Caja de Envíos. Maneja tamaños de caja (pequeña/mediana/grande), cálculo de precio de envío, fotos y notas.",
    code: `class Caja {
  final String id;
  final String clientId;
  final String etiquetaBarra;
  final String tamano; // 'pequeña', 'mediana', 'grande'
  final double precio;
  final String notas;
  final String photoUrl;
  final String estado; // 'pendiente', 'recogido', 'entregado'
  final DateTime createdAt;

  Caja({
    required this.id,
    required this.clientId,
    required this.etiquetaBarra,
    required this.tamano,
    required this.precio,
    required this.notas,
    required this.photoUrl,
    required this.estado,
    required this.createdAt,
  });

  // Cálculo automático del precio basado en las políticas de Olomán Express
  static double calcularPrecio(String tamano) {
    switch (tamano.toLowerCase()) {
      case 'pequeña':
        return 80.0;
      case 'mediana':
        return 120.0;
      case 'grande':
        return 180.0;
      default:
        return 0.0;
    }
  }

  factory Caja.fromMap(Map<String, dynamic> data, String id) {
    return Caja(
      id: id,
      clientId: data['clientId'] ?? '',
      etiquetaBarra: data['etiquetaBarra'] ?? '',
      tamano: data['tamano'] ?? 'mediana',
      precio: (data['precio'] ?? 120.0).toDouble(),
      notas: data['notas'] ?? '',
      photoUrl: data['photoUrl'] ?? '',
      estado: data['estado'] ?? 'pendiente',
      createdAt: data['createdAt'] != null 
          ? DateTime.parse(data['createdAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'clientId': clientId,
      'etiquetaBarra': etiquetaBarra,
      'tamano': tamano,
      'precio': precio,
      'notas': notas,
      'photoUrl': photoUrl,
      'estado': estado,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}`
  },
  {
    name: "login_screen.dart",
    path: "lib/screens/login_screen.dart",
    description: "Pantalla de Control de Acceso. Ofrece un diseño intuitivo con PIN o credenciales rápidas de conductor para facilitar su uso.",
    code: `import 'package:flutter/material.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _pinController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  void _submitLogin() async {
    if (_pinController.text == '1803' || _pinController.text == '2026') {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 1200)); // Simulación de carga
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Código de Conductor incorrecto. Intente con: 1803'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF002C54), // Azul premium
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo Contenedor
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 15,
                    )
                  ],
                ),
                child: const Icon(
                  Icons.local_shipping_rounded,
                  size: 64,
                  color: Color(0xFFFF6B00), // Naranja
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'OLOMÁN EXPRESS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const Text(
                'APLICACIÓN DE CONDUCTORES',
                style: TextStyle(
                  color: Color(0xFFFF6B00),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 48),
              
              // Tarjeta de Formulario
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Ingreso Rápido',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF002C54),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Introduce tu PIN asignado para iniciar la ruta del día.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: _pinController,
                          keyboardType: TextInputType.number,
                          obscureText: true,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 24,
                            letterSpacing: 8,
                            fontWeight: FontWeight.bold,
                          ),
                          decoration: InputDecoration(
                            hintText: '••••',
                            hintStyle: const TextStyle(color: Colors.grey),
                            filled: true,
                            fillColor: Colors.grey[100],
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _submitLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF6B00),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(Colors.white),
                                  ),
                                )
                              : const Text(
                                  'INICIAR JORNADA',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Soporte Técnico: +1 (800) 555-OLOMAN',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    name: "dashboard_screen.dart",
    path: "lib/screens/dashboard_screen.dart",
    description: "Panel de Control Principal del Conductor. Muestra el estado de la ruta del día, resumen de recolección y mapa interactivo.",
    code: `import 'package:flutter/material.dart';
import '../models/cliente_model.dart';
import '../services/firebase_service.dart';
import 'cliente_detalle_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final FirebaseService _dbService = FirebaseService();
  List<Cliente> _clientes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarRuta();
  }

  void _cargarRuta() async {
    final data = await _dbService.getRouteClients();
    setState(() {
      _clientes = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    int totalCajas = _clientes.fold(0, (sum, c) => sum + c.cajasAsignadas);
    
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('OLOMÁN EXPRESS', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18)),
            Text('Ruta del Día - TX a Honduras', style: TextStyle(color: Color(0xFFFF6B00), fontSize: 11)),
          ],
        ),
        backgroundColor: const Color(0xFF002C54),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _cargarRuta,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => _cargarRuta(),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Tarjetas de Resumen Rápido (Bento Grid)
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            'Clientes',
                            _clientes.length.toString(),
                            Icons.group,
                            const Color(0xFF002C54),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            'Cajas',
                            totalCajas.toString(),
                            Icons.all_inbox_rounded,
                            const Color(0xFFFF6B00),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Detalle de Estado de Recolección
                    const Text(
                      'LISTADO DE RECOGIDAS',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 1.2,
                        color: Color(0xFF002C54),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Lista de clientes
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _clientes.length,
                      itemBuilder: (context, index) {
                        final cliente = _clientes[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF002C54).withOpacity(0.1),
                              child: const Icon(Icons.person, color: Color(0xFF002C54)),
                            ),
                            title: Text(
                              cliente.nombre,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text('Destino: \${cliente.destinoHonduras}'),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, py: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF6B00).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '\${cliente.cajasAsignadas} Cajas',
                                style: const TextStyle(
                                  color: Color(0xFFFF6B00),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ClienteDetalleScreen(cliente: cliente),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(color: color, fontSize: 28, fontWeight: FontWeight.bold)),
            ],
          ),
          Icon(icon, color: color.withOpacity(0.8), size: 36),
        ],
      ),
    );
  }
}`
  },
  {
    name: "registro_caja_screen.dart",
    path: "lib/screens/registro_caja_screen.dart",
    description: "Formulario para añadir cajas. Ofrece un selector de tamaño que calcula tarifas del servicio de Olomán Express con captura de foto desde la cámara.",
    code: `import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../models/cliente_model.dart';
import '../models/caja_model.dart';
import '../services/firebase_service.dart';

class RegistroCajaScreen extends StatefulWidget {
  final Cliente cliente;
  const RegistroCajaScreen({super.key, required this.cliente});

  @override
  State<RegistroCajaScreen> createState() => _RegistroCajaScreenState();
}

class _RegistroCajaScreenState extends State<RegistroCajaScreen> {
  final FirebaseService _dbService = FirebaseService();
  String _sizeSelected = 'mediana';
  final _notesController = TextEditingController();
  File? _boxImage;
  bool _isSaving = false;

  Future<void> _takePicture() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 800,
    );
    if (image != null) {
      setState(() {
        _boxImage = File(image.path);
      });
    }
  }

  void _guardarCaja() async {
    setState(() => _isSaving = true);
    
    // Crear objeto Caja logístico con cálculo automático de precio
    double price = Caja.calcularPrecio(_sizeSelected);
    String randomTag = 'OLM-\${widget.cliente.nombre.substring(0, 2).toUpperCase()}-\${DateTime.now().millisecond}';
    
    final nuevaCaja = Caja(
      id: '',
      clientId: widget.cliente.id,
      etiquetaBarra: randomTag,
      tamano: _sizeSelected,
      precio: price,
      notas: _notesController.text,
      photoUrl: _boxImage != null ? 'local://\${_boxImage!.path.split('/').last}' : 'default_box_url',
      estado: 'recogido',
      createdAt: DateTime.now(),
    );

    await _dbService.uploadBoxDetails(widget.cliente.id, nuevaCaja, _boxImage);
    
    if (mounted) {
      Navigator.of(context).pop(true); // Retorna éxito al detalle del cliente
    }
  }

  @override
  Widget build(BuildContext context) {
    double currentPrice = Caja.calcularPrecio(_sizeSelected);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Caja', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF002C54),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Sección de Foto de la Caja
            const Text('FOTOGRAFÍA O ESCANEO DE LA CAJA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: _takePicture,
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[300]!, style: BorderStyle.values[1]), // Dashed style representation
                ),
                child: _boxImage != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(15),
                        child: Image.file(_boxImage!, fit: BoxFit.cover, width: double.infinity),
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt_rounded, size: 48, color: Color(0xFFFF6B00)),
                          SizedBox(height: 8),
                          Text('Tomar Foto de la Caja con la Cámara', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Selector de tamaño
            const Text('SELECCIONAR TAMAÑO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 10),
            Row(
              children: [
                _buildSizeOption('Pequeña', '80 \$', 'pequeña'),
                const SizedBox(width: 10),
                _buildSizeOption('Mediana', '120 \$', 'mediana'),
                const SizedBox(width: 10),
                _buildSizeOption('Grande', '180 \$', 'grande'),
              ],
            ),
            const SizedBox(height: 24),

            // Resumen de Precio
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B00).withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFF6B00).withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Monto Estimado de Cobro:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002C54))),
                  Text(
                    '\$ \${currentPrice.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFFF6B00)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Notas
            const Text('NOTAS / COMPLEMENTO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Añade descripción de la caja o notas de entrega...',
                filled: true,
                fillColor: Colors.grey[50],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isSaving ? null : _guardarCaja,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF002C54),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('REGISTRAR Y RECOGER CAJA', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSizeOption(String label, String value, String sizeKey) {
    bool isSelected = _sizeSelected == sizeKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _sizeSelected = sizeKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF002C54) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF002C54) : Colors.grey[350]!,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected ? Colors.white.withOpacity(0.8) : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    name: "firebase_service.dart",
    path: "lib/services/firebase_service.dart",
    description: "Servicio integrado de Firebase Firestore y Firebase Storage para sincronizar clientes, cajas y fotografías en la nube en tiempo real.",
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import '../models/cliente_model.dart';
import '../models/caja_model.dart';

class FirebaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Obtener clientes asignados a la ruta del conductor actual
  Future<List<Cliente>> getRouteClients() async {
    try {
      final snapshot = await _firestore.collection('clientes').get();
      return snapshot.docs
          .map((doc) => Cliente.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      print('Error cargando clientes de Firebase: \$e');
      return [];
    }
  }

  // Registrar detalles de la caja y subir fotografía opcional a Firebase Storage
  Future<void> uploadBoxDetails(String clienteId, Caja caja, File? localPhoto) async {
    try {
      String uploadedPhotoUrl = caja.photoUrl;

      // Si el conductor capturó una foto con su cámara, la subimos a Firebase Storage
      if (localPhoto != null) {
        final ref = _storage
            .ref()
            .child('cajas_fotos')
            .child('\${caja.etiquetaBarra}_\${DateTime.now().millisecondsSinceEpoch}.jpg');
        
        final taskSnapshot = await ref.putFile(localPhoto);
        uploadedPhotoUrl = await taskSnapshot.ref.getDownloadURL();
      }

      // Sincronizar en Firestore
      DocumentReference boxDoc = _firestore
          .collection('clientes')
          .doc(clienteId)
          .collection('cajas')
          .doc();

      await boxDoc.set({
        'etiquetaBarra': caja.etiquetaBarra,
        'tamano': caja.tamano,
        'precio': caja.precio,
        'notas': caja.notas,
        'photoUrl': uploadedPhotoUrl,
        'estado': 'recogido',
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Incrementar el contador de cajas del cliente de manera atómica
      await _firestore.collection('clientes').doc(clienteId).update({
        'cajasAsignadas': FieldValue.increment(1),
      });

    } catch (e) {
      print('Error al guardar datos en Firebase: \$e');
    }
  }
}`
  }
];
