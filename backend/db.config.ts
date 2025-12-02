// ------------------------------------------------------------------
// CONFIGURAÇÃO DE CREDENCIAIS DO BANCO DE DADOS (POSTGRESQL)
// ------------------------------------------------------------------
// Este arquivo deve ficar no servidor (Backend), nunca exposto no Frontend.
// Utilize variáveis de ambiente (.env) para preencher estes valores.

export const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',     // IP do servidor Postgres
    port: process.env.DB_PORT || 5432,            // Porta Padrão
    user: process.env.DB_USER || 'postgres',      // Seu Usuário
    password: process.env.DB_PASSWORD || 'senha_segura', // Sua Senha
    database: process.env.DB_NAME || 'nfe_logistica_db', // Nome do Banco
    ssl: { rejectUnauthorized: false } // Necessário para alguns serviços de nuvem (AWS/Heroku)
  },
  pool: {
    min: 2,
    max: 10
  }
};

// Exemplo de uso com biblioteca 'pg' ou Knex.js:
// const { Client } = require('pg');
// const client = new Client(dbConfig.connection);
// await client.connect();
