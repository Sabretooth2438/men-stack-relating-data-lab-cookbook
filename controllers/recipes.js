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
    res.render('recipes/index.ejs', {
      recipes,
      success: req.query.success,
      error: req.query.error
    })
  } catch (err) {
    console.error('Error fetching recipes:', err)
    res.redirect('/?error=Failed to load recipes.')
  }
})

// Render new recipe form
router.get('/new', isSignedIn, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render('recipes/new.ejs', { ingredients, error: req.query.error })
  } catch (err) {
    console.error('Error rendering new recipe page:', err)
    res.redirect('/recipes?error=Failed to load the new recipe form.')
  }
})

// Create a new recipe
router.post('/', isSignedIn, async (req, res) => {
  if (!req.body.name || req.body.name.trim() === '') {
    return res.redirect('/recipes/new?error=Recipe name is required.')
  }

  try {
    const { ingredients, newIngredient = [], ...recipeData } = req.body
    let ingredientsArray = Array.isArray(ingredients)
      ? ingredients
      : ingredients
      ? [ingredients]
      : []

    if (Array.isArray(newIngredient)) {
      for (const ingredientName of newIngredient) {
        if (ingredientName.trim() !== '') {
          const ingredient = await Ingredient.findOneAndUpdate(
            { name: ingredientName.trim() },
            { name: ingredientName.trim() },
            { new: true, upsert: true }
          )
          ingredientsArray.push(ingredient._id)
        }
      }
    }

    const newRecipe = new Recipe({
      ...recipeData,
      ingredients: ingredientsArray,
      owner: req.session.user._id
    })

    await newRecipe.save()
    res.redirect('/recipes?success=Recipe created successfully!')
  } catch (err) {
    console.error('Error creating recipe:', err)
    res.redirect('/recipes/new?error=Failed to create recipe.')
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
    res.render('recipes/show.ejs', { recipe, error: req.query.error })
  } catch (err) {
    console.error('Error fetching recipe:', err)
    res.redirect('/recipes?error=Failed to load recipe details.')
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
    res.render('recipes/edit.ejs', {
      recipe,
      ingredients,
      error: req.query.error
    })
  } catch (err) {
    console.error('Error fetching recipe or ingredients:', err)
    res.redirect('/recipes?error=Failed to load the edit form.')
  }
})

// Update a recipe
router.put('/:id', isSignedIn, async (req, res) => {
  if (!req.body.name || req.body.name.trim() === '') {
    return res.redirect(
      `/recipes/${req.params.id}/edit?error=Recipe name is required.`
    )
  }

  try {
    const { ingredients, newIngredient, ...recipeData } = req.body
    let ingredientsArray = Array.isArray(ingredients)
      ? ingredients
      : ingredients
      ? [ingredients]
      : []

    if (newIngredient && newIngredient.trim() !== '') {
      const ingredient = await Ingredient.findOneAndUpdate(
        { name: newIngredient.trim() },
        { name: newIngredient.trim() },
        { new: true, upsert: true }
      )
      ingredientsArray.push(ingredient._id)
    }

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.user._id },
      { ...recipeData, ingredients: ingredientsArray },
      { new: true }
    )

    if (!updatedRecipe) throw new Error('Recipe not found')
    res.redirect(
      `/recipes/${updatedRecipe._id}?success=Recipe updated successfully!`
    )
  } catch (err) {
    console.error('Error updating recipe:', err)
    res.redirect(
      `/recipes/${req.params.id}/edit?error=Failed to update recipe.`
    )
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
    res.redirect('/recipes?success=Recipe deleted successfully!')
  } catch (err) {
    console.error('Error deleting recipe:', err)
    res.redirect('/recipes?error=Failed to delete recipe.')
  }
})

module.exports = router
