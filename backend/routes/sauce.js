const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

// les routes de création et de modifications sont vérifiées par le middleware auth

router.get("/:id", auth, sauceCtrl.getOneSauce);

router.post("/", auth, multer, sauceCtrl.createSauce);

router.put("/:id", auth, multer, sauceCtrl.modifySauce);

router.get("/", sauceCtrl.getAllSauces);

router.delete("/:id", auth, sauceCtrl.deleteSauce);

router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
