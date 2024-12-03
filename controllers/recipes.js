const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const Ingredient = require('../models/ingredient')
const isSignedIn = require('../middleware/is-signed-in')

// Show all recipes
router.get('/', isSignedIn, async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.session.user._id }).populate(
      'ingredients'
    )
    res.render('recipes/index.ejs', { recipes })
  } catch (err) {
    console.error('Error fetching recipes:', err)
    res.redirect('/')
  }
})

// Render new recipe form
router.get('/new', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render('recipes/new.ejs', { ingredients })
  } catch (err) {
    console.error('Error fetching ingredients:', err)
    res.redirect('/recipes')
  }
})

// Create a new recipe
router.post('/', isSignedIn, async (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body
    const newRecipe = new Recipe({
      ...recipeData,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      owner: req.session.user._id
    })
    await newRecipe.save()
    res.redirect('/recipes')
  } catch (err) {
    console.error('Error creating recipe:', err)
    res.redirect('/recipes/new')
  }
})

// Show a specific recipe
router.get('/:id', isSignedIn, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.session.user._id
    }).populate('ingredients')
    if (!recipe) throw new Error('Recipe not found')
    res.render('recipes/show.ejs', { recipe })
  } catch (err) {
    console.error('Error fetching recipe:', err)
    res.redirect('/recipes')
  }
})

// Render edit recipe form
router.get('/:id/edit', isSignedIn, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      owner: req.session.user._id
    })
    const ingredients = await Ingredient.find()
    if (!recipe) throw new Error('Recipe not found')
    res.render('recipes/edit.ejs', { recipe, ingredients })
  } catch (err) {
    console.error('Error fetching recipe or ingredients:', err)
    res.redirect('/recipes')
  }
})

// Update a recipe
router.put('/:id', isSignedIn, async (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.user._id },
      {
        ...recipeData,
        ingredients: Array.isArray(ingredients) ? ingredients : [ingredients]
      },
      { new: true }
    )
    if (!updatedRecipe) throw new Error('Recipe not found')
    res.redirect(`/recipes/${updatedRecipe._id}`)
  } catch (err) {
    console.error('Error updating recipe:', err)
    res.redirect('/recipes')
  }
})

// Delete a recipe
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.user._id
    })
    if (!deletedRecipe) throw new Error('Recipe not found')
    res.redirect('/recipes')
  } catch (err) {
    console.error('Error deleting recipe:', err)
    res.redirect('/recipes')
  }
})

module.exports = router
