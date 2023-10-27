const express = require("express");
const router = express.Router();

router.get('/addVarients', (req, res) => {
    res.render('addVarients', { activeRoute: 'addVarients' });
});

module.exports = router;
