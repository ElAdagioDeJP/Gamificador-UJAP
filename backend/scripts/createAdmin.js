require('dotenv').config();
const readline = require('readline');
const { Op } = require('sequelize');
const connectDB = require('../src/config/db');
const { Usuario, sequelize } = require('../models');

(async () => {
  await connectDB();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = (s) => new Promise((res) => rl.question(s, res));

  try {
    const username = (await q('Admin username: ')).trim();
    const email = (await q('Admin email: ')).trim();
    const password = (await q('Admin password: ')).trim();

    const nombre_usuario = username;
    const email_institucional = email;
    const nombre_completo = username;

    let user = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email_institucional },
          { nombre_usuario },
        ]
      }
    });
    if (user) {
      console.log('User exists, updating password...');
      if (password) user.contrasena_hash = password; // hashed via hooks
      await user.save();
      console.log('Admin updated:', user.toSafeJSON());
    } else {
      user = await Usuario.create({ nombre_usuario, nombre_completo, email_institucional, contrasena_hash: password });
      console.log('Admin created:', user.toSafeJSON());
    }
  } catch (e) {
    console.error(e);
  } finally {
    rl.close();
    await sequelize.close();
    process.exit(0);
  }
})();
