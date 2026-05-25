// Cuidado: Segredos expostos intencionalmente para fins de teste com Gitleaks
module.exports = {
  // Configurações gerais da aplicação
  PORT: process.env.PORT || 3000,
  ENV: 'production',

  // Provedor de Nuvem (AWS) - Chaves fictícias mas no formato correto detectado pelo Gitleaks
  aws: {
    accessKeyId: 'AKIA2V4B5C6D7E8F9G0H', // AWS Access Key (Padrão AKIA...)
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', // AWS Secret Key (40 chars)
    region: 'us-east-1'
  },

  // Integração com o GitHub
  github: {
    token: 'ghp_mockSecretTokenForGithubScanners12345', // GitHub PAT (Padrão ghp_...)
    orgName: 'acme-academic-lab'
  },

  // Credenciais de Banco de Dados Local
  database: {
    // String de conexão com usuário e senha em texto claro
    connectionString: 'mongodb://db_admin:P@ssw0rd123_db@database-server.internal.net:27017/production_db'
  }
};
