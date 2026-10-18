
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const connectDB = require('./config/db');

const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Import route modules
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: "Bonjour, je suis l’API du blog" });
});

// About route
app.get('/about', (req, res) => {
  res.json({
    application: 'API du blog',
    auteur: 'Votre Nom',
    version: '1.0.0'
  });
});

// Contact route
app.post('/contact', (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({
      error: "L'email et le message sont obligatoires"
    });
  }

  res.status(200).json({
    message: 'Merci, votre message a bien été reçu'
  });
});


 // Connect to MongoDB, then start the server
async function startServer() {
  try {
    await connectDB(process.env.MONGODB_URI);

    app.listen(PORT, () => {
      console.log(`Serveur disponible sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

startServer();
