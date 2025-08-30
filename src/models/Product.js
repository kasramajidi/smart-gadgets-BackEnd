const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    // اطلاعات اصلی محصول
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        maxlength: 500
    },

    // دسته‌بندی و برندها
    category: {
        type: String,
        required: true,
        enum: [
            "هدفون و ایرپاد",
            "ساعت هوشمند",
            "دسته بازی",
            "لوازم جانبی موبایل",
            "اسپیکر بلوتوث",
            "پاوربانک",
            "شارژر بی‌سیم",
            "دستبند هوشمند",
            "عینک هوشمند",
            "دوربین هوشمند"
        ]
    },
    brand: {
        type: String,
        required: true,
        enum: [
            "سامسونگ",
            "اپل",
            "شیائومی",
            "انکر",
            "جی بی ال",
            "سونی",
            "هواوی",
            "OnePlus",
            "Beats",
            "Bose",
            "AirPods",
            "Galaxy Buds"
        ]
    },

    // قیمت‌گذاری
    price: {
        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        discountPrice: {
            type: Number,
            min: 0,
            default: 0
        },
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },

    // تصاویر
    images: {
        mainImage: {
            type: String,
            required: true
        },
        thumbnails: [{
            type: String
        }],
        galleryImages: [{
            type: String
        }]
    },

    // مشخصات فنی
    specifications: {
        colors: [{
            name: String,
            colorCode: String,
            available: {
                type: Boolean,
                default: true
            }
        }],
        connectivity: {
            bluetooth: String,
            wifi: String,
            usb: String,
            nfc: Boolean
        },
        battery: {
            capacity: String,
            chargingTime: String,
            playbackTime: String
        },
        dimensions: {
            weight: String,
            size: String
        },
        features: [String],
        compatibility: [String]
    },

    // موجودی و وضعیت
    inventory: {
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        inStock: {
            type: Boolean,
            default: true
        },
        reservedStock: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // وضعیت محصول
    status: {
        type: String,
        enum: ["فعال", "غیرفعال", "ناموجود", "به‌زودی"],
        default: "فعال"
    },

    // تخفیفات و پیشنهادات ویژه
    tags: [{
        type: String,
        enum: ["ویژه", "پرفروش", "جدید", "پیشنهاد ویژه", "تخفیف ویژه", "محدود"]
    }],

    // امتیازات و نظرات
    rating: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // آمار فروش
    salesStats: {
        totalSold: {
            type: Number,
            default: 0,
            min: 0
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0
        },
        wishlistCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // SEO و متادیتا
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        slug: {
            type: String,
            unique: true,
            required: true
        }
    },

    // اطلاعات ادمین
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ویژگی‌های اضافی
    warranty: {
        period: String,
        description: String
    },

    shipping: {
        freeShipping: {
            type: Boolean,
            default: false
        },
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        }
    },

    // محصولات مرتبط
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    // محصولات جایگزین
    alternativeProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]

}, {
    timestamps: true, // برای createdAt و updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual برای محاسبه قیمت نهایی
productSchema.virtual('finalPrice').get(function () {
    if (this.price.discountPrice > 0) {
        return this.price.discountPrice;
    }
    return this.price.originalPrice;
});

// Virtual برای محاسبه مبلغ تخفیف
productSchema.virtual('discountAmount').get(function () {
    if (this.price.discountPrice > 0) {
        return this.price.originalPrice - this.price.discountPrice;
    }
    return 0;
});

// Virtual برای بررسی موجودی
productSchema.virtual('isAvailable').get(function () {
    return this.inventory.inStock && this.inventory.stock > 0 && this.status === "فعال";
});

// Index برای جستجو و عملکرد بهتر
productSchema.index({ name: 'text', title: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ 'price.originalPrice': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'seo.slug': 1 });

// Middleware برای به‌روزرسانی slug قبل از ذخیره
productSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) {
        this.seo.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
            .replace(/\s+/g, '-')
            .trim('-');
    }
    next();
});

// Middleware برای محاسبه درصد تخفیف
productSchema.pre('save', function (next) {
    if (this.price.discountPrice > 0 && this.price.originalPrice > 0) {
        this.price.discountPercentage = Math.round(
            ((this.price.originalPrice - this.price.discountPrice) / this.price.originalPrice) * 100
        );
    } else {
        this.price.discountPercentage = 0;
    }
    next();
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
