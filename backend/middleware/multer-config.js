const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
//Indique a multer ou enregistrer les fichiers
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },

  //Prend le nom du fichier d'origine ajoute un timestamp et rajoute l'extension
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
