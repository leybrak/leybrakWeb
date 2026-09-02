const bcrypt = require('bcryptjs');
const pool = require('./pool');

const createTables = async () => {
  const query = `
    -- Extensión para UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Tabla principal de leads (solicitudes del formulario y WhatsApp)
    CREATE TABLE IF NOT EXISTS leads (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      nombre        VARCHAR(120) NOT NULL,
      telefono      VARCHAR(20)  NOT NULL,
      servicio      VARCHAR(80),        -- 'saas', 'custom', 'data_vision', 'general'
      origen        VARCHAR(30)  NOT NULL DEFAULT 'formulario', -- 'formulario' | 'whatsapp'
      mensaje       TEXT,               -- campo libre opcional
      estado        VARCHAR(20)  NOT NULL DEFAULT 'nuevo',  -- 'nuevo' | 'contactado' | 'cerrado'
      ip_origen     VARCHAR(45),        -- para detección de spam
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    -- Índices útiles para filtrar y ordenar en el panel admin
    CREATE INDEX IF NOT EXISTS idx_leads_estado     ON leads(estado);
    CREATE INDEX IF NOT EXISTS idx_leads_servicio   ON leads(servicio);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

    -- Trigger para actualizar updated_at automáticamente
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS leads_updated_at ON leads;
    CREATE TRIGGER leads_updated_at
      BEFORE UPDATE ON leads
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Usuario admin del panel (solo tú) ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS admin_users (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      email         VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(200) NOT NULL,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;
    CREATE TRIGGER admin_users_updated_at
      BEFORE UPDATE ON admin_users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Productos y proyectos que se muestran en la web ────────────────────────
    CREATE TABLE IF NOT EXISTS products (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      type          VARCHAR(20)  NOT NULL DEFAULT 'producto', -- 'producto' | 'proyecto'
      sys_name      VARCHAR(60)  NOT NULL,
      title         VARCHAR(160) NOT NULL,
      tag           VARCHAR(80)  NOT NULL DEFAULT '',
      description   TEXT         NOT NULL DEFAULT '',
      features      JSONB        NOT NULL DEFAULT '[]',
      link_to       VARCHAR(200),        -- ruta interna o URL externa del botón
      cta_label     VARCHAR(80)  NOT NULL DEFAULT 'Saber más',
      image_url     VARCHAR(400),
      available     BOOLEAN      NOT NULL DEFAULT true,
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_products_type       ON products(type);
    CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);

    DROP TRIGGER IF EXISTS products_updated_at ON products;
    CREATE TRIGGER products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Configuración del sitio (contacto, redes, etc.) ─────────────────────────
    CREATE TABLE IF NOT EXISTS settings (
      key        VARCHAR(80) PRIMARY KEY,
      value      TEXT        NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS settings_updated_at ON settings;
    CREATE TRIGGER settings_updated_at
      BEFORE UPDATE ON settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `;

  try {
    await pool.query(query);
    console.log('✅ Tablas creadas correctamente');

    await seedSettings();
    await seedProducts();
    await seedAdmin();
  } catch (err) {
    console.error('❌ Error creando tablas:', err.message);
  } finally {
    await pool.end();
  }
};

// ── Config de contacto por defecto (solo si no existen aún) ───────────────────
const seedSettings = async () => {
  const defaults = {
    whatsapp_number: '51976267494',
    contact_email:   'contacto@leybrak.com',
    contact_phone:   '+51 976 267 494',
    instagram_url:   '',
    linkedin_url:    '',
    twitter_url:     '',
  };

  for (const [key, value] of Object.entries(defaults)) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
  console.log('✅ Configuración por defecto verificada');
};

// ── Productos actuales de la web, para que el admin ya los vea listos ─────────
const seedProducts = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(rows[0].count) > 0) return;

  const products = [
    {
      type: 'producto', sys_name: 'BRAVA_POS', title: 'SaaS Gastronómico', tag: 'Producto listo',
      description: 'Tu restaurante factura más rápido, pierde menos y siempre tiene el inventario al día. Sin papel, sin cuentas a mano.',
      features: ['Control de caja al centavo', 'Inventario sincronizado en vivo', 'Funciona sin internet en hora pico'],
      link_to: '/softwares/leybrak-pos', cta_label: 'Saber más', available: true, sort_order: 1,
    },
    {
      type: 'producto', sys_name: 'SYS_CUSTOM', title: 'Software a Medida', tag: 'A tu medida',
      description: 'Si ningún software del mercado se adapta a cómo trabajas, lo construimos desde cero para tu operación exacta.',
      features: ['Diseñado para tu proceso real', 'Sin funciones que no necesitas', 'Escala cuando tu negocio crece'],
      link_to: '/softwares/a-medida', cta_label: 'Saber más', available: true, sort_order: 2,
    },
    {
      type: 'producto', sys_name: 'DATA_VISION', title: 'Inteligencia de Negocio', tag: 'Add-on disponible',
      description: 'Deja de adivinar cuánto vendes. Paneles claros para saber qué funciona, qué no, y dónde va tu dinero.',
      features: ['Reportes de ventas en tiempo real', 'Detección de fugas de capital', 'Decisiones con datos, no con corazonadas'],
      link_to: '/softwares', cta_label: 'Saber más', available: false, sort_order: 3,
    },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (type, sys_name, title, tag, description, features, link_to, cta_label, available, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [p.type, p.sys_name, p.title, p.tag, p.description, JSON.stringify(p.features), p.link_to, p.cta_label, p.available, p.sort_order]
    );
  }
  console.log('✅ Productos iniciales cargados');
};

// ── Usuario admin inicial, tomado de las variables de entorno ─────────────────
const seedAdmin = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM admin_users');
  if (parseInt(rows[0].count) > 0) return;

  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se creó usuario admin. Defínelos en .env y vuelve a correr migrate.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)`,
    [email.toLowerCase(), passwordHash]
  );
  console.log(`✅ Usuario admin creado: ${email}`);
};

createTables();
