const express = require('express');
const router = express.Router();
const passport = require('passport');

// Injeção de dependências (será feita no index.js principal)
let userUseCases;

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await userUseCases.registerUser(name, email, password);
        res.json({ msg: 'User registered successfully', user: user });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) res.status(400).json({ msg: 'No user exists' });
        else {
            req.logIn(user, async err => {
                if (err) throw err;
                await userUseCases.updateUserOnlineStatus(user.id, true);
                res.json({ msg: 'Successfully Authenticated', user: user });
            });
        }
    })(req, res, next);
});

router.get('/logout', async (req, res, next) => {
    if (req.user) {
        await userUseCases.updateUserOnlineStatus(req.user.id, false);
    }
    req.logout(err => {
        if (err) { return next(err); }
        res.json({ msg: 'Successfully logged out' });
    });
});

router.get('/', async (req, res) => {
    try {
        const users = await userUseCases.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = (injectedUserUseCases) => {
    userUseCases = injectedUserUseCases;
    return router;
};