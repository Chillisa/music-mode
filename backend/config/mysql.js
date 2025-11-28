// config/mysql.js
const mysql = require('mysql2/promise');

let pool;

const connectMySQL = async () => {
  if (pool) return pool; // already connected

  try {
    pool = await mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log('✅ MySQL connected');
    return pool;
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
    throw err;
  }
};

const getMySQLPool = () => {
  if (!pool) {
    throw new Error('MySQL pool not initialized. Call connectMySQL() first.');
  }
  return pool;
};

module.exports = connectMySQL;
module.exports.getMySQLPool = getMySQLPool;
