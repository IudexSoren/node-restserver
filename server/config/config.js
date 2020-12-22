// PUERTO
process.env.PORT = process.env.PORT || 3100;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos
let urlBD;

if (process.env.NODE_ENV === 'dev') {
  urlBD = 'mongodb://localhost:27017/cafe';
} else {
  urlBD = 'mongodb+srv://IudexSoren:tezYdNUfeQWUC7eJ@cluster0.x0nmg.mongodb.net/cafe';
}
process.env.URLDB = urlBD;