// const multer = require('multer');
// const path = require('path');

// // Configuration du stockage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/clients');
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `client-${Date.now()}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// // Filtrer les fichiers image uniquement
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Seules les images sont autorisées'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload.single('photo');





const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary'); // ton fichier config/cloudinary.js

// on garde le fichier en mémoire (pas d’écriture disque)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Seules les images sont autorisées'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
});

// convertit le buffer vers Cloudinary
const uploadClient = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) return next(); // photo facultative

      const folder = 'parc-salma/clients';
      const cldStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (err, result) => {
          if (err) return next(err);
          req.fileUrl = result.secure_url;       // URL https Cloudinary
          req.filePublicId = result.public_id;   // utile pour delete/update
          next();
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(cldStream);
    } catch (e) {
      next(e);
    }
  },
];

module.exports = uploadClient;
