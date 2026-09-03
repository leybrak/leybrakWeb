require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const leadsRouter       = require('./routes/leads.routes');
const authRouter        = require('./routes/auth.routes');
const productsRouter    = require('./routes/products.routes');
const settingsRouter    = require('./routes/settings.routes');
const plansRouter       = require('./routes/plans.routes');
const servicesRouter    = require('./routes/services.routes');
const aboutValuesRouter = require('./routes/aboutValues.routes');
const manifestoRouter   = require('./routes/manifesto.routes');
const saasStepsRouter   = require('./routes/saasSteps.routes');
const customStepsRouter = require('./routes/customSteps.routes');
const problemCardsRouter = require('./routes/problemCards.routes');
const teamMembersRouter  = require('./routes/teamMembers.routes');
const founderExperienceRouter     = require('./routes/founderExperience.routes');
const founderProjectsRouter       = require('./routes/founderProjects.routes');
const founderCertificationsRouter = require('./routes/founderCertifications.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Confía en el primer proxy (nginx-proxy-manager) para leer X-Forwarded-For
// correctamente — sin esto, express-rate-limit rechaza las peticiones reales.
app.set('trust proxy', 1);

// ── Seguridad básica ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — solo permite peticiones desde el frontend ─────────────────────────
app.use(cors({
  origin:      process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: false,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Rate limiting — protección básica contra abuso ───────────────────────────
// El panel admin hace varias peticiones por pestaña (productos, planes,
// servicios, configuración...), así que el límite general tiene que ser
// generoso; el login tiene su propio límite más estricto aparte.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message:  { ok: false, message: 'Demasiadas solicitudes. Intenta en unos minutos.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/', limiter);

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/leads',        leadsRouter);
app.use('/api/auth',         authRouter);
app.use('/api/products',     productsRouter);
app.use('/api/settings',     settingsRouter);
app.use('/api/plans',        plansRouter);
app.use('/api/services',     servicesRouter);
app.use('/api/about-values', aboutValuesRouter);
app.use('/api/manifesto',    manifestoRouter);
app.use('/api/saas-steps',   saasStepsRouter);
app.use('/api/custom-steps', customStepsRouter);
app.use('/api/problem-cards', problemCardsRouter);
app.use('/api/team-members',  teamMembersRouter);
app.use('/api/founder-experience',     founderExperienceRouter);
app.use('/api/founder-projects',       founderProjectsRouter);
app.use('/api/founder-certifications', founderCertificationsRouter);

// Health check — útil para saber si el servidor está vivo desde el VPS
app.get('/health', (_, res) => {
  res.json({ ok: true, status: 'online', timestamp: new Date().toISOString() });
});

// 404 para rutas no definidas
app.use((_, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada.' });
});

// Error handler global
app.use((err, _, res, __) => {
  console.error('❌ Error no manejado:', err.message);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

// ── Arrancar ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Leybrak API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
});
