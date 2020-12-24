const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificaTokenArchivo} = require('../middlewares/authentication');
const app = express();

app.get('/arch/:tipo/:arc', verificaTokenArchivo, (req, res) => {
  const tipo = req.params.tipo;
  const archivo = req.params.arc;

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
  let pathArchivo = path.resolve(__dirname, `../../uploads/${tipo}/${archivo}`);
  if (fs.existsSync(pathArchivo)) {
    res.sendFile(pathArchivo);
  } else {
    const noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
    res.sendFile(noImagePath);
  }
})

module.exports = app;