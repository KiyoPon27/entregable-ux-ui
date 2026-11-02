import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../docs/ux-ui/img");
const MANIFEST = path.resolve(__dirname, "../../docs/ux-ui/captures.json");
const BASE_URL = process.env.UXUI_BASE_URL || "http://127.0.0.1:5173";
const API_URL = process.env.UXUI_API_URL || "http://127.0.0.1:8081/api";
const CHROME = process.env.UXUI_CHROME || "/usr/bin/google-chrome-stable";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].trim();
  }
}
loadEnv(path.join(__dirname, ".env.local"));

const EMAIL = process.env.UXUI_EMAIL;
const PASSWORD = process.env.UXUI_PASSWORD;
const OG_EMAIL = process.env.UXUI_OG_EMAIL;
const OG_PASSWORD = process.env.UXUI_OG_PASSWORD;

fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
  { name: "login", path: "/login", public: true, dark: false, mobile: true },
  { name: "home", path: "/", key: true, dark: true, mobile: true },
  { name: "dashboard", path: "/dashboard", key: true, dark: true, mobile: true },
  { name: "pos", path: "/pos", key: true, dark: true, mobile: true },
  { name: "inventario", path: "/inventario", key: true, dark: true, mobile: true },
  { name: "movimientos-stock", path: "/movimientos-stock" },
  { name: "compras", path: "/compras" },
  { name: "reporte-compras", path: "/reporte-compras" },
  { name: "facturas", path: "/facturas" },
  { name: "reportes", path: "/reportes" },
  { name: "reporte-inventario-valorado", path: "/reportes/inventario_valorado" },
  { name: "reporte-ventas", path: "/reportes/report_ventas" },
  { name: "reporte-stock-bajo-minimo", path: "/reportes/report_stock_bajo_minimo" },
  { name: "configuracion", path: "/configuracion", key: true, dark: true, mobile: true },
  { name: "admin-empresas", path: "/configuracion/administrar-empresas", role: "OG" },
  { name: "categorias", path: "/configuracion/categorias", key: true, dark: true },
  { name: "serializacion", path: "/configuracion/serializacion" },
  { name: "ticket", path: "/configuracion/ticket" },
  { name: "productos", path: "/configuracion/productos", key: true, dark: true, mobile: true },
  { name: "empresa-basicos", path: "/configuracion/empresa/empresabasicos", key: true, dark: true },
  { name: "empresa-monedas", path: "/configuracion/empresa/monedaconfig" },
  { name: "clientes", path: "/configuracion/clientes" },
  { name: "proveedores", path: "/configuracion/proveedores" },
  { name: "metodos-pago", path: "/configuracion/metodospago" },
  { name: "sucursales-caja", path: "/configuracion/sucursalcaja", key: true, dark: true },
  { name: "impresoras", path: "/configuracion/impresoras" },
  { name: "usuarios", path: "/configuracion/usuarios", key: true, dark: true, mobile: true },
  { name: "almacenes", path: "/configuracion/almacenes" },
  { name: "mi-perfil", path: "/miperfil", key: true, dark: true, mobile: true },
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

function slug(value) {
  return value.replace(/^\/$/, "home").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function apiLogin(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, password }),
  });
  if (!response.ok) throw new Error(`Login fallido para ${email}: HTTP ${response.status}`);
  const data = await response.json();
  if (!data.accessToken) throw new Error(`Login sin token para ${email}`);
  return data.accessToken;
}

async function dbConnect() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  return mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
}

async function resetTheme(email, theme = "light") {
  const conn = await dbConnect();
  await conn.query("UPDATE usuarios SET tema = ? WHERE correo = ?", [theme, email]);
  await conn.end();
}

async function ensureOpenCierre(email) {
  const conn = await dbConnect();
  try {
    const [users] = await conn.query("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [email]);
    if (!users.length) return;
    const userId = users[0].id;
    const [open] = await conn.query(
      "SELECT id FROM cierrecaja WHERE id_usuario = ? AND fechacierre IS NULL LIMIT 1",
      [userId]
    );
    if (open.length) return;
    const [cajas] = await conn.query("SELECT id FROM caja ORDER BY id LIMIT 1");
    if (!cajas.length) return;
    await conn.query(
      "INSERT INTO cierrecaja (fechainicio, fechacierre, id_usuario, total_efectivo_calculado, total_efectivo_real, estado, diferencia_efectivo, id_caja) VALUES (NOW(), NULL, ?, 0, 0, 0, 0, ?)",
      [userId, cajas[0].id]
    );
    console.log(`Caja aperturada para ${email} (caja ${cajas[0].id})`);
  } finally {
    await conn.end();
  }
}

function safeName(route, theme, viewport) {
  return `${slug(route.path)}-${theme}-${viewport}.jpg`;
}

async function collectInfo(page) {
  return page.evaluate(() => {
    const heading = document.querySelector("h1, h2, h3");
    const body = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      heading: heading ? heading.textContent.trim().slice(0, 120) : null,
      textSample: body.slice(0, 240),
    };
  });
}

