const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

// Routes / API's/ Controller Functions

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
      return res.send('Username already taken.')
    }

    if (req.body.password !== req.body.confirmPassword) {
      return req.send('Password and Confirm Password must match')
    }

    // bcrytpt for password encryption
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword

    // validation logic
    const user = await User.create(req.body)
    res.send(`Thanks for signing up ${user.username}`)
  } catch (error) {
    console.log()
  }
})

router.get('/sign-in', async (req, res) => {
  res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
  const userInDatabase = await User.findOne({
    username: req.body.username
  })
  if (!userInDatabase) {
    return res.send('Login failed. Please try again.')
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  )
  if (!validPassword) {
    return res.send('Login failed. Please try again.')
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  }

  res.redirect('/')
})

router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router
