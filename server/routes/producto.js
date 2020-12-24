const express = require('express');
const app = express();
const { verificaToken, verificaAdminRol } = require('../middlewares/authentication');
const Producto = require('../models/producto');
const _ = require('underscore');

// Listar productos
app.get('/producto', verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

  Producto.find({disponible: true}).skip(desde).limit(limite)
  .populate('usuario', 'nombre email').populate('categoria', 'descripcion')
  .exec((err, productos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    Producto.countDocuments({disponible: true}, (err, conteo) => {
      res.json({
        ok: true,
        productos,
        conteo
      });
    });
  });
});

// Obtener producto por ID
app.get('/producto/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      producto: productoDB
    });
  })
  .populate('usuario', 'nombre email')
  .populate('categoria', 'descripcion');
});

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, 'i');

  Producto.find({ nombre: regex })
  .populate('categoria', 'descripcion')
  .exec((err, productos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      productos
    });
  });
});

// Crear producto
app.post('/producto', [verificaToken, verificaAdminRol], (req, res) => {
  const body = req.body;
  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
    usuario: req.usuario._id
  });
  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      producto: productoDB
    });
  })
});

// Actualizar producto
app.put('/producto/:id', [verificaToken, verificaAdminRol], (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['nombre','precioUni','descripcion','disponible','categoria']);
  const opts = {
    new: true,
    runValidators: true
  };
  Producto.findByIdAndUpdate(id, body, opts,
  (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      producto: productoDB
    });
  })
});

// Eliminar producto
app.delete('/producto/:id', [verificaToken, verificaAdminRol], (req, res) => {
  const disponible = {disponible: false};
  const id = req.params.id;
  Producto.findByIdAndUpdate(id, disponible, {new: true},
  (err, productoEliminado) => {
    if (err) {
      return res.status(500).json({
       ok: false,
       err
      });
    }
    if (!productoEliminado) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      producto: productoEliminado
    });
  })
});

module.exports = app;