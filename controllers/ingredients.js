const express = require('express')
const router = express.Router()
const Ingredient = require('../models/ingredient')
const isSignedIn = require('../middleware/is-signed-in')

// Show all ingredients
router.get('/', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render('ingredients/index.ejs', { ingredients })
  } catch (err) {
    console.error('Error fetching ingredients:', err)
    res.redirect('/')
  }
})

// Render new ingredient form
router.get('/new', isSignedIn, (req, res) => {
  res.render('ingredients/new.ejs')
})

// Add a new ingredient
router.post('/', isSignedIn, async (req, res) => {
  try {
    const newIngredient = new Ingredient(req.body)
    await newIngredient.save()
    res.redirect('/ingredients')
  } catch (err) {
    console.error('Error creating ingredient:', err)
    res.redirect('/ingredients/new')
  }
})

// Delete an ingredient
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id)
    res.redirect('/ingredients')
  } catch (err) {
    console.error('Error deleting ingredient:', err)
    res.redirect('/ingredients')
  }
})

module.exports = router
