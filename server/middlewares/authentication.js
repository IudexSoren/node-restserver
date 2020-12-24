const jwt = require('jsonwebtoken');

const verificaToken = (req, res, next) => {
  // Obtener header
  const token = req.get('Authorization');
  // Verificar token
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Token inválido'
        }
      });
    }
    req.usuario = decoded.usuario;
    // next() Continúa la ejecución, sin él, se detiene en el middleware.
    next();
  });
}

const verificaAdminRol = (req, res, next) => {
  const usuario = req.usuario;
  if (usuario.role !== 'ADMIN_ROLE') {
    return res.status(401).json({
      ok: false,
      err: {
        message: 'No autorizado: El usuario no es administrador'
      }
    });
  }
  next();
}

const verificaTokenArchivo = (req, res, next) => {
  const token = req.query.token;
  // Verificar token
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Token inválido'
        }
      });
    }
    req.usuario = decoded.usuario;
    // next() Continúa la ejecución, sin él, se detiene en el middleware.
    next();
  });
}

module.exports = {
  verificaToken,
  verificaAdminRol,
  verificaTokenArchivo
};