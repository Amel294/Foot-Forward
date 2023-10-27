const express = require("express");
const router = express.Router();

router.get('/addProducts', (req, res) => {
    res.render('addProducts', { activeRoute: 'addProducts' });
});

module.exports = router;
