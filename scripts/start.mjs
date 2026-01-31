// Wrapper para iniciar o servidor em produção por padrão
// - Se NODE_ENV não estiver definido, força "production"
// - Em seguida, carrega a saída empacotada em dist/index.js (ESM)

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Import dinâmico para garantir execução do entrypoint ESM gerado
await import('../dist/index.js');
