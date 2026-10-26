
const Article = require('../models/articleModel');

// GET all articles
const getAllArticles = async (req, res) => {
  try {
    const filter = {};

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
        message: 'Invalid resource identifier'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// GET one article by ID
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
        message: 'Invalid resource identifier'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// GET articles belonging to the authenticated user
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      author: req.user._id
    }).populate('author', 'name email');

    return res.status(200).json({
      total: articles.length,
      articles
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// POST create an article
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Title and content are required'
      });
    }

    const article = await Article.create({
      title,
      content,
      author: req.user._id
    });

    await article.populate('author', 'name email');

    return res.status(201).json(article);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// PUT update an article (owner or admin only)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    const isOwner =
      article.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to update this article'
      });
    }

    const { title, content } = req.body;

    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;

    await article.save();
    await article.populate('author', 'name email');

    return res.status(200).json(article);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// DELETE an article (owner or admin only)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: 'Article not found'
      });
    }

    const isOwner =
      article.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to delete this article'
      });
    }

    await Article.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Article deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getMyArticles,
  createArticle,
  updateArticle,
  deleteArticle
};
