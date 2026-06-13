const ProductService = require('../services/product.service');

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await ProductService.getAllCategories();
        res.status(200).json({
            status: 'success',
            data: { categories }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const { category_id, search } = req.query;
        const products = await ProductService.getAllProducts({ category_id, search });
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: { products }
        });
    } catch (error) {
        next(error);
    }
};

exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 6;
        const products = await ProductService.getFeaturedProducts(limit);
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: { products }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await ProductService.getProductById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

exports.getReviews = async (req, res, next) => {
    try {
        const { sort } = req.query;
        const reviews = await ProductService.getProductReviews(req.params.id, sort);
        res.status(200).json({
            status: 'success',
            data: { reviews }
        });
    } catch (error) {
        next(error);
    }
};

exports.addReview = async (req, res, next) => {
    try {
        const { rating, reviewText } = req.body;
        const result = await ProductService.addProductReview(req.user.userId, req.params.id, rating, reviewText);
        res.status(201).json({
            status: 'success',
            message: 'Review added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
