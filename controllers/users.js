const express = require('express')
const router = express.Router()
const User = require('../models/user') // Assuming you have a User model
const Recipe = require('../models/recipe')
const isSignedIn = require('../middleware/is-signed-in')

// List all users
router.get('/', isSignedIn, async (req, res) => {
  try {
    const users = await User.find()
    res.render('users/index.ejs', { users, error: null })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.render('users/index.ejs', { users: [], error: 'Failed to load users.' })
  }
})

// Show recipes of a specific user
router.get('/:id', isSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw new Error('User not found')
    const recipes = await Recipe.find({ owner: user._id }).populate(
      'ingredients'
    )
    res.render('users/show.ejs', { user, recipes, error: null })
  } catch (err) {
    console.error('Error fetching user or recipes:', err)
    res.render('users/show.ejs', {
      user: null,
      recipes: [],
      error: 'Failed to load user recipes.'
    })
  }
})

module.exports = router
