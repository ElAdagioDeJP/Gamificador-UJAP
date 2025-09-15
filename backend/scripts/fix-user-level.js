#!/usr/bin/env node
require('dotenv').config();
const db = require('../models');
const { sequelize } = db;

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || !/^--user=/.test(args[0]) || !/^--level=/.test(args[1])) {
    console.log('Uso: node scripts/fix-user-level.js --user=<ID_USUARIO> --level=<NIVEL>');
    process.exit(1);
  }
  const userId = Number(args[0].split('=')[1]);
  const level = Number(args[1].split('=')[1]);
  if (!userId || !level) {
    console.error('Parámetros inválidos');
    process.exit(1);
  }
  try {
    const [result] = await sequelize.query(
      `UPDATE Usuarios SET nivel = :level WHERE id_usuario = :userId`,
      { replacements: { userId, level } }
    );
    console.log(`Usuario ${userId} actualizado a nivel ${level}.`);
    process.exit(0);
  } catch (e) {
    console.error('Error ajustando nivel:', e);
    process.exit(2);
  }
}

main();
