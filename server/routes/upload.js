const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const producto = require('../models/producto');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {
  const tipo = req.params.tipo;
  const id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningún archivo'
      }
    });
  }
  // Validar tipo
  const tiposValidos = ['productos', 'usuarios'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Tipo inválido'
      }
    });
  }
  // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
  let archivo = req.files.archivo;
  let arrayNombre = archivo.name.split('.');
  let extension = arrayNombre[arrayNombre.length - 1].toLowerCase();
  // Extensiones permitidas
  const extensionesValidas = ['png','jpg','jpeg','gif','mp4'];
  if (!extensionesValidas.includes(extension)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Tipo de archivo no permitido. Tipos de archivo permitidos: ${extensionesValidas.join(', ')}`
      },
      extension
    });
  }
  // Cambiar nombre de archivo
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`
  // Use the mv() method to place the file somewhere on your server
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).send({
        ok: false,
        err
      });
    }
    // Imagen cargada
    if (tipo === 'usuarios') {
      imagenUsuario(id, res, nombreArchivo);
    } else if (tipo === 'productos') {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

const imagenUsuario = (id, res, nombreArchivo) => {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!usuarioDB) {
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no encontrado'
        }
      });
    }
    borraArchivo(usuarioDB.img, 'usuarios');
    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        message: 'Archivo subido'
      });
    });
  });
}

const imagenProducto = (id, res, nombreArchivo) => {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borraArchivo(nombreArchivo, 'productos');
     return res.status(500).json({
      ok: false,
      err
     });
    }
    if (!productoDB) {
      borraArchivo(nombreArchivo, 'productos');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    borraArchivo(productoDB.img, 'productos');
    productoDB.img = nombreArchivo;
    productoDB.save((err, productoGuardado) => {
      res.json({
        ok: true,
        producto: productoGuardado,
        message: 'Archivo subido'
      });
    });
  })
}

const borraArchivo = (nombreArchivo, tipo) => {
  let pathArchivo = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
  if (fs.existsSync(pathArchivo)) {
    fs.unlinkSync(pathArchivo);
  }
}

module.exports = app;