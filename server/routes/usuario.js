const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRol } = require('../middlewares/authentication');

app.get('/usuario', verificaToken, function (req, res) {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({estado: true}, 'nombre email role estado google img')
  .skip(desde).limit(limite)
  .exec((err, usuarios) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    Usuario.countDocuments({estado: true}, (err, conteo) => {
      res.json({
        ok: true,
        usuarios,
        conteo
      });
    });
  });
});

app.post('/usuario', [verificaToken, verificaAdminRol], function (req, res) {
  let body = req.body;
  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });
  usuario.save( (err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

app.put('/usuario/:id', [verificaToken, verificaAdminRol], function (req, res) {
  const id = req.params.id;
  let body = _.pick(req.body, ['nombre','email','img','role','estado']);

  const opts = {
    new: true,
    runValidators: true
  };
  Usuario.findByIdAndUpdate(id, body, opts, (err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

app.delete('/usuario/:id', [verificaToken, verificaAdminRol], function (req, res) {
  const estado = {estado: false};
  const id = req.params.id;

  Usuario.findByIdAndUpdate(id, estado, {new: true},
  (err, usuarioEliminado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    if (!usuarioEliminado) {
      return res.status(400).json({
        ok: false,
        error: {
          message: 'Usuario no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      usuario: usuarioEliminado
    });
  });
});

module.exports = app;