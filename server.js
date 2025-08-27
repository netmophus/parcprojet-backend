// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const gameRoutes = require('./routes/gameRoutes');
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes'); // ← Import des routes utilisateur
// const childRoutes = require('./routes/childrenRoutes');
// const playRoutes = require('./routes/playRoutes');
// const clientRoutes = require('./routes/clientRoutes'); // chemin correct vers ton fichier
// const salePointRoutes = require('./routes/salePointRoutes');
// const menuItemRoutes = require('./routes/menuItemRoutes');
// const orderRoutes = require('./routes/orderRoutes');



// dotenv.config();

// const app = express();
// const path = require('path'); // ✅ Import du module manquant
// // Middleware
// app.use(cors()); // Autorise toutes les origines (modifiable si besoin)
// app.use(express.json()); // Pour lire les JSON envoyés
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Connexion MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('✅ Connexion à MongoDB réussie'))
// .catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// // Routes

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); // ← Chemin pour les utilisateurs
// app.use('/api/games', gameRoutes);
// app.use('/api/children',childRoutes); 


// app.use('/api/clients', clientRoutes); // ✅ attention au nom de base ici

// app.use('/api/salepoints', salePointRoutes);

// app.use('/api/menuitems', menuItemRoutes);


// app.use('/api/orders', orderRoutes);


// app.use('/api/play', playRoutes);

// // Port
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Serveur en cours sur le port ${PORT}`);
// });




// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const gameRoutes = require('./routes/gameRoutes');
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const childRoutes = require('./routes/childrenRoutes');
// const playRoutes = require('./routes/playRoutes');
// const clientRoutes = require('./routes/clientRoutes');
// const salePointRoutes = require('./routes/salePointRoutes');
// const menuItemRoutes = require('./routes/menuItemRoutes');
// const orderRoutes = require('./routes/orderRoutes');

// dotenv.config();

// const app = express();
// const path = require('path');

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Alias de compatibilité : /uploads/menus → uploads/menuitems
// app.use(
//   '/uploads/menus',
//   express.static(path.join(__dirname, 'uploads/menuitems'))
// );

// // ✅ Statique /uploads + petit header anti-blocage
// app.use(
//   '/uploads',
//   (req, res, next) => {
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//     next();
//   },
//   express.static(path.join(__dirname, 'uploads'))
// );

// // Connexion MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('✅ Connexion à MongoDB réussie'))
// .catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// // Routes API
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/games', gameRoutes);
// app.use('/api/children', childRoutes);
// app.use('/api/clients', clientRoutes);
// app.use('/api/salepoints', salePointRoutes);
// app.use('/api/menuitems', menuItemRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/play', playRoutes);

// // Port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Serveur en cours sur le port ${PORT}`);
// });





const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Import des routes
const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childrenRoutes');
const playRoutes = require('./routes/playRoutes');
const clientRoutes = require('./routes/clientRoutes');
const salePointRoutes = require('./routes/salePointRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Alias /uploads/menus → uploads/menuitems
app.use('/uploads/menus', express.static(path.join(__dirname, 'uploads/menuitems')));

// ✅ Statique /uploads + header anti-blocage
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connexion à MongoDB réussie'))
.catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// ✅ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/children', childRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/salepoints', salePointRoutes);
app.use('/api/menuitems', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/play', playRoutes);

// ✅ Page d'accueil pour tester
app.get('/', (req, res) => {
  res.send('🚀 Bienvenue sur l’API PARC SALMA');
});

// ✅ Intégration du frontend (si tu as un dossier frontend/build)
const frontendPath = path.join(__dirname, 'frontend/build');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours sur le port ${PORT}`);
});
