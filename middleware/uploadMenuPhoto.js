// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Créer le dossier s'il n'existe pas
// const uploadDir = path.join(__dirname, '../uploads/menuitems');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configuration du stockage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // Filtrage des types de fichiers
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error('Seules les images (jpeg, jpg, png) sont autorisées'));
//   }
// };

// // Exporter l’instance multer directement
// const uploadMenuPhoto = multer({
//   storage,
//   fileFilter,
// });

// module.exports = uploadMenuPhoto;




// middleware/uploadMenuPhoto.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  if (!ok) return cb(new Error('Seules les images JPEG/PNG/WebP sont autorisées'));
  cb(null, true);
};

const uploadMenuPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});

module.exports = uploadMenuPhoto;
