const express = require("express");
const router = express.Router();
const User = require("../model/userDB");

router.use('/static', express.static('static'));

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

// Middleware to retrieve user data and set it in res.locals
const getUserDataMiddleware = async (req, res, next) => {
    try {
      const users = await User.find(); // Retrieve all users from the database
      res.locals.userData = users; // Store user data in res.locals for later access
      console.log('User data retrieved:', users); // Debug log to check if data is fetched
      next(); // Call the next middleware or route
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

router.get('/admin', (req, res) => {
    res.redirect('/dashboard')
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { activeRoute: 'dashboard' });
});

router.get('/orders', (req, res) => {
    res.render('orders', { activeRoute: 'orders', orders: orders });
});

router.get('/products', (req, res) => {
    const products = [
        { "imgSrc": "static/images/product/a.png", "title": "Pink Fitness Tracker", "id": "UY3749", "price": "$ 99.49", "quantity": "49", "tags": "Fitbit, Tracker" },
        { "imgSrc": "static/images/product/b.png", "title": "Blue Water Bottle", "id": "UY3750", "price": "$ 19.99", "quantity": "100", "tags": "Bottle, Gym" },
        { "imgSrc": "static/images/product/c.png", "title": "Gym Gloves", "id": "UY3751", "price": "$ 15.49", "quantity": "200", "tags": "Gloves, Gym" },
        { "imgSrc": "static/images/product/d.png", "title": "Yoga Mat", "id": "UY3752", "price": "$ 25.49", "quantity": "150", "tags": "Yoga, Gym" },
        { "imgSrc": "static/images/product/e.png", "title": "Dumbbells Set", "id": "UY3753", "price": "$ 55.99", "quantity": "80", "tags": "Dumbbells, Gym" },
        { "imgSrc": "static/images/product/f.png", "title": "Running Shoes", "id": "UY3754", "price": "$ 70.49", "quantity": "120", "tags": "Shoes, Running" },
        { "imgSrc": "static/images/product/g.png", "title": "Fitness Band", "id": "UY3755", "price": "$ 40.99", "quantity": "90", "tags": "Band, Fitness" },
        { "imgSrc": "static/images/product/h.png", "title": "Protein Shake", "id": "UY3756", "price": "$ 30.49", "quantity": "110", "tags": "Protein, Gym" },
        { "imgSrc": "static/images/product/i.png", "title": "Cycling Helmet", "id": "UY3757", "price": "$ 45.99", "quantity": "70", "tags": "Helmet, Cycling" },
        { "imgSrc": "static/images/product/j.png", "title": "Tennis Racket", "id": "UY3758", "price": "$ 80.49", "quantity": "65", "tags": "Tennis, Racket" }
    ];
    res.render('products', { products, activeRoute: 'products' });
});

router.get('/addProducts', (req, res) => {
    res.render('addProducts', { activeRoute: '' });
});

router.get('/addVarients', (req, res) => {
    res.render('addVarients', { activeRoute: '' });
});

// Define the number of items to display per page
const itemsPerPage = 10; // Adjust this according to your needs

// Function to calculate the total number of pages
function calculateTotalPages(userDataLength) {
    return Math.ceil(userDataLength / itemsPerPage);
  }
  

// Route for rendering the customers with pagination
router.get('/customers/:page', getUserDataMiddleware, async (req, res) => {
    const currentPage = parseInt(req.params.page) || 1; // Get the current page from the URL parameter
    const totalPages = calculateTotalPages(res.locals.userData.length);
  
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedCustomers = res.locals.userData.slice(startIdx, endIdx);
  
    // Map the user data to customer data
    const customerData = paginatedCustomers.map((customer) => {
      return {
        customerName: customer.customerName, // Replace with the appropriate field from your user data
        lastOrderDate: getLastOrderDate(customer.customerId), // Replace with your logic to get the last order date
        customerPhone: customer.customerPhone, // Replace with the appropriate field from your user data
        customerEmail: customer.customerEmail, // Replace with the appropriate field from your user data
      };
    });
  
    res.render('customers', {
        userData: users, // Pass the user data
        currentPage,
        totalPages,
        prevPageUrl: currentPage > 1 ? `/customers/${currentPage - 1}` : null,
        nextPageUrl: currentPage < totalPages ? `/customers/${currentPage + 1}` : null,
        activeRoute: 'attributes'
      });
      
  });

// Function to get the last order date for a customer (replace this with your actual logic)
function getLastOrderDate(customerId) {
  // Replace this with your actual logic to retrieve the last order date
  // For demonstration purposes, we'll assume there's an orders array with order data
  const customerOrders = orders.filter(order => order.customerId === customerId);
  if (customerOrders.length > 0) {
    const lastOrder = customerOrders.reduce((prev, current) =>
      new Date(current.date) > new Date(prev.date) ? current : prev
    );
    return lastOrder.date;
  }
  // If no orders are found, return a default value or handle the case accordingly
  return 'No orders';
}

router.get('/attributes', (req, res) => {
  res.render('attributes', { activeRoute: 'attributes', brands });
});

module.exports = router;
