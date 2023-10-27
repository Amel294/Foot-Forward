const express = require("express");
const router = express.Router()


router.use('/static', express.static('static'));
// router.use(express.static('static'));

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

const brands = [
    { name: 'Nike', initials: 'NI' },
    { name: 'Adidas', initials: 'AD' },
    { name: 'Adidas', initials: 'AD' },
    // ... other brands
];

// Routes

router.get ('/admin',(req,res)=>{
    res.redirect('/dashboard')
})
router.get('/dashboard', (req, res) => {
    res.render('dashboard', {activeRoute: 'dashboard'});
});

router.get('/orders', (req, res) => {
    res.render('orders', {activeRoute: 'orders',orders: orders });
});

router.get('/products', (req, res) => {
    const products = [
        {"imgSrc": "static/images/product/a.png", "title": "Pink Fitness Tracker", "id": "UY3749", "price": "$ 99.49", "quantity": "49", "tags": "Fitbit, Tracker"},
        {"imgSrc": "static/images/product/b.png", "title": "Blue Water Bottle", "id": "UY3750", "price": "$ 19.99", "quantity": "100", "tags": "Bottle, Gym"},
        {"imgSrc": "static/images/product/c.png", "title": "Gym Gloves", "id": "UY3751", "price": "$ 15.49", "quantity": "200", "tags": "Gloves, Gym"},
        {"imgSrc": "static/images/product/d.png", "title": "Yoga Mat", "id": "UY3752", "price": "$ 25.49", "quantity": "150", "tags": "Yoga, Gym"},
        {"imgSrc": "static/images/product/e.png", "title": "Dumbbells Set", "id": "UY3753", "price": "$ 55.99", "quantity": "80", "tags": "Dumbbells, Gym"},
        {"imgSrc": "static/images/product/f.png", "title": "Running Shoes", "id": "UY3754", "price": "$ 70.49", "quantity": "120", "tags": "Shoes, Running"},
        {"imgSrc": "static/images/product/g.png", "title": "Fitness Band", "id": "UY3755", "price": "$ 40.99", "quantity": "90", "tags": "Band, Fitness"},
        {"imgSrc": "static/images/product/h.png", "title": "Protein Shake", "id": "UY3756", "price": "$ 30.49", "quantity": "110", "tags": "Protein, Gym"},
        {"imgSrc": "static/images/product/i.png", "title": "Cycling Helmet", "id": "UY3757", "price": "$ 45.99", "quantity": "70", "tags": "Helmet, Cycling"},
        {"imgSrc": "static/images/product/j.png", "title": "Tennis Racket", "id": "UY3758", "price": "$ 80.49", "quantity": "65", "tags": "Tennis, Racket"}
    ];
    res.render('products', {products, activeRoute: 'products'});
});


router.get('/addProducts', (req, res) => {
    res.render('addProducts',{activeRoute: ''});
});
router.get('/addVarients', (req, res) => {
    res.render('addVarients',{activeRoute: ''});
});


const customers = [
    {
        "name": "Victoria Lynch",
        "email": "victoria@example.com",
        "amount": "59,400.68",
        "currency": "USD",
        "phone": "+811 985-4846",
        "country": "India",
        "date": "15 Jan 2020",
        "status": "Active"
    },
    {
        "name": "Patrick Newman",
        "email": "patrick@example.com",
        "amount": "30.00",
        "currency": "USD",
        "phone": "+942 238-4474",
        "country": "United Kindom",
        "date": "08 Jan 2020",
        "status": "Active"
    },
    {
        "name": "Jane Harris",
        "email": "harris@example.com",
        "amount": "5,530.23",
        "currency": "USD",
        "phone": "+123 447-2384",
        "country": "Bangladesh",
        "date": "02 Jan 2020",
        "status": "Pending"
    },
    {
        "name": "Emma Walker",
        "email": "walker@example.com",
        "amount": "55.00",
        "currency": "USD",
        "phone": "+463 471-7173",
        "country": "India",
        "date": "25 Dec 2019",
        "status": "Active"
    },
    {
        "name": "Jane Montgomery",
        "email": "jane84@example.com",
        "amount": "0.00",
        "currency": "USD",
        "phone": "+439 271-5360",
        "country": "Canada",
        "date": "01 Feb 2020",
        "status": "Suspend"
    },
    {
        "name": "Frances Burns",
        "email": "frances@example.com",
        "amount": "42.50",
        "currency": "USD",
        "phone": "+639 130-3150",
        "country": "Australia",
        "date": "31 Jan 2020",
        "status": "Active"
    },
    {
        "name": "Alan Butler",
        "email": "butler@example.com",
        "amount": "440.34",
        "currency": "USD",
        "phone": "+963 309-1706",
        "country": "United State",
        "date": "18 Jan 2020",
        "status": "Inactive"
    }
]

router.get('/customers', (req, res) => {
    res.render('customers', { customers: customers, activeRoute: 'customers' });
});


router.get('/attributes',(req,res)=>{
    res.render('attributes',{activeRoute: 'attributes', brands })
})



module.exports = router;