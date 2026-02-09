import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// CORS configuration from environment
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  frontendUrl,
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,PUT,DELETE"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para webhooks
app.use(morgan("dev"));
app.set("etag", false);

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => res.json({ status: 'ok', msg: "API funcionando correctamente ✔" }));
app.get("/api/health", (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error("🔥 Error en el servidor:", err);
  res.status(err.statusCode || 500).json({ 
    msg: process.env.NODE_ENV === 'production' ? "Error interno del servidor" : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
