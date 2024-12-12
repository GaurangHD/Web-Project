const jwt = require('jsonwebtoken');
const User = require('../models/user');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const COOKIE_OPTIONS = { httpOnly: true, secure: false, sameSite: 'strict' }; // Adjust for production

// Register a new user (API and view)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    
    res.render('login', { message: 'Registration successful! Please login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user (API and view)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookies
    res.cookie('token', token, { ...COOKIE_OPTIONS, maxAge: 3600000 });

    
    res.redirect('/api/airbnbs');
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout user (API and view)
const logoutUser = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  

  // If the request is from the view, render the login page
  res.redirect('/api/users/login'); // Adjust this redirect to your login page
};

// Render Register page
const renderRegisterPage = (req, res) => {
  res.render('register');
};

// Render Login page
const renderLoginPage = (req, res) => {
  res.render('login');
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  renderRegisterPage,
  renderLoginPage,
};
