const { Usuario } = require('../../models');

exports.updateProfile = async (req, res, next) => {
  try {
    console.log('updateProfile: body:', req.body);
    console.log('updateProfile: userId:', req.user?.id);
    const userId = req.user.id;
    const { name, university, career } = req.body;
    const user = await Usuario.findByPk(userId);
    if (!user) {
      console.log('updateProfile: Usuario no encontrado');
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (name) user.nombre_completo = name;
    if (university) user.universidad = university;
    if (career) user.carrera = career;
    await user.save();

    console.log('updateProfile: usuario actualizado:', user.toJSON());
    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (e) {
    console.log('updateProfile: error:', e);
    next(e);
  }
};
