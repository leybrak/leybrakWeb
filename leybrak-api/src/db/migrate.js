const bcrypt = require('bcryptjs');
const pool = require('./pool');
const { slugify } = require('../utils/slugify');

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

    -- ── Slug: la "ruta" automática de la página de presentación de cada producto ──
    ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(160);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

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

    -- ── "Lo que creemos" del Hero de Inicio (panel con typewriter) ──────────────
    CREATE TABLE IF NOT EXISTS manifesto_items (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      title         VARCHAR(300) NOT NULL,
      description   TEXT         NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS manifesto_items_updated_at ON manifesto_items;
    CREATE TRIGGER manifesto_items_updated_at
      BEFORE UPDATE ON manifesto_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Pasos del camino "Productos listos" en Inicio ───────────────────────────
    CREATE TABLE IF NOT EXISTS saas_steps (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      title         VARCHAR(160) NOT NULL,
      description   TEXT         NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS saas_steps_updated_at ON saas_steps;
    CREATE TRIGGER saas_steps_updated_at
      BEFORE UPDATE ON saas_steps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Pasos del camino "A tu medida" en Inicio ─────────────────────────────────
    CREATE TABLE IF NOT EXISTS custom_steps (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      title         VARCHAR(160) NOT NULL,
      description   TEXT         NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS custom_steps_updated_at ON custom_steps;
    CREATE TRIGGER custom_steps_updated_at
      BEFORE UPDATE ON custom_steps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- ── Tarjetas de "¿Te suena familiar?" en Inicio ─────────────────────────────
    CREATE TABLE IF NOT EXISTS problem_cards (
      id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      quote         TEXT         NOT NULL,
      context       TEXT         NOT NULL DEFAULT '',
      who           VARCHAR(160) NOT NULL DEFAULT '',
      sort_order    INT          NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS problem_cards_updated_at ON problem_cards;
    CREATE TRIGGER problem_cards_updated_at
      BEFORE UPDATE ON problem_cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `;

  try {
    await pool.query(query);
    console.log('✅ Tablas creadas correctamente');

    await seedSettings();
    await seedProducts();
    await backfillProductSlugs();
    await seedPlans();
    await seedServices();
    await seedAboutValues();
    await seedManifestoItems();
    await seedSaasSteps();
    await seedCustomSteps();
    await seedProblemCards();
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

    // Hero (Inicio)
    hero_label:              'Para negocios que quieren crecer de verdad',
    hero_heading_start:      'De libreta',
    hero_heading_highlight:  'sistema',
    hero_heading_end:        'en semanas.',
    hero_description_before: 'Si todavía usas papel, WhatsApp o Excel para manejar tu negocio, no estás solo.',
    hero_description_bold:   'Te ayudamos a digitalizar tu operación sin complicarte la vida',
    hero_description_after:  ', para que sepas exactamente qué pasa en tu negocio, desde donde estés.',
    hero_button_primary:     'Quiero digitalizar mi negocio',
    hero_button_secondary:   'Ver cómo funciona',

    // Problemas (Inicio)
    problems_label:              'Lo que escuchamos todos los días',
    problems_heading_start:      '¿Te suena',
    problems_heading_highlight:  'familiar?',
    problems_subtitle:           'Estos no son problemas de tecnología. Son problemas de tiempo, de plata y de paz mental. Y tienen solución.',
    problems_cta_start:          'Si alguno de estos te llegó,',
    problems_cta_highlight:      'tenemos la solución.',

    // Cómo funciona (Inicio)
    howitworks_label:             'Sin complicaciones',
    howitworks_heading_start:     '¿Cómo',
    howitworks_heading_highlight: 'empezamos?',
    howitworks_saas_badge:        'Productos listos',
    howitworks_saas_subtitle:     'Para cuando quieres empezar ya.',
    howitworks_saas_tag:          'Operativo en menos de 48 horas',
    howitworks_saas_cta:          'Ver productos disponibles',
    howitworks_custom_badge:      'A tu medida',
    howitworks_custom_subtitle:   'Para cuando lo estándar no alcanza.',
    howitworks_custom_tag:        'Diagnóstico inicial sin costo',
    howitworks_custom_cta:        'Agendar diagnóstico gratis',
    howitworks_footer_note:       '// En cualquier caso — sin contratos largos, sin letra chica',
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

// ── Asigna slug (la "ruta" de la página de presentación) a productos que
// todavía no lo tienen — nunca se le pide esto al admin, se calcula solo.
const backfillProductSlugs = async () => {
  const { rows } = await pool.query('SELECT id, sys_name, title FROM products WHERE slug IS NULL');
  if (rows.length === 0) return;

  const { rows: existing } = await pool.query('SELECT slug FROM products WHERE slug IS NOT NULL');
  const taken = new Set(existing.map(r => r.slug));

  // Los dos productos originales conservan la ruta que ya usaban sus páginas hechas a mano.
  const FIXED_SLUGS = {
    BRAVA_POS:  'leybrak-pos',
    LEYBRAK_POS: 'leybrak-pos',
    SYS_CUSTOM: 'a-medida',
  };

  for (const row of rows) {
    let base = FIXED_SLUGS[row.sys_name] || slugify(row.title);
    let slug = base;
    let n = 2;
    while (taken.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    taken.add(slug);
    await pool.query('UPDATE products SET slug = $1 WHERE id = $2', [slug, row.id]);
  }
  console.log(`✅ Slugs asignados a ${rows.length} producto(s)`);
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

// ── "Lo que creemos" del Hero de Inicio, para que el admin ya lo vea listo ────
const seedManifestoItems = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM manifesto_items');
  if (parseInt(rows[0].count) > 0) return;

  const items = [
    'Todo negocio merece tecnología de calidad,\nno solo las grandes empresas.',
    'El papel y el Excel tienen fecha de\nvencimiento. Ya venció.',
    'No vendemos software.\nVendemos control sobre tu negocio.',
    'Sin contratos eternos.\nSin letra chica. Sin excusas.',
  ];

  for (let i = 0; i < items.length; i++) {
    await pool.query(
      `INSERT INTO manifesto_items (title, sort_order) VALUES ($1, $2)`,
      [items[i], i + 1]
    );
  }
  console.log('✅ Manifiesto inicial cargado');
};

// ── Pasos del camino SaaS de Inicio, para que el admin ya los vea listos ──────
const seedSaasSteps = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM saas_steps');
  if (parseInt(rows[0].count) > 0) return;

  const steps = [
    { title: 'Elige tu producto', description: 'POS, inventario, reservas... tenemos módulos listos para el tipo de negocio que tienes.' },
    { title: 'Lo configuramos juntos', description: 'En menos de 48 horas dejamos todo listo con tus productos, precios y equipo.' },
    { title: 'Empiezas desde el día 1', description: 'Te acompañamos los primeros días para que tú y tu equipo lo dominen sin estrés.' },
  ];

  for (let i = 0; i < steps.length; i++) {
    await pool.query(
      `INSERT INTO saas_steps (title, description, sort_order) VALUES ($1, $2, $3)`,
      [steps[i].title, steps[i].description, i + 1]
    );
  }
  console.log('✅ Pasos del camino SaaS cargados');
};

// ── Pasos del camino a medida de Inicio, para que el admin ya los vea listos ──
const seedCustomSteps = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM custom_steps');
  if (parseInt(rows[0].count) > 0) return;

  const steps = [
    { title: 'Diagnóstico gratis', description: 'Nos sentamos contigo, entendemos cómo trabajas y detectamos dónde estás perdiendo tiempo o plata.' },
    { title: 'Diseñamos la solución', description: 'Te presentamos exactamente qué vamos a construir, cuánto cuesta y en cuánto tiempo.' },
    { title: 'Desarrollamos sin sorpresas', description: 'Fechas claras, avances visibles. Tú ves el progreso semana a semana.' },
    { title: 'Lanzamos y capacitamos', description: 'Tu equipo aprende a usarlo antes del lanzamiento. Salimos en vivo cuando estés listo.' },
  ];

  for (let i = 0; i < steps.length; i++) {
    await pool.query(
      `INSERT INTO custom_steps (title, description, sort_order) VALUES ($1, $2, $3)`,
      [steps[i].title, steps[i].description, i + 1]
    );
  }
  console.log('✅ Pasos del camino a medida cargados');
};

// ── Tarjetas de "¿Te suena familiar?" de Inicio, ya listas para el admin ──────
const seedProblemCards = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM problem_cards');
  if (parseInt(rows[0].count) > 0) return;

  const cards = [
    { quote: 'No sé cuánto\nvendí hoy.', context: 'Al final del día tienes la caja llena pero no sabes de dónde vino cada peso.', who: 'Restaurante · Tienda · Bodega' },
    { quote: 'Siempre me\nfalta stock.', context: 'Descubres que te quedaste sin producto cuando el cliente ya está parado frente a ti.', who: 'Retail · Farmacia · Ferretería' },
    { quote: 'Todo lo anoto\nen un cuaderno.', context: 'Entre tachones, páginas arrancadas y letras ilegibles, la información se pierde.', who: 'Hostal · Peluquería · Taller' },
    { quote: 'Mis empleados\nme fallan y no me entero.', context: 'Sin registro digital no sabes qué pasó en tu negocio cuando no estabas.', who: 'Cualquier negocio con personal' },
  ];

  for (let i = 0; i < cards.length; i++) {
    await pool.query(
      `INSERT INTO problem_cards (quote, context, who, sort_order) VALUES ($1, $2, $3, $4)`,
      [cards[i].quote, cards[i].context, cards[i].who, i + 1]
    );
  }
  console.log('✅ Tarjetas de problemas cargadas');
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
