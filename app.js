// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express application
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ExamiaAuth', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    // unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// // Define routes
// app.get('/', (req, res) => {
//   // If user is logged in, redirect to index.html
//   if (req.session.userId) {
//     return res.redirect('/index.html');
//   }
//   // Otherwise, redirect to login.html
//   res.sendFile(path.join(__dirname, 'login.html'));
// });

app.use(express.static(path.join(__dirname, 'public')));

// Define a GET request handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'faculty.html'));
});

// app.get('/member.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'member.html'));
// });



app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Validate input (ensure username and password are not empty)
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
  
      // Create new user
      const newUser = new User({ username, password });
      await newUser.save();
  
      res.redirect('/login.html');
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    req.session.userId = user._id;
    res.redirect('/faculty.html');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/faculty.html', (req, res) => {
  // If user is not logged in, redirect to login page
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'faculty.html'));
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
