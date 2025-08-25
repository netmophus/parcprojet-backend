// const roleMiddleware = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       console.log("⛔ Accès refusé pour le rôle :", req.user?.role); // 🪵 Log utile
//       return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' });
//     }
//     next();
//   };
// };

// module.exports = roleMiddleware;






const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("✅ Utilisateur connecté :", req.user?.role);
    console.log("🎯 Rôles autorisés :", allowedRoles);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log("⛔ Refusé : rôle non autorisé");
      return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' });
    }

    console.log("✅ Accès autorisé");
    next();
  };
};

module.exports = roleMiddleware;
