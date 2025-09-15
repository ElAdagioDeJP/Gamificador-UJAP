require('dotenv').config();
const { sequelize } = require('../models');

/**
 * Script para ajustar nivel/experiencia/puntos de un usuario.
 * Uso (PowerShell):
 *   node scripts/set-user-level.js --email ana@edu.com --level 14 --points 1470
 *   node scripts/set-user-level.js --id 123 --level 14 --points 1470
 *
 * Reglas:
 * - Si sólo se pasa --level, calcula experiencia_total = max(0, (level-1)*200 + resto)
 *   Por defecto usamos el límite inferior del nivel: experiencia_total = (level-1) * 200
 * - --points es opcional para ajustar los puntos actuales.
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email') out.email = args[++i];
    else if (a === '--id') out.id = Number(args[++i]);
    else if (a === '--level') out.level = Number(args[++i]);
    else if (a === '--points') out.points = Number(args[++i]);
  }
  return out;
}

async function main() {
  const { email, id, level, points } = parseArgs();
  if ((!email && !id) || !level) {
    console.log('Uso: node scripts/set-user-level.js --email <correo> | --id <id> --level <nivel> [--points <puntos>]');
    process.exit(1);
  }
  const exp = Math.max(0, (Number(level) - 1) * 200);
  try {
    const where = email ? 'email_institucional = :email' : 'id_usuario = :id';
    const replacements = email ? { email, level, exp, points } : { id, level, exp, points };

    // Actualizar experiencia y nivel
    await sequelize.query(
      `UPDATE Usuarios
         SET experiencia_total = :exp,
             nivel = :level
       WHERE ${where}`,
      { replacements }
    );

    if (typeof points === 'number' && !Number.isNaN(points)) {
      await sequelize.query(
        `UPDATE Usuarios
           SET puntos_actuales = :points
         WHERE ${where}`,
        { replacements }
      );
    }

    const [[u]] = await sequelize.query(
      `SELECT id_usuario, nombre_usuario, email_institucional, nivel, experiencia_total, puntos_actuales
         FROM Usuarios
        WHERE ${where}
        LIMIT 1`,
      { replacements }
    );

    console.log('✅ Usuario actualizado:', u);
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error ajustando nivel/experiencia:', err);
    process.exit(1);
  }
}

main();
