const dotenv = require(`dotenv`);
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, //"127.0.0.1",
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, //"127.0.0.1",
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
  production: {
    username: "sql12721256",
    password: "rrs8Syvkrt",
    database: "sql12721256",
    host: "sql12.freesqldatabase.com", //"127.0.0.1",
    port: "3306",
    dialect: "postgres",
  },
};
