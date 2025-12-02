import 'dotenv/config';

// Configuração de conexão com o banco de dados PostgreSQL.
// Utiliza variáveis de ambiente, mas fornece os valores padrão solicitados como fallback.

export const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    
    // Usuário padrão conforme solicitado
    user: process.env.DB_USER || 'portal_user',
    
    // Senha deve vir preferencialmente do .env, mas deixamos vazio ou um default seguro se necessário
    password: process.env.DB_PASSWORD || 'password', 
    
    // Nome do banco padrão conforme solicitado
    database: process.env.DB_NAME || 'portal_transportador',
    
    // SSL deve ser ativado apenas em produção (ex: Heroku, AWS RDS, Neon, Supabase)
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10
  }
};
