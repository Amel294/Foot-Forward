const express = require('express');
const app = express();
const morgan = require('morgan')
const nocache = require("nocache");
const port = 3000;
const dotenv = require("dotenv");
const connectDB = require("./server/database/connection")
const cors = require("cors")
const multer = require('multer')
const sharp = require('sharp')
const session = require('express-session');





app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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

const orders = [
    { id: '95954', date: 'Jun 4, 2020', status: 'On Hold', name: 'Arnold Armstrong', items: 3, amount: 249.75 },
    { id: '95955', date: 'Jun 5, 2020', status: 'Delivered', name: 'Bella Swan', items: 2, amount: 150.00 },
    { id: '95956', date: 'Jun 6, 2020', status: 'Shipped', name: 'Charlie Chaplin', items: 5, amount: 400.00 },
    { id: '95957', date: 'Jun 7, 2020', status: 'Processing', name: 'Diana Prince', items: 1, amount: 100.00 },
    { id: '95958', date: 'Jun 8, 2020', status: 'Cancelled', name: 'Edward Cullen', items: 4, amount: 320.50 },
    { id: '95959', date: 'Jun 9, 2020', status: 'On Hold', name: 'Frank Sinatra', items: 2, amount: 180.00 },
    { id: '95960', date: 'Jun 10, 2020', status: 'Delivered', name: 'Grace Kelly', items: 6, amount: 460.00 },
    { id: '95961', date: 'Jun 11, 2020', status: 'Shipped', name: 'Hank Moody', items: 3, amount: 260.00 },
    { id: '95962', date: 'Jun 12, 2020', status: 'Processing', name: 'Irene Adler', items: 4, amount: 300.00 },
    { id: '95963', date: 'Jun 13, 2020', status: 'Cancelled', name: 'Jack Daniels', items: 1, amount: 90.00 }
];

// Include route files
const dashboardRoutes = require('./server/router/adminRoute/dashboard');
const ordersRoutes = require('./server/router/adminRoute/orders');
const productsRoutes = require('./server/router/adminRoute/products');
const addProductsRoutes = require('./server/router/adminRoute/addProducts');
const addVarientsRoutes = require('./server/router/adminRoute/addVarients');
const customersRoutes = require('./server/router/adminRoute/customers');
const attributesRoutes = require('./server/router/adminRoute/attributes');
// Use route files
app.use('/admin', dashboardRoutes);
app.use('/admin', ordersRoutes);
app.use('/admin', productsRoutes);
app.use('/admin', addProductsRoutes);
app.use('/admin', addVarientsRoutes);
app.use('/admin', customersRoutes);
app.use('/admin', attributesRoutes);
// Routes
// app.use('/admin', require('./server/router/adminRouter'))
app.use('/attributes', require('./server/router/attributeRouter'))
app.use('/', require('./server/router/userRoute'))







// Start the server

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${ port }`);
});