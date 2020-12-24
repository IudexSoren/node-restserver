const express = require('express');
const app = express();
const {verificaToken, verificaAdminRol} = require('../middlewares/authentication');
const _ = require('underscore');
const Categoria = require('../models/categoria');

// Listar categorías
app.get('/categoria', verificaToken, (req, res) => {
  Categoria.find({})
  .sort('descripcion')
  .populate('usuario', 'nombre email')
  .exec((err, categorias) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    Categoria.countDocuments((err, conteo) => {
      res.json({
        ok: true,
        categorias,
        conteo
      });
    })
  });
});

// Filtrar categoría por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoría no encontrada'
        }
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  }).populate('usuario', 'nombre email');
});

// Crear categoría
app.post('/categoria', [verificaToken, verificaAdminRol], (req, res) => {
  const body = req.body;
  const categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });
  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Actualizar categoría
app.put('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['descripcion']);
  const opts = {
    new: true,
    runValidators: true
  };
  Categoria.findByIdAndUpdate(id, body, opts,
  (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  })
});

// Eliminar categoría
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {
  const id = req.params.id;
  Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    if (!categoriaEliminada) {
      return res.status(400).json({
        ok: false,
        err: {
          message: `Categoría no encontrada`
        }
      });
    }
    res.json({
      ok: true,
      message: 'Categoría eliminada',
      categoria: categoriaEliminada
    });
  });
});

module.exports = app;