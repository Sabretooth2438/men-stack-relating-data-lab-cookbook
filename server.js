const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const passUsertoView = require('./middleware/pass-user-to-view')
const app = express()

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT ? process.env.PORT : '3000'

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB Database: ${mongoose.connection.name}.`)
})

// Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUsertoView)

// Require Controllers
const authCtrl = require('./controllers/auth.js')
const isSignedIn = require('./middleware/is-signed-in.js')

// Use Controller
app.use('/auth', authCtrl)

// Root Route
app.get('/', async (req, res) => {
  res.render('index.ejs')
})

// Route for Testing
// VIP-Lounge
app.get("/vip-lounge", isSignedIn, (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.send("Sorry, no guests allowed.");
  }
});
// Listen
app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}`)
})
