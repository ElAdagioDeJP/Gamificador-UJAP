const { Usuario } = require('../../models');

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, university, career } = req.body;
    const user = await Usuario.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (name) user.nombre_completo = name;
    await user.save();

    res.json({ success: true, data: { user: user.toSafeJSON(), meta: { university, career } } });
  } catch (e) {
    next(e);
  }
};
