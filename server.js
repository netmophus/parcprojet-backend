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




const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
const path = require('path');

// Middleware
app.use(cors());





// ✅ Origines autorisées
const allowedOrigins = [
  'https://parcprojet-frontend-45a8df9cb0d5.herokuapp.com/',
//     'http://localhost:3000',
//    'http://127.0.0.1:3000',
//   'http://192.168.1.221:3000',
//  'http://192.168.80.55:3000'

 
];

// ✅ Middleware CORS dynamique
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
}));

// ✅ Middleware manuel pour renforcer les en-têtes CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

if (req.method === "OPTIONS") {
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.status(200).end();
}


  next();
});














app.use(express.json());

// ✅ Alias de compatibilité : /uploads/menus → uploads/menuitems
app.use(
  '/uploads/menus',
  express.static(path.join(__dirname, 'uploads/menuitems'))
);

// // ✅ Statique /uploads + petit header anti-blocage
// app.use(
//   '/uploads',
//   (req, res, next) => {
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//     next();
//   },
//   express.static(path.join(__dirname, 'uploads'))
// );

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connexion à MongoDB réussie'))
.catch((err) => console.error('❌ Erreur MongoDB :', err.message));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/children', childRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/salepoints', salePointRoutes);
app.use('/api/menuitems', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/play', playRoutes);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours sur le port ${PORT}`);
});
