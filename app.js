const express = require('express');
const app = express();
const morgan = require('morgan')
const nocache = require("nocache");
const dotenv = require("dotenv");
const connectDB = require("./server/database/connection")
const cors = require("cors")
const multer = require('multer')
const sharp = require('sharp')
const session = require('express-session');
const mongoose = require('mongoose');




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    origin: 'http://localhost:3000',
    // Other CORS options if needed
};
app.use(session({
    secret: 'your-secret-key', // Change this to a strong secret key
    resave: false,
    saveUninitialized: true
}));




dotenv.config({ path: '.env' });
app.use(morgan('dev'));
app.use(nocache());
// app.use(morgan('combined'));
// Set EJS as view engine
app.set('view engine', 'ejs');
//mongoDB connection
connectDB();









// Serve static files
app.use('/static', express.static('static'));
// app.use(express.static('static'));

 




// Include route files
const dashboardRoutes = require('./server/router/adminRoute/dashboard');
const ordersRoutes = require('./server/router/adminRoute/orders');
const productsRoutes = require('./server/router/adminRoute/products');
const addVarientsRoutes = require('./server/router/adminRoute/addVarients');
const customersRoutes = require('./server/router/adminRoute/customers');
const attributesRoutes = require('./server/router/adminRoute/attributes');
const addProduct = require('./server/router/adminRoute/addproduct')
const adminlogin = require('./server/router/adminRoute/login')
const editProduct = require('./server/router/adminRoute/editProduct')
const banner = require('./server/router/adminRoute/banner')
const coupon = require('./server/router/adminRoute/coupon')
const offer = require('./server/router/adminRoute/offer')
function checkAdminSession(req, res, next) {
    if (req.session.admin) {
    next();
    } else {
    res.redirect('/admin/login');
    }
}
// Use route files
app.use('/admin', adminlogin)
app.use('/admin', checkAdminSession, dashboardRoutes);
app.use('/admin', checkAdminSession, ordersRoutes);
app.use('/admin', checkAdminSession, productsRoutes);
app.use('/admin', checkAdminSession, addVarientsRoutes);
app.use('/admin', checkAdminSession, customersRoutes);
app.use('/admin', checkAdminSession, attributesRoutes);
app.use('/admin', checkAdminSession, addProduct)
app.use('/admin', checkAdminSession, banner)
app.use('/admin', checkAdminSession, coupon)
app.use('/admin', checkAdminSession, offer)
app.use('/admin',editProduct)

// Routes



// app.use('/admin', require('./server/router/adminRouter'))
app.use('/attributes', require('./server/router/attributeRouter'))
app.use('/', require('./server/router/userRoute'))
app.use('/user', require('./server/router/userDashboard'))






// Start the server

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${ process.env.PORT }`);
});