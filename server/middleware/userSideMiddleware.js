
exports.isUserLogged = (req, res, next) => {

    if (req.session.user && req.session.user.isActive) {
        // User is authenticated and active, allow access to other routes
        next();
    } else {
        // Redirect unauthenticated or inactive users to the root route
        res.redirect('/signin');
    }
}

