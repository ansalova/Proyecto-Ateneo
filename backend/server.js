import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: "GET,POST,PUT,DELETE"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para webhooks
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/teacher", teacherRoutes);

app.get("/", (req, res) => res.send("API funcionando correctamente ✔"));

app.use((err, req, res, next) => {
  console.error("🔥 Error en el servidor:", err);
  res.status(500).json({ msg: "Error interno del servidor" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
