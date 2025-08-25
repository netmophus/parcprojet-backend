// const MenuItem = require('../models/MenuItem');

// // ➕ Créer un plat/menu
// exports.createMenuItem = async (req, res) => {
//   try {
//     const { name, description, price, salePoint } = req.body;

//     const menuItem = await MenuItem.create({
//       name,
//       description,
//       price,
//       salePoint,
//       photo: req.file ? `/uploads/menus/${req.file.filename}` : '',
//       createdBy: req.user._id,
//     });

//     res.status(201).json(menuItem);
//   } catch (error) {
//     console.error('Erreur création menu:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };














// controllers/menuItemController.js
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const MenuItem = require('../models/MenuItem');
const sharp = require('sharp'); // 👈 ajoute cette import en haut du fichier


const uploadBufferToCloudinary = (buffer, folder = 'menuitems') =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ fetch_format: 'auto', quality: 'auto' }],
        },
        (err, res) => (err ? reject(err) : resolve(res))
      )
      .end(buffer);
  });

// controllers/menuItemController.js
// Prérequis en haut du fichier :
// const mongoose = require('mongoose');
// const cloudinary = require('../config/cloudinary');
// const MenuItem = require('../models/MenuItem');

exports.updateMenuItem = async (req, res) => {
  console.log('\n========== [UPDATE MENU] start ==========');
  console.log('[REQ] id =', req.params?.id);
  console.log('[REQ] body keys =', Object.keys(req.body || {}));
  if (req.file) {
    console.log('[FILE] originalname =', req.file.originalname);
    console.log('[FILE] mimetype     =', req.file.mimetype);
    console.log('[FILE] size(bytes)  =', req.file.size ?? req.file.buffer?.length);
  } else {
    console.log('[FILE] aucun fichier envoyé');
  }

  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      console.error('[ERR] ID invalide');
      return res.status(400).json({ message: 'ID invalide' });
    }

    const menu = await MenuItem.findById(id);
    if (!menu) {
      console.error('[ERR] Menu non trouvé');
      return res.status(404).json({ message: 'Menu non trouvé' });
    }

    const { name, description, price, isAvailable } = req.body;

    // 1) Upload image si fournie
    if (req.file?.buffer) {
      console.log('[CLOUDINARY] upload_stream -> start');
      const cfg = cloudinary.config();
      console.log('[CLOUDINARY] cloud_name =', cfg.cloud_name, '| secure =', cfg.secure);

      console.time('[TIMER] cloudinary.upload_stream');
      try {
        const uploaded = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'menuitems',
                resource_type: 'image',
                // transformation: [{ fetch_format: 'auto', quality: 'auto' }], // optionnel
              },
              (err, result) => (err ? reject(err) : resolve(result))
            )
            .end(req.file.buffer);
        });

        console.timeEnd('[TIMER] cloudinary.upload_stream');
        console.log('[CLOUDINARY] OK public_id =', uploaded.public_id);
        menu.photo = uploaded.secure_url; // on remplace l'URL
      } catch (err) {
        console.timeEnd('[TIMER] cloudinary.upload_stream');
        console.error('❌ [CLOUDINARY] Upload FAIL');
        console.error('   name   =', err?.name);
        console.error('   code   =', err?.code);
        console.error('   http   =', err?.http_code);
        console.error('   msg    =', err?.message);
        return res.status(500).json({ message: "Erreur lors de l'upload de l'image" });
      }
    }

    // 2) Champs texte (ne pas écraser avec vide)
    if (typeof name === 'string' && name.trim()) {
      console.log("[UPDATE] name ->", name.trim());
      menu.name = name.trim();
    }
    if (typeof description === 'string') {
      console.log("[UPDATE] description -> (len)", description.length);
      menu.description = description;
    }

    // 3) Prix (mettre à jour seulement si non vide)
    if (price !== undefined && price !== '') {
      const raw = String(price);
      const n = Number(raw.replace(',', '.'));
      console.log(`[UPDATE] price raw='${raw}' parsed=`, n);
      if (Number.isNaN(n)) {
        console.error('[ERR] price invalide');
        return res.status(400).json({ message: 'price doit être un nombre' });
      }
      menu.price = n;
    }

    // 4) Disponibilité
    if (typeof isAvailable !== 'undefined') {
      const val = (isAvailable === 'true' || isAvailable === true);
      console.log('[UPDATE] isAvailable ->', val);
      menu.isAvailable = val;
    }

    console.time('[TIMER] mongoose.save');
    await menu.save();
    console.timeEnd('[TIMER] mongoose.save');

    console.log('========== [UPDATE MENU] done ==========\n');
    return res.json(menu);
  } catch (error) {
    console.error('❌ [UPDATE MENU] ERROR =', error?.message || error);
    console.log('========== [UPDATE MENU] fail ==========\n');
    return res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};


// ➕ Créer
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description = '', price, salePoint } = req.body;

    if (!name || !salePoint || price === undefined || price === '') {
      return res.status(400).json({ message: 'name, price et salePoint sont requis' });
    }

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber)) {
      return res.status(400).json({ message: 'price doit être un nombre' });
    }

    let photoUrl = '';
    let photoId = '';
    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary(req.file.buffer, 'menuitems');
      photoUrl = up.secure_url;
      photoId = up.public_id;
    }

    const menuItem = await MenuItem.create({
      name: name.trim(),
      description,
      price: priceNumber,
      salePoint,
      photo: photoUrl,
      photoId,
      createdBy: req.user?._id || null,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('❌ [CREATE MENU] ', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📄 Liste par espace
exports.getMenuItemsBySalePoint = async (req, res) => {
  try {
    const { salePointId } = req.params;
    const menus = await MenuItem.find({ salePoint: salePointId, isAvailable: true });
    res.json(menus);
  } catch (error) {
    console.error('❌ [GET MENUS] ', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



// ❌ Supprimer
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await MenuItem.findByIdAndDelete(id);
    if (!menu) return res.status(404).json({ message: 'Menu non trouvé' });

    if (menu.photoId) {
      cloudinary.uploader
        .destroy(menu.photoId, { resource_type: 'image' })
        .catch(e => console.warn('[Cloudinary destroy fail]', e?.message));
    }

    res.json({ message: 'Plat supprimé avec succès' });
  } catch (error) {
    console.error('❌ [DELETE MENU] ', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
