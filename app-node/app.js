const express = require('express');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('./config');

const app = express();
app.use(express.json());

// Log de inicialização do servidor demonstrando o uso de configurações
console.log(`[INFO] Conectando à nuvem utilizando a chave AWS: ${config.aws.accessKeyId}`);
console.log(`[INFO] Conectando ao MongoDB utilizando a string: ${config.database.connectionString}`);

// Rota padrão do laboratório acadêmico
app.get('/', (req, res) => {
  res.json({
    message: 'Laboratório Acadêmico de Segurança Ofensiva - DevSecOps',
    status: 'online',
    scanners: ['OSV-Scanner', 'Grype', 'Gitleaks'],
    integration: 'MergeStat + PostgreSQL + Grafana'
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Aplicacao do laboratorio rodando na porta ${PORT}`);
});
