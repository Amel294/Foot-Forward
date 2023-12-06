const express = require("express");
const router = express.Router();
const countofOrder = require("../../middleware/countNoOfOrders")








router.get('/admin', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/dashboard', async (req, res) => {
    try {
        const TotalOrdergetOrders = await countofOrder.getOrders('admin123', 'day', '2023-11-30 ');
        console.log(TotalOrdergetOrders);
        res.render('dashboard', { activeRoute: 'dashboard' });
    } catch (error) {
        console.error('Error:', error);
        // Handle errors (e.g., show an error page)
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

