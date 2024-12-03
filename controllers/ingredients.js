const express = require('express')
const router = express.Router()
const Ingredient = require('../models/ingredient')
const isSignedIn = require('../middleware/is-signed-in')

// Show all ingredients (GET /ingredients)
router.get('/', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render('ingredients/index.ejs', {
      ingredients,
      success: req.query.success,
      error: req.query.error
    })
  } catch (err) {
    console.error('Error fetching ingredients:', err)
    res.redirect('/?error=Failed to load ingredients.')
  }
})

// Render form to add a new ingredient (GET /ingredients/new)
router.get('/new', isSignedIn, (req, res) => {
  res.render('ingredients/new.ejs', { error: req.query.error })
})

// Add a new ingredient via form submission (POST /ingredients)
router.post('/', isSignedIn, async (req, res) => {
  if (!req.body.name || req.body.name.trim() === '') {
    return res.redirect('/ingredients/new?error=Ingredient name is required.')
  }

  try {
    const newIngredient = new Ingredient({ name: req.body.name.trim() })
    await newIngredient.save()
    res.redirect('/ingredients?success=Ingredient added successfully!')
  } catch (err) {
    console.error('Error creating ingredient:', err)
    res.redirect('/ingredients/new?error=Failed to add ingredient.')
  }
})

// Fetch all ingredients as JSON (GET /ingredients/list)
router.get('/list', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.status(200).json(ingredients) // Return ingredients as JSON
  } catch (err) {
    console.error('Error fetching ingredients:', err)
    res.status(500).json({ error: 'Failed to fetch ingredients' })
  }
})

// Delete an ingredient (DELETE /ingredients/:id)
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    const recipesUsingIngredient = await Recipe.find({
      ingredients: req.params.id
    })
    if (recipesUsingIngredient.length > 0) {
      return res.redirect(
        '/ingredients?error=Cannot delete ingredient. It is used in one or more recipes.'
      )
    }

    await Ingredient.findByIdAndDelete(req.params.id)
    res.redirect('/ingredients?success=Ingredient deleted successfully!')
  } catch (err) {
    console.error('Error deleting ingredient:', err)
    res.redirect('/ingredients?error=Failed to delete ingredient.')
  }
})

module.exports = router
