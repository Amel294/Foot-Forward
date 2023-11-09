const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController")
router.post('/add-address',dashboardController.addAddress)
router.post('/edit-profile', dashboardController.editProfile);
module.exports = router;
