// const multer = require('multer');
// const path = require('path');

// // Configuration du stockage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/children'); // dossier de stockage local
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `child_${Date.now()}${ext}`;
//     cb(null, uniqueName);
//   }
// });

// // Filtrage : accepter seulement les images
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Seules les images (jpg, jpeg, png) sont autorisées'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // max 5 Mo
//   }
// });

// module.exports = upload.single('photo');





// middleware/uploadChildPhoto.js
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// On stocke le fichier en mémoire (pas de dossier local)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 Mo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées.'), false);
    }
    cb(null, true);
  },
});

// 2 couches : multer -> upload vers Cloudinary
const uploadChildPhoto = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) return next(); // photo facultative

      const folder =
        (process.env.CLOUDINARY_FOLDER || 'parc-salma') + '/children';

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          overwrite: true,
        },
        (err, result) => {
          if (err) return next(err);
          req.fileUrl = result.secure_url;     // URL https
          req.filePublicId = result.public_id; // pour delete/update
          next();
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (e) {
      next(e);
    }
  },
];

module.exports = uploadChildPhoto;
