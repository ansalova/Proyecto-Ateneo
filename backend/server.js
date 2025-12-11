import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();

// Middlewares globales
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,POST,PUT,DELETE"
}));

app.use(express.json());
app.use(morgan("dev")); // ← muestra cada petición en consola (útil para debug)

// Rutas principales
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando correctamente ✔");
});

// Manejo básico de errores globales
app.use((err, req, res, next) => {
  console.error("🔥 Error en el servidor:", err);
  res.status(500).json({ msg: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
