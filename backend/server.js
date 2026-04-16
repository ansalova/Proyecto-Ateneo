import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import "./utils/mailer.js"; // Forzar carga del mailer para ver el estado al iniciar

dotenv.config();
connectDB();

const app = express();

// CORS configuration: in production use configured origins, in dev allow localhost origins
const frontendUrl = process.env.FRONTEND_URL || 'https://colegio-ateneo-frontend.onrender.com';
const extraOrigins = process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',').map(o => o.trim()) : [];

if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = [frontendUrl, ...extraOrigins];
  app.use(cors({ origin: allowedOrigins, credentials: true, methods: 'GET,POST,PUT,PATCH,DELETE' }));
} else {
  // Desarrollo: permitir requests desde cualquier localhost origin (5173, 5174, etc.)
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const u = new URL(origin);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return callback(null, true);
      } catch (e) {
        // permitir si no podemos parsear
        return callback(null, true);
      }
      // Fallback a las origins configuradas
      const allowed = [frontendUrl, ...extraOrigins];
      callback(allowed.includes(origin) ? null : new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,POST,PUT,PATCH,DELETE'
  }));
}
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Para webhooks con archivos
app.use(morgan("dev"));
app.set("etag", false);

// Configurar carpeta pública para archivos subidos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// La carpeta uploads está en backend/public/uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Crear carpeta si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Carpeta de uploads creada:', uploadsDir);
} else {
  console.log('✅ Carpeta de uploads encontrada:', uploadsDir);
}

console.log('🔗 Sirviendo /uploads desde:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => res.json({ status: 'ok', msg: "API funcionando correctamente ✔" }));
app.get("/api/health", (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get("/health", (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando 🚀' });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error en el servidor:", err);
  res.status(err.statusCode || 500).json({ 
    msg: process.env.NODE_ENV === 'production' ? "Error interno del servidor" : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
