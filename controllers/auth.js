const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Render Sign-Up Page
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs', { error: null });
});

// Handle Sign-Up Form Submission
router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.render('auth/sign-up.ejs', { error: 'Username already taken.' });
    }

    // Check if passwords match
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('auth/sign-up.ejs', { error: 'Passwords do not match.' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect('/auth/sign-in');
  } catch (error) {
    console.error('Sign-up error:', error);
    res.render('auth/sign-up.ejs', { error: 'Something went wrong. Please try again.' });
  }
});

// Render Sign-In Page
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs', { error: null });
});

// Handle Sign-In Form Submission
router.post('/sign-in', async (req, res) => {
  try {
    // Check if user exists
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.render('auth/sign-in.ejs', { error: 'Invalid username or password.' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, userInDatabase.password);
    if (!validPassword) {
      return res.render('auth/sign-in.ejs', { error: 'Invalid username or password.' });
    }

    // Set session and redirect
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };
    res.redirect('/');
  } catch (error) {
    console.error('Sign-in error:', error);
    res.render('auth/sign-in.ejs', { error: 'Something went wrong. Please try again.' });
  }
});

// Handle Sign-Out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
