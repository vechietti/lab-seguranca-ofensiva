const express = require('express');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { exec } = require('child_process');
const config = require('./config');

const app = express();
app.use(express.json());

// VULNERABILIDADE 1: Desabilita globalmente a validação de certificados SSL/TLS (Insecure Connection)
// Comum em ambientes de desenvolvimento que acaba indo para produção.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// VULNERABILIDADE 2: Uso de chaves e segredos em texto claro a partir do arquivo config.js
console.log(`[INFO] Conectando à nuvem utilizando a chave AWS: ${config.aws.accessKeyId}`);
console.log(`[INFO] Conectando ao MongoDB utilizando a string: ${config.database.connectionString}`);

// Rota padrão
app.get('/', (req, res) => {
  res.send('Laboratório Acadêmico de Segurança Ofensiva - SAST/SCA/Secrets');
});

// VULNERABILIDADE 3: Injeção de Comando (Command Injection)
// Recebe uma entrada do usuário direta e passa para o console do sistema operacional.
app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // ALVO SAST: Executa diretamente a string fornecida pelo usuário
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout });
  });
});

// VULNERABILIDADE 4: Execução Insegura de Código (Eval Injection)
// Executa JavaScript dinamicamente recebido na requisição.
app.post('/calculate', (req, res) => {
  const formula = req.body.formula;
  
  try {
    // ALVO SAST: Uso de eval() é extremamente perigoso e aciona a maioria dos scanners SAST
    const result = eval(formula);
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// VULNERABILIDADE 5: SSRF (Server-Side Request Forgery)
// Permite que o servidor faça requisições arbitrárias para qualquer URL fornecida.
app.get('/fetch-url', async (req, res) => {
  const url = req.query.url;
  
  try {
    // ALVO SAST: Requisição externa para URL fornecida pelo usuário, vulnerável a SSRF e port scanning interno
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send(`Erro ao buscar URL: ${error.message}`);
  }
});

// VULNERABILIDADE 6: Assinatura/Verificação Insegura de JWT
// O servidor assina tokens sem criptografia adequada ou usando algoritmo fraco.
app.post('/login', (req, res) => {
  const payload = { username: req.body.username, role: 'user' };
  
  // ALVO SAST: Assinatura de JWT sem verificação rígida ou usando chave fraca
  // jwt.sign com chave muito fraca "secret123"
  const token = jwt.sign(payload, 'secret123', { expiresIn: '1h' });
  res.json({ token });
});

// VULNERABILIDADE 7: Uso inseguro do lodash desatualizado
// Prototype Pollution vulnerability
app.post('/update-profile', (req, res) => {
  const userProfile = {};
  const updates = req.body.updates; // Exemplo de ataque: {"__proto__": {"admin": true}}
  
  // ALVO SCA/SAST: lodash.merge vulnerável em versões antigas
  lodash.merge(userProfile, updates);
  res.json({ profile: userProfile });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Aplicacao vulneravel rodando na porta ${PORT}`);
});
