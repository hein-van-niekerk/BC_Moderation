
import 'dotenv/config';
import sql from 'mssql';

const config: sql.config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_SERVER || 'localhost',
  database: process.env.SQLSERVER_DATABASE,
  port: parseInt(process.env.SQLSERVER_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

console.log('DB config:', config);

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config:', err));

export default sql;
