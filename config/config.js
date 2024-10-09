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
    username: "voosh_database_user",
    password: "8vNMKgI82W6pWP0L6yyCpUE3QNPnVwlp",
    database: "voosh_database",
    host: "postgresql://voosh_database_user:8vNMKgI82W6pWP0L6yyCpUE3QNPnVwlp@dpg-cqekdppu0jms739e4cag-a/voosh_database", //"127.0.0.1",
    port: "5432",
    dialect: "postgres",
  },
  production: {
    username: "voosh_database_user",
    password: "5VA8T9t6LnShzfmHVVGgEeo52hYxz6zq",
    database: "voosh_database_fc3z",
    host: "dpg-cs3470t6l47c73e9a8jg-a", //"127.0.0.1",
    port: "5432",
    dialect: "postgres",
  },
};
