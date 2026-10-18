
const Article = require('../models/articleModel');

// 1. GET /api/articles
// Récupérer tous les articles avec les informations de leur auteur
const getAllArticles = async (req, res) => {
  try {
    const filter = {};

    // Filtre optionnel : ?author=USER_ID
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const articles = await Article.find(filter)
      .populate('author', 'name email');

    return res.status(200).json({
      total: articles.length,
      articles
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// 2. GET /api/articles/:id
// Récupérer un article par son ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    return res.status(200).json(article);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// 3. POST /api/articles
// Créer un article lié à un utilisateur existant
const createArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    const newArticle = await Article.create({
      title,
      content,
      author: authorId
    });

    await newArticle.populate('author', 'name email');

    return res.status(201).json({
      message: 'Article créé',
      article: newArticle
    });
  } catch (error) {
    if (
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// 4. PUT /api/articles/:id
// Modifier un article
const updateArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const updates = {};

    if (title !== undefined) {
      updates.title = title;
    }

    if (content !== undefined) {
      updates.content = content;
    }

    if (authorId !== undefined) {
      updates.author = authorId;
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    return res.status(200).json({
      message: 'Article mis à jour',
      article
    });
  } catch (error) {
    if (
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// 5. DELETE /api/articles/:id
// Supprimer un article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    return res.status(200).json({
      message: 'Article supprimé avec succès',
      article
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// Exporter les fonctions
module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
