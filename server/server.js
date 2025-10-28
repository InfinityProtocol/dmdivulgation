const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const iniciarBot = require('./bot');

const app = express();
const port = 3000;

const loadPastebinContent = async () => {
  const pastebinUrl = 'https://pastebin.com/raw/REKXHA8P';

  try {
    const response = await axios.get(pastebinUrl);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar conteúdo do Pastebin:', error);
    return 'Conteúdo não disponível no momento.';
  }
};

const authenticateIP = async (req, res, next) => {
  const clientIP = req.connection.remoteAddress || req.ip;

  console.log('IP Capturado:', clientIP);

  const pastebinContent = await loadPastebinContent();
  
  if (typeof pastebinContent === 'string') {
    const allowedIPs = pastebinContent.split('\n').map(ip => ip.trim());

    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.sendFile(path.join(__dirname, '403.html'));
    }
  } else {
    console.error('O conteúdo do Pastebin não é uma string válida');
    res.sendFile(path.join(__dirname, '403.html')); 
  }
};

app.use(authenticateIP);

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/enviar-mensagem', (req, res) => {
  const { token, guildId, quantidade, delay, mensagem } = req.body;

  let statusMessages = [];

  const callback = (statusMessage) => {
    statusMessages.push(statusMessage);
  };

  iniciarBot(token, guildId, parseInt(quantidade), parseFloat(delay), mensagem, callback);

  setTimeout(() => {
    res.json(statusMessages);
  }, 10000);
});

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

