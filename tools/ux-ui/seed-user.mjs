import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

function appendEnv(file, entries) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const missing = entries.filter(([key]) => !new RegExp(`^${key}=`, "m").test(current));
  if (!missing.length) return;
  const block = missing.map(([key, value]) => `${key}=${value}`).join("\n");
  fs.writeFileSync(file, `${current.replace(/\s*$/, "")}\n${block}\n`);
}

loadEnv(envPath);

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "LT_Sanchez",
} = process.env;

const SUPER = {
  nombres: "Usuario Demo UXUI",
  correo: "uxui.super@ltsanchez.test",
  password: "UxuiDemo2026",
  rol: "superadmin",
  idAuth: "auth-uxui-super",
};

const OG = {
  nombres: "Usuario OG Demo UXUI",
  correo: "uxui.og@ltsanchez.test",
  password: "UxuiDemo2026",
  rol: "OG",
  idAuth: "auth-uxui-og",
};

const conn = await mysql.createConnection({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

async function getRolId(nombre) {
  const [rows] = await conn.query("SELECT id FROM roles WHERE LOWER(nombre) = LOWER(?) LIMIT 1", [nombre]);
  if (!rows.length) throw new Error(`No existe el rol ${nombre}`);
  return rows[0].id;
}

async function upsertUser(user, rolId, empresaId) {
  const hash = await bcrypt.hash(user.password, 12);
  const [existing] = await conn.query("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [user.correo]);
  let id;
  if (existing.length) {
    id = existing[0].id;
    await conn.query(
      `UPDATE usuarios
          SET nombres = ?, password = ?, id_rol = ?, estado = 'ACTIVO',
              id_auth = ?, tema = 'light', empresa_id = ?
        WHERE id = ?`,
      [user.nombres, hash, rolId, user.idAuth, empresaId, id]
    );
  } else {
    const [result] = await conn.query(
      `INSERT INTO usuarios
         (nombres, correo, password, id_rol, estado, id_tipodocumento, tema, id_auth, empresa_id, fecharegistro)
       VALUES (?, ?, ?, ?, 'ACTIVO', 1, 'light', ?, ?, NOW())`,
      [user.nombres, user.correo, hash, rolId, user.idAuth, empresaId]
    );
    id = result.insertId;
  }
  return id;
}

async function assignSucursal(userId, idSucursal = 1, idCaja = 1) {
  await conn.query("DELETE FROM asignacion_sucursal WHERE id_usuario = ?", [userId]);
  await conn.query(
    "INSERT INTO asignacion_sucursal (id_sucursal, id_usuario, id_caja) VALUES (?, ?, ?)",
    [idSucursal, userId, idCaja]
  );
}

async function assignAllPermisos(userId) {
  await conn.query("DELETE FROM permisos WHERE id_usuario = ?", [userId]);
  await conn.query(
    "INSERT INTO permisos (id_usuario, idmodulo) SELECT ?, id FROM modulos",
    [userId]
  );
}

async function main() {
  const [[empresa]] = await conn.query("SELECT id FROM empresa ORDER BY id LIMIT 1");
  if (!empresa) throw new Error("No hay empresa en la BD. Ejecuta bootstrap.sql primero.");

  const superRol = await getRolId(SUPER.rol);
  const ogRol = await getRolId(OG.rol);

  const superId = await upsertUser(SUPER, superRol, empresa.id);
  await assignSucursal(superId, 1, 1);
  await assignAllPermisos(superId);

  const ogId = await upsertUser(OG, ogRol, null);
  await assignAllPermisos(ogId);
  await conn.query("DELETE FROM asignacion_sucursal WHERE id_usuario = ?", [ogId]);

  appendEnv(envPath, [
    ["UXUI_EMAIL", SUPER.correo],
    ["UXUI_PASSWORD", SUPER.password],
    ["UXUI_OG_EMAIL", OG.correo],
    ["UXUI_OG_PASSWORD", OG.password],
    ["UXUI_EMPRESA_ID", String(empresa.id)],
  ]);

  const log = {
    generatedAt: new Date().toISOString(),
    database: DB_NAME,
    empresaId: empresa.id,
    users: [
      { id: superId, correo: SUPER.correo, rol: SUPER.rol, empresaId: empresa.id, sucursalId: 1, cajaId: 1 },
      { id: ogId, correo: OG.correo, rol: OG.rol, empresaId: null },
    ],
  };
  fs.writeFileSync(path.join(__dirname, "seed-log.json"), `${JSON.stringify(log, null, 2)}\n`);

  console.log("Usuario de prueba listo:");
  console.log(`  superadmin: ${SUPER.correo} / ${SUPER.password} (id ${superId})`);
  console.log(`  OG:         ${OG.correo} / ${OG.password} (id ${ogId})`);
  console.log(`  empresa:    ${empresa.id}`);
}

try {
  await main();
} finally {
  await conn.end();
}
