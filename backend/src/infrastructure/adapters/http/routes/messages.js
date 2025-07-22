const express = require('express');
const router = express.Router();

// Injeção de dependências (será feita no index.js principal)
let messageUseCases;

router.post('/', async (req, res) => {
    const { from, to, message } = req.body;
    try {
        const savedMessage = await messageUseCases.sendMessage(from, to, message);
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:user1Id/:user2Id', async (req, res) => {
    const { user1Id, user2Id } = req.params;
    try {
        const messages = await messageUseCases.getMessagesBetweenUsers(user1Id, user2Id);
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = (injectedMessageUseCases) => {
    messageUseCases = injectedMessageUseCases;
    return router;
};