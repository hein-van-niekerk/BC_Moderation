require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_SERVER,
  database: process.env.SQLSERVER_DATABASE,
  port: parseInt(process.env.SQLSERVER_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

sql.connect(config)
  .then(pool => {
    console.log('Connected to SQL Server!');
    return pool.close();
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });