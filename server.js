import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import passport from "passport";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

import { SECRET_KEY, DB_URL, APP_URL, CLIENT_URL } from "./src/config/index.config.js";
import initializePassport from "./src/config/passport.config.js";
import addLogger from "./src/utils/logger.js";
import errorHandler from "./src/middlewares/errors/index.js";
import { authMiddleware } from "./src/middlewares/index.js";
import demoMode from "./src/middlewares/demoMode.js";

import authRouter from "./src/routes/auth.js";
import productsRouter from "./src/routes/products.js";
import cartsRouter from "./src/routes/carts.js";
import mockRouter from "./src/routes/mockingProducts.js";
import guestRouter from "./src/routes/guest.js";
import conciergeRouter from "./src/routes/concierge.js";
import { getPublicKey } from "./src/controllers/stripeManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ── Trust proxy (Render / Vercel / Railway) ────────────────
app.set('trust proxy', 1);

// ── Seguridad HTTP headers ─────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// ── Rate limiting ──────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Demasiados intentos. Esperá 15 minutos." },
});
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Demasiadas solicitudes. Esperá una hora." },
});
const cartCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Demasiadas solicitudes." },
});
const conciergeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Demasiados mensajes. Esperá un momento antes de continuar." },
});
app.use("/auth/login", loginLimiter);
app.use("/auth/sendTokenToEmail", emailLimiter);

// ── Base de datos ──────────────────────────────────────────
mongoose.connect(DB_URL);
mongoose.connection.once("open", () => console.log("✓ Conectado a MongoDB"));
mongoose.connection.on("error", (err) => console.error("✗ MongoDB error:", err));

// ── Sesión ─────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DB_URL }),
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    },
  })
);

// ── Passport ───────────────────────────────────────────────
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// ── Body parsers ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── NoSQL injection sanitization ───────────────────────────
app.use(mongoSanitize());

// ── Logger ────────────────────────────────────────────────
app.use(addLogger);

// ── Demo mode (bloquea mutaciones en entorno de muestra) ───
app.use(demoMode);

// ── API routes ─────────────────────────────────────────────
app.use("/auth", authRouter);
app.use("/api/products", productsRouter);
app.post("/api/carts", cartCreateLimiter);
app.use("/api/carts", authMiddleware, cartsRouter);
app.use("/api/guest", guestRouter);
app.use("/api/concierge", conciergeLimiter, conciergeRouter);
// Mock data route — disabled in production
if (process.env.NODE_ENV !== 'production') {
  app.use("/api/mockingProducts", mockRouter);
}
app.get("/publicKey", getPublicKey);

// ── Swagger docs ───────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Folio — API Reference",
      version: "1.0.0",
      description:
        "Documentación completa de la API REST de Folio, una tienda de libros en línea. " +
        "Incluye autenticación por sesión (cookie), gestión de productos, carritos, pagos con Stripe y tickets de compra. " +
        "Todas las rutas protegidas requieren una sesión activa (iniciar sesión primero).",
      contact: {
        name: "Folio — Panel Admin",
        url: "/admin",
      },
    },
    tags: [
      { name: "Autenticación", description: "Login, registro, OAuth y recuperación de contraseña" },
      { name: "Productos", description: "Catálogo de libros — listado, detalle, creación y gestión" },
      { name: "Carritos", description: "Gestión del carrito, checkout y proceso de pago (Stripe)" },
      { name: "Tickets", description: "Historial de compras completadas" },
      { name: "Admin", description: "Panel de administración — usuarios, roles y reportes" },
      { name: "Invitado", description: "Checkout sin cuenta — Stripe + idempotencia" },
    ],
  },
  apis: [`${__dirname}/src/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// ── Serve React (producción) ───────────────────────────────
const clientDist = path.join(__dirname, "client", "dist");
app.use(express.static(clientDist));

// Cualquier ruta no-API devuelve el index.html de React
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// ── Error handler (debe ir después de todas las rutas) ────
app.use(errorHandler);

export default app;
