const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/note');

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,
  credentials: true,
}));


// app.get('/', (req, res) => {
//   res.send('Welcome to NoteLog API!');
// });

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);