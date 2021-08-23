const Sauce = require("../models/Sauce");

const fs = require("fs");

// Prendre les sauces de la base de données
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((newSauce) => res.status(200).json(newSauce))
    .catch((error) => res.status(400).json({ error }));
};

// Prendre une sauce spécifique
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((newSauce) => res.status(200).json(newSauce))
    .catch((error) => res.status(404).json({ error }));
};

// Create new sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: "",
    usersDisliked: "",
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: "Nouvelle sauce insérée avec succès !" })
    )
    .catch((error) => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //on utilise l'ID que nous recevons comme paramètre pour accéder au Sauce correspondant dans la bdd
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        //nous utilisons le fait de savoir que notre URL d'image contient un segment /images/ pour séparer le nom de fichier ; Unlike va nous permettre de la supprimer
        Sauce.deleteOne({ _id: req.params.id }) //dans ce callback on supprime le Sauce de la bdd, nous lui passons un objet correspondant au document à supprimer
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  if (req.body.like == 1) {
    //si user a like
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId },
        _id: req.params.id,
      }
    ) //c est l id qu on va modifie
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like == -1) {
    //si user dislike
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
        _id: req.params.id,
      }
    )
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like == 0) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauces) => {
        if (sauces.usersLiked.find((user) => user === req.body.userId)) {
          //si user like
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then((sauces) => res.status(200).json(sauces))
            .catch((error) => res.status(400).json({ error }));
        }
        if (sauces.usersDisliked.find((user) => user === req.body.userId)) {
          //si il avait dislike
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then((sauces) => res.status(200).json(sauces))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => console.log(error));
  }
};