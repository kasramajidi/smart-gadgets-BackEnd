const ProductModel = require("../../models/Product");
const mongoose = require("mongoose");

// دریافت تمام محصولات با فیلتر و صفحه‌بندی
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status = 'فعال',
            inStock
        } = req.query;

        // ساخت فیلتر
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (inStock !== undefined) filter['inventory.inStock'] = inStock === 'true';

        // فیلتر قیمت
        if (minPrice || maxPrice) {
            filter['price.originalPrice'] = {};
            if (minPrice) filter['price.originalPrice'].$gte = Number(minPrice);
            if (maxPrice) filter['price.originalPrice'].$lte = Number(maxPrice);
        }

        // جستجو در متن
        if (search) {
            filter.$text = { $search: search };
        }

        // مرتب‌سازی
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const products = await ProductModel
            .find(filter)
            .select('-__v')
            .populate('createdBy', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: total,
                itemsPerPage: Number(limit),
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

// دریافت محصول با شناسه
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await ProductModel
            .findById(id)
            .populate('createdBy', 'username email')
            .populate('relatedProducts', 'name title images.mainImage price')
            .populate('alternativeProducts', 'name title images.mainImage price');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // افزایش تعداد بازدید
        await ProductModel.findByIdAndUpdate(id, {
            $inc: { 'salesStats.viewCount': 1 }
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

// دریافت محصول با slug
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const product = await ProductModel
            .findOne({ 'seo.slug': slug })
            .populate('createdBy', 'username email')
            .populate('relatedProducts', 'name title images.mainImage price')
            .populate('alternativeProducts', 'name title images.mainImage price');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // افزایش تعداد بازدید
        await ProductModel.findOneAndUpdate(
            { 'seo.slug': slug },
            { $inc: { 'salesStats.viewCount': 1 } }
        );

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

// ایجاد محصول جدید
const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user.id
        };

        const product = new ProductModel(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product name or slug already exists"
            });
        }

        res.status(400).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
};

// به‌روزرسانی محصول
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await ProductModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

// حذف محصول
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await ProductModel.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

// محصولات ویژه و پرفروش
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await ProductModel
            .find({
                status: 'فعال',
                tags: { $in: ['ویژه', 'پرفروش'] }
            })
            .select('name title images.mainImage price rating')
            .sort({ 'salesStats.totalSold': -1, 'rating.average': -1 })
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured products",
            error: error.message
        });
    }
};

// محصولات با تخفیف
const getDiscountedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await ProductModel
            .find({
                status: 'فعال',
                'price.discountPrice': { $gt: 0 }
            })
            .select('name title images.mainImage price rating')
            .sort({ 'price.discountPercentage': -1 })
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching discounted products",
            error: error.message
        });
    }
};

// جدیدترین محصولات
const getLatestProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await ProductModel
            .find({ status: 'فعال' })
            .select('name title images.mainImage price rating')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching latest products",
            error: error.message
        });
    }
};

// دسته‌بندی‌ها و برندها
const getFilters = async (req, res) => {
    try {
        const categories = await ProductModel.distinct('category');
        const brands = await ProductModel.distinct('brand');

        const priceRange = await ProductModel.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price.originalPrice" },
                    maxPrice: { $max: "$price.originalPrice" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                categories,
                brands,
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching filters",
            error: error.message
        });
    }
};

// به‌روزرسانی موجودی
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, action = 'set' } = req.body; // set, add, subtract

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        let updateQuery;
        switch (action) {
            case 'add':
                updateQuery = { $inc: { 'inventory.stock': stock } };
                break;
            case 'subtract':
                updateQuery = { $inc: { 'inventory.stock': -stock } };
                break;
            default:
                updateQuery = { 'inventory.stock': stock };
        }

        const product = await ProductModel.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // به‌روزرسانی وضعیت موجودی
        if (product.inventory.stock <= 0) {
            product.inventory.inStock = false;
            product.status = 'ناموجود';
            await product.save();
        }

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating stock",
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getDiscountedProducts,
    getLatestProducts,
    getFilters,
    updateStock
};
