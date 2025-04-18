const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios'); // Para carregar o conteúdo do Pastebin
const iniciarBot = require('./bot');

const app = express();
const port = 3000;

// Função para carregar conteúdo do Pastebin (para IPs autorizados e conteúdo dinâmico)
const loadPastebinContent = async () => {
  const pastebinUrl = 'https://pastebin.com/raw/REKXHA8P'; // URL do seu Pastebin

  try {
    const response = await axios.get(pastebinUrl);
    return response.data;  // Retorna o conteúdo do Pastebin
  } catch (error) {
    console.error('Erro ao carregar conteúdo do Pastebin:', error);
    return 'Conteúdo não disponível no momento.';
  }
};

// Middleware para autenticação de IP a partir do Pastebin
const authenticateIP = async (req, res, next) => {
  const clientIP = req.connection.remoteAddress || req.ip;

  console.log('IP Capturado:', clientIP);

  // Carregar os IPs permitidos do Pastebin
  const pastebinContent = await loadPastebinContent();
  
  // Se o conteúdo do pastebin for uma string, divide pelos IPs
  if (typeof pastebinContent === 'string') {
    const allowedIPs = pastebinContent.split('\n').map(ip => ip.trim()); // Converte conteúdo em lista de IPs

    if (allowedIPs.includes(clientIP)) {
      next(); // IP permitido
    } else {
      res.sendFile(path.join(__dirname, '403.html')); // Redirecionar para página de erro 403
    }
  } else {
    // Caso o conteúdo não seja uma string, gera um erro
    console.error('O conteúdo do Pastebin não é uma string válida');
    res.sendFile(path.join(__dirname, '403.html')); // Redireciona para erro
  }
};

// Usar o middleware para autenticação antes das rotas
app.use(authenticateIP);

// Para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Para lidar com dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rota para processar o envio do bot
app.post('/enviar-mensagem', (req, res) => {
  const { token, guildId, quantidade, delay, mensagem } = req.body;

  let statusMessages = []; // Armazenar as mensagens de status

  // Função para coletar mensagens de status
  const callback = (statusMessage) => {
    statusMessages.push(statusMessage); // Armazena cada mensagem de status
  };

  // Chama o bot e passa a função de callback para coletar as mensagens de status
  iniciarBot(token, guildId, parseInt(quantidade), parseFloat(delay), mensagem, callback);

  // Responde quando o processo do bot terminar (usamos um setTimeout aqui apenas para simulação)
  setTimeout(() => {
    // Envia todas as mensagens de status ao frontend
    res.json(statusMessages);
  }, 10000); // Ajuste o tempo dependendo de quanto tempo você espera o bot executar
});

// Rota principal
app.get('/', async (req, res) => {
  const pastebinContent = await loadPastebinContent();

  res.send(`
    <html>
      <head><title>Site Dinâmico</title></head>
      <body>
        <h1>Bem-vindo ao Site!</h1>
        <div>
          <h2>Conteúdo Dinâmico:</h2>
          <p id="pastebinContent">${pastebinContent}</p>
        </div>
      </body>
    </html>
  `);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
