const express = require("express");
const router = express.Router();
const brands = [
    // ... Your brands data ...
];
router.get('/attributes', (req, res) => {
    res.render('attributes', { activeRoute: 'attributes', brands });
});

module.exports = router;
