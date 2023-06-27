const express = require('express');
const http = require('http');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // define um período de janela de 15 minutos
    max: 100, // define o limite máximo de solicitações permitidas por janela
});

// Aplica o limite de taxas a todas as rotas
app.use(limiter);

// Lista de endereços IP permitidos
const allowedIPs = ['192.168.1.114'];

app.use(express.static(path.join(__dirname, '../client/')));

// Middleware para verificar o endereço IP permitido
const checkAllowedIP = (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (allowedIPs.includes(clientIP)) {
        // IP permitido, continue para o próximo middleware ou rota
        next();
    } else {
        // IP não permitido, envie uma resposta de acesso negado
        res.status(403).send('Acesso negado.');
    }
};

app.get('/', checkAllowedIP, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/', 'index.html'));
});

app.get('/login', checkAllowedIP, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/', 'login.html'));
});

// Permitir que o sistema escolha automaticamente a porta disponível
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor HTTP iniciado na porta ${port}`);
});