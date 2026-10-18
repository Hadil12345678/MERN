
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');

// GET : récupérer tous les articles
router.get('/', articleController.getAllArticles);

// GET : récupérer un article par son ID
router.get('/:id', articleController.getArticleById);

// POST : créer un nouvel article
router.post('/', articleController.createArticle);

// PUT : modifier un article
router.put('/:id', articleController.updateArticle);

// DELETE : supprimer un article
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
