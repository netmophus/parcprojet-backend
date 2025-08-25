// config/cloudinary.js
const dotenv = require('dotenv');
dotenv.config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,      // 👉 force HTTPS
timeout: 120000, // ⬅️ augmente le timeout
  // api_proxy: process.env.HTTPS_PROXY, // 👉 décommente si tu es derrière un proxy
});

module.exports = cloudinary;
