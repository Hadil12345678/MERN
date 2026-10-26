
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { protect } = require('../Middlewares/authMiddleware');

// Public routes
router.get('/', articleController.getAllArticles);

// Protected route: get only the logged-in user's articles
// IMPORTANT: this route must be before /:id
router.get('/my-articles', protect, articleController.getMyArticles);

router.get('/:id', articleController.getArticleById);

// Protected routes
router.post('/', protect, articleController.createArticle);
router.put('/:id', protect, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
