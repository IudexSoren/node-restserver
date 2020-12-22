// PUERTO
process.env.PORT = process.env.PORT || 3100;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Vencimiento del token
/**
 * 60 seg
 * 60 min
 * 24 h
 * 30 d
 */
process.env.TOKEN_EXPIRES = 60 * 60 * 24 * 30;

// Seed
process.env.SEED = process.env.SEED || 'secret-desarrollo';

// Base de datos
let urlBD;
if (process.env.NODE_ENV === 'dev') {
  urlBD = 'mongodb://localhost:27017/cafe';
} else {
  urlBD = process.env.MONGO_URI;
}
process.env.URLDB = urlBD;