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

    -- ── Campos nuevos de productos: descarga, plataforma, galería de imágenes ──
    ALTER TABLE products ADD COLUMN IF NOT EXISTS download_url VARCHAR(400);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS platform     VARCHAR(20) NOT NULL DEFAULT 'both';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images       JSONB NOT NULL DEFAULT '[]';

    -- ── Planes de precio de un producto (ej. Básico / Pro de Leybrak POS) ───────
    CREATE TABLE IF NOT EXISTS product_plans (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id    UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name          VARCHAR(80) NOT NULL,
      price         NUMERIC(10,2),
      price_note    VARCHAR(40)  NOT NULL DEFAULT '/mes',
      tag           VARCHAR(80)  NOT NULL DEFAULT '',
      description   TEXT         NOT NULL DEFAULT '',
      featured      BOOLEAN      NOT NULL DEFAULT false,
      features      JSONB        NOT NULL DEFAULT '[]', -- [{ text, ok }]
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_product_plans_product_id ON product_plans(product_id);

    DROP TRIGGER IF EXISTS product_plans_updated_at ON product_plans;
    CREATE TRIGGER product_plans_updated_at
      BEFORE UPDATE ON product_plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Lista de servicios que se muestra en /servicios ─────────────────────────
    CREATE TABLE IF NOT EXISTS services (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      title         VARCHAR(160) NOT NULL,
      description   TEXT         NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS services_updated_at ON services;
    CREATE TRIGGER services_updated_at
      BEFORE UPDATE ON services
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Valores/pilares que se muestran en /nosotros ────────────────────────────
    CREATE TABLE IF NOT EXISTS about_values (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      title         VARCHAR(120) NOT NULL,
      description   TEXT         NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS about_values_updated_at ON about_values;
    CREATE TRIGGER about_values_updated_at
      BEFORE UPDATE ON about_values
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `;

  try {
    await pool.query(query);
    console.log('✅ Tablas creadas correctamente');

    await seedSettings();
    await seedProducts();
    await seedPlans();
    await seedServices();
    await seedAboutValues();
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
    about_founded:   '2026',
    about_city:      'Lima, Perú',
    about_mission:   'Hacer que la tecnología sea accesible para cualquier negocio, sin importar su tamaño.',
    softwares_subtitle: 'Tres soluciones para tres necesidades distintas. Elige la que encaja con tu negocio hoy.',
    servicios_subtitle: 'No importa en qué punto está tu negocio hoy. Tenemos un servicio para acompañarte desde el primer paso hasta la operación completa.',
    servicios_cta_heading: '¿No sabes por dónde empezar?',
    servicios_cta_text:    'Te hacemos un diagnóstico gratuito. Nos cuentas cómo trabajas y te decimos qué necesitas — sin venderte nada que no sea útil.',
    servicios_cta_tag:     'Diagnóstico gratuito, sin compromiso.',
    servicios_cta_button:  'Quiero el diagnóstico',
    about_negocios:        '1',
    about_sectores:        '1',
    about_values_heading:  'Lo que nos mueve',
    about_team_text:       '',
    descargas_subtitle:    'Todas las apps de Leybrak listas para instalar. Iremos sumando cada nuevo sistema aquí a medida que esté disponible.',
    descargas_empty_text:  'Todavía no hay descargas disponibles. Vuelve pronto.',
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

// ── Planes de Leybrak POS (Básico / Pro), para que el admin ya los vea listos ──
const seedPlans = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM product_plans');
  if (parseInt(rows[0].count) > 0) return;

  // Busca por el sys_name original o por el título — por si ya lo renombraste desde el panel.
  const product = await pool.query(
    `SELECT id FROM products WHERE sys_name = 'BRAVA_POS' OR title = 'SaaS Gastronómico' LIMIT 1`
  );
  if (product.rowCount === 0) {
    console.warn('⚠️  No se encontró el producto "SaaS Gastronómico" — crea los planes manualmente desde /admin.');
    return;
  }
  const productId = product.rows[0].id;

  const plans = [
    {
      name: 'Básico', price: 80, tag: 'Para empezar', featured: false, sort_order: 1,
      description: 'Todo lo que necesitas para digitalizar tu operación desde el primer día.',
      features: [
        { text: '1 sede',                   ok: true  },
        { text: 'Terminal POS ilimitado',   ok: true  },
        { text: 'KDS (pantalla de cocina)', ok: true  },
        { text: 'Carta QR para tu local',   ok: true  },
        { text: 'Dashboard de ventas',      ok: true  },
        { text: 'Soporte por WhatsApp',     ok: true  },
        { text: 'Bot de WhatsApp',          ok: false },
        { text: 'App de delivery propia',   ok: false },
        { text: 'Hasta 4 sedes',            ok: false },
      ],
    },
    {
      name: 'Pro', price: 150, tag: 'Más popular', featured: true, sort_order: 2,
      description: 'Para negocios que ya crecieron o quieren escalar a varios locales.',
      features: [
        { text: 'Hasta 4 sedes',            ok: true },
        { text: 'Terminal POS ilimitado',   ok: true },
        { text: 'KDS (pantalla de cocina)', ok: true },
        { text: 'Carta QR para tu local',   ok: true },
        { text: 'Dashboard de ventas',      ok: true },
        { text: 'Soporte prioritario',      ok: true },
        { text: 'Bot de WhatsApp incluido', ok: true },
        { text: 'App de delivery propia',   ok: true },
        { text: 'Reportes multi-sede',      ok: true },
      ],
    },
  ];

  for (const p of plans) {
    await pool.query(
      `INSERT INTO product_plans (product_id, name, price, tag, description, featured, features, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [productId, p.name, p.price, p.tag, p.description, p.featured, JSON.stringify(p.features), p.sort_order]
    );
  }
  console.log('✅ Planes iniciales cargados');
};

// ── Lista de servicios actual, para que el admin ya la vea lista ──────────────
const seedServices = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM services');
  if (parseInt(rows[0].count) > 0) return;

  const services = [
    { title: 'Digitalización de procesos', sort_order: 1,
      description: 'Tomamos todo lo que haces en papel, Excel o WhatsApp y lo convertimos en un flujo digital ordenado. Tu operación en un solo lugar.' },
    { title: 'Sistemas de punto de venta', sort_order: 2,
      description: 'Implementamos y configuramos tu POS según el tipo de negocio que tienes. Desde restaurantes hasta tiendas de retail.' },
    { title: 'Automatización de tareas', sort_order: 3,
      description: 'Identificamos qué tareas repetitivas te roban tiempo y las automatizamos. Menos horas manuales, menos errores humanos.' },
    { title: 'Desarrollo a medida', sort_order: 4,
      description: 'Construimos software hecho para tu operación exacta cuando las soluciones estándar no alcanzan.' },
    { title: 'Capacitación y soporte', sort_order: 5,
      description: 'No te dejamos solo. Capacitamos a tu equipo y te acompañamos después del lanzamiento.' },
    { title: 'Integración de sistemas', sort_order: 6,
      description: 'Conectamos las herramientas que ya usas entre sí para que los datos fluyan solos sin trabajo manual.' },
  ];

  for (const s of services) {
    await pool.query(
      `INSERT INTO services (title, description, sort_order) VALUES ($1, $2, $3)`,
      [s.title, s.description, s.sort_order]
    );
  }
  console.log('✅ Servicios iniciales cargados');
};

// ── Valores de "Nosotros" actuales, para que el admin ya los vea listos ───────
const seedAboutValues = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM about_values');
  if (parseInt(rows[0].count) > 0) return;

  const values = [
    { title: 'Claridad',    sort_order: 1, description: 'Sin tecnicismos. Te explicamos todo en lenguaje de negocio.' },
    { title: 'Compromiso',  sort_order: 2, description: 'No desaparecemos después de entregar. Estamos cuando nos necesitas.' },
    { title: 'Resultados',  sort_order: 3, description: 'No medimos el éxito en código entregado, sino en impacto en tu negocio.' },
  ];

  for (const v of values) {
    await pool.query(
      `INSERT INTO about_values (title, description, sort_order) VALUES ($1, $2, $3)`,
      [v.title, v.description, v.sort_order]
    );
  }
  console.log('✅ Valores de "Nosotros" iniciales cargados');
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
