// Load environment variables
const dotenv = require('dotenv')
dotenv.config()

// Import dependencies
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')

// Import middleware
const passUserToView = require('./middleware/pass-user-to-view')
const isSignedIn = require('./middleware/is-signed-in')

// Import controllers
const authCtrl = require('./controllers/auth')
const recipesCtrl = require('./controllers/recipes')
const ingredientsCtrl = require('./controllers/ingredients')
const usersCtrl = require('./controllers/users.js')

// Initialize Express app
const app = express()

// Configure environment variables
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI
const SESSION_SECRET = process.env.SESSION_SECRET

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB Database: ${mongoose.connection.name}.`)
})

// Configure middlewares
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUserToView)
app.use(express.json())
app.use(express.static('public'));

// Configure routes
app.get('/', (req, res) => {
  res.render('index.ejs')
})
app.use('/auth', authCtrl)
app.use('/recipes', recipesCtrl)
app.use('/ingredients', ingredientsCtrl)
app.use('/users', usersCtrl)

// Start server
app.listen(PORT, () => {
  console.log(`The express app is running on port ${PORT}.`)
})