async function enrichPos(page, entry) {
  try {
    const input = page.locator('input[placeholder="buscar..."]').first();
    if ((await input.count()) === 0) return;
    await input.fill("fideo");
    await page.waitForTimeout(1200);
    const item = page.locator(".contentItems > *").first();
    if ((await item.count()) > 0) {
      await item.click({ timeout: 5000 });
      await page.waitForTimeout(1500);
      entry.note = "producto agregado al carrito";
    }
  } catch (error) {
    entry.note = `no se pudo agregar producto: ${error.message}`;
  }
}

async function captureRoute(context, route, theme, viewportName, manifest, index) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && errors.length < 12) {
      errors.push(`console: ${message.text().slice(0, 220)}`);
    }
  });

  const file = safeName(route, theme, viewportName);
  const entry = {
    index,
    name: route.name,
    path: route.path,
    theme,
    viewport: viewportName,
    file: `img/${file}`,
    ok: false,
    finalUrl: null,
    heading: null,
    textSample: null,
    note: null,
    errors,
  };

  try {
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(route.public ? 2500 : 3800);

    entry.finalUrl = page.url();
    if (!route.public && /\/login(\?|$)/.test(new URL(page.url()).pathname)) {
      entry.error = "redirigido a /login";
      entry.ok = false;
      return entry;
    }

    if (theme === "dark") {
      const toggle = page.locator("#switch").first();
      const count = await toggle.count();
      if (count > 0) {
        await toggle.click({ force: true, timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1200);
      } else {
        entry.error = "toggle de tema no encontrado";
      }
    }

    if (route.name === "pos") await enrichPos(page, entry);

    const info = await collectInfo(page);
    entry.heading = info.heading;
    entry.textSample = info.textSample;

    await page.screenshot({
      path: path.join(OUT_DIR, file),
      type: "jpeg",
      quality: 85,
      fullPage: false,
    });
    entry.ok = true;
  } catch (error) {
    entry.error = error.message;
  } finally {
    await page.close().catch(() => {});
  }
  return entry;
}

async function newContext(browser, token, viewportName, authenticated = true) {
  const context = await browser.newContext({
    viewport: VIEWPORTS[viewportName],
    deviceScaleFactor: 1,
    locale: "es-PE",
    timezoneId: "America/Lima",
  });
  if (authenticated && token) {
    await context.addInitScript((value) => {
      localStorage.setItem("token", value);
    }, token);
  }
  return context;
}

async function main() {
  if (!EMAIL || !PASSWORD) throw new Error("Faltan UXUI_EMAIL/UXUI_PASSWORD en .env.local");
  await resetTheme(EMAIL, "light");
  if (OG_EMAIL) await resetTheme(OG_EMAIL, "light");

  const token = await apiLogin(EMAIL, PASSWORD);
  const ogToken = OG_EMAIL && OG_PASSWORD ? await apiLogin(OG_EMAIL, OG_PASSWORD) : null;
  await ensureOpenCierre(EMAIL);

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });

  const manifest = { generatedAt: new Date().toISOString(), baseUrl: BASE_URL, entries: [] };
  let index = 1;

  const lightContext = await newContext(browser, token, "desktop");
  for (const route of ROUTES) {
    const ctx =
      route.role === "OG"
        ? await newContext(browser, ogToken, "desktop")
        : route.public
          ? await newContext(browser, null, "desktop", false)
          : lightContext;
    const entry = await captureRoute(ctx, route, "light", "desktop", manifest, index++);
    manifest.entries.push(entry);
    console.log(`[light/desktop] ${route.name}: ${entry.ok ? "ok" : `FALLO (${entry.error})`}`);
    if (ctx !== lightContext) await ctx.close();
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  await lightContext.close();

  for (const route of ROUTES.filter((item) => item.dark)) {
    await resetTheme(EMAIL, "light");
    const context = await newContext(browser, token, "desktop");
    const entry = await captureRoute(context, route, "dark", "desktop", manifest, index++);
    manifest.entries.push(entry);
    console.log(`[dark/desktop] ${route.name}: ${entry.ok ? "ok" : `FALLO (${entry.error})`}`);
    await context.close();
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  for (const route of ROUTES.filter((item) => item.mobile)) {
    await resetTheme(EMAIL, "light");
    const context = route.public
      ? await newContext(browser, null, "mobile", false)
      : await newContext(browser, token, "mobile");
    const entry = await captureRoute(context, route, "light", "mobile", manifest, index++);
    manifest.entries.push(entry);
    console.log(`[light/mobile] ${route.name}: ${entry.ok ? "ok" : `FALLO (${entry.error})`}`);
    await context.close();
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  await browser.close();
  await resetTheme(EMAIL, "light");
  if (OG_EMAIL) await resetTheme(OG_EMAIL, "light");

  const ok = manifest.entries.filter((entry) => entry.ok).length;
  console.log(`\nCapturas: ${ok}/${manifest.entries.length} OK`);
  console.log(`Manifest: ${MANIFEST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
