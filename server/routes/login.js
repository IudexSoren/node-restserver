const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {
  const body = req.body;

  Usuario.findOne({email: body.email}, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario o contraseña incorrectos'
        }
      });
    }
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario o contraseña incorrectos'
        }
      });
    }
    // Login exitoso
    const token = jwt.sign({
      usuario: usuarioDB
    }, process.env.SEED, {
      expiresIn: process.env.TOKEN_EXPIRES
    });
    res.json({
      ok: true,
      usuario: usuarioDB,
      token
    });
    //
  });
});

// Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

app.post ('/google-si', async (req, res) => {
  const token = req.body.idtoken;
  let googleUser = await verify(token)
  .catch(err => {
    return res.status(400).json({
      ok: false,
      err
    });
  });

  Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (usuarioDB) {
      if (!usuarioDB.google) {
        return res.status(400).json({
          ok: false,
          err: {
            message: `Ya existe un usuario con el correo ${usuarioDB.email}`
          }
        });
      } else {
        let token = jwt.sign({
          usuario: usuarioDB
          }, process.env.SEED, {
          expiresIn: process.env.TOKEN_EXPIRES
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token
        });
      }
    } else {
      // Crear usuario usando google-sign-in
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';
      
      usuario.save((err, nuevoUsuario) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          });
        }
        let token = jwt.sign({
          usuario: usuarioDB
          }, process.env.SEED, {
          expiresIn: process.env.TOKEN_EXPIRES
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token
        });
      });
    }
  });
});


module.exports = app;