const express = require("express");
const router = express.Router();

router.get('/admin', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { activeRoute: 'dashboard' });
});

module.exports = router;

