const express = require('express')
const router = express.Router()
const Ingredient = require('../models/ingredient')
const isSignedIn = require('../middleware/is-signed-in')

// Show all ingredients (GET /ingredients)
router.get('/', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render('ingredients/index.ejs', { ingredients })
  } catch (err) {
    console.error('Error fetching ingredients:', err)
    res.redirect('/')
  }
})

// Render form to add a new ingredient (GET /ingredients/new)
router.get('/new', isSignedIn, (req, res) => {
  res.render('ingredients/new.ejs')
})

// Add a new ingredient via form submission (POST /ingredients)
router.post('/', isSignedIn, async (req, res) => {
  if (!req.body.name || req.body.name.trim() === '') {
    return res.redirect('/ingredients/new')
  }

  try {
    const newIngredient = new Ingredient({ name: req.body.name.trim() })
    await newIngredient.save()
    res.redirect('/ingredients')
  } catch (err) {
    console.error('Error creating ingredient:', err)
    res.redirect('/ingredients/new')
  }
})

// Delete an ingredient (DELETE /ingredients/:id)
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
