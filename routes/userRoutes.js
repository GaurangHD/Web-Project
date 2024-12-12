const express = require('express');
const { registerUser, loginUser, logoutUser ,renderRegisterPage,
    renderLoginPage } = require('../controllers/usercontroller');

const router = express.Router();

// Routes
router.get('/register', renderRegisterPage); // Render register page
router.get('/login', renderLoginPage); // Render log
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

module.exports = router;
