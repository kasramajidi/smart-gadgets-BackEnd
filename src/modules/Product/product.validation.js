const yup = require("yup");

// اعتبارسنجی ایجاد محصول
const createProductValidation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            name: yup
                .string()
                .required("نام محصول الزامی است")
                .max(200, "نام محصول نمی‌تواند بیش از ۲۰۰ کاراکتر باشد"),

            title: yup
                .string()
                .required("عنوان محصول الزامی است")
                .max(300, "عنوان محصول نمی‌تواند بیش از ۳۰۰ کاراکتر باشد"),

            description: yup
                .string()
                .required("توضیحات محصول الزامی است")
                .max(2000, "توضیحات نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد"),

            shortDescription: yup
                .string()
                .max(500, "توضیحات کوتاه نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),

            category: yup
                .string()
                .required("دسته‌بندی الزامی است")
                .oneOf([
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
                ], "دسته‌بندی انتخابی معتبر نیست"),

            brand: yup
                .string()
                .required("برند الزامی است")
                .oneOf([
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
                ], "برند انتخابی معتبر نیست"),

            price: yup.object().shape({
                originalPrice: yup
                    .number()
                    .required("قیمت اصلی الزامی است")
                    .min(0, "قیمت نمی‌تواند منفی باشد"),

                discountPrice: yup
                    .number()
                    .min(0, "قیمت تخفیف نمی‌تواند منفی باشد")
                    .test('discount-validation', 'قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد', function (value) {
                        if (value && this.parent.originalPrice) {
                            return value <= this.parent.originalPrice;
                        }
                        return true;
                    })
            }),

            images: yup.object().shape({
                mainImage: yup
                    .string()
                    .required("تصویر اصلی الزامی است"),

                thumbnails: yup
                    .array()
                    .of(yup.string()),

                galleryImages: yup
                    .array()
                    .of(yup.string())
            }),

            specifications: yup.object().shape({
                colors: yup.array().of(yup.object().shape({
                    name: yup.string(),
                    colorCode: yup.string(),
                    available: yup.boolean()
                })),

                connectivity: yup.object(),
                battery: yup.object(),
                dimensions: yup.object(),
                features: yup.array().of(yup.string()),
                compatibility: yup.array().of(yup.string())
            }),

            inventory: yup.object().shape({
                stock: yup
                    .number()
                    .required("موجودی الزامی است")
                    .min(0, "موجودی نمی‌تواند منفی باشد"),

                inStock: yup.boolean(),
                reservedStock: yup.number().min(0, "موجودی رزرو نمی‌تواند منفی باشد")
            }),

            status: yup
                .string()
                .oneOf(["فعال", "غیرفعال", "ناموجود", "به‌زودی"], "وضعیت انتخابی معتبر نیست"),

            tags: yup
                .array()
                .of(yup.string().oneOf(["ویژه", "پرفروش", "جدید", "پیشنهاد ویژه", "تخفیف ویژه", "محدود"], "تگ انتخابی معتبر نیست")),

            seo: yup.object().shape({
                metaTitle: yup.string(),
                metaDescription: yup.string(),
                keywords: yup.array().of(yup.string()),
                slug: yup.string()
            }),

            warranty: yup.object().shape({
                period: yup.string(),
                description: yup.string()
            }),

            shipping: yup.object().shape({
                freeShipping: yup.boolean(),
                weight: yup.number().min(0),
                dimensions: yup.object().shape({
                    length: yup.number().min(0),
                    width: yup.number().min(0),
                    height: yup.number().min(0)
                })
            })
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "خطاهای اعتبارسنجی",
                errors: error.errors
            });
        }

        res.status(500).json({
            success: false,
            message: "خطای سرور در اعتبارسنجی",
            error: error.message
        });
    }
};

// اعتبارسنجی به‌روزرسانی محصول
const updateProductValidation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            name: yup
                .string()
                .max(200, "نام محصول نمی‌تواند بیش از ۲۰۰ کاراکتر باشد"),

            title: yup
                .string()
                .max(300, "عنوان محصول نمی‌تواند بیش از ۳۰۰ کاراکتر باشد"),

            description: yup
                .string()
                .max(2000, "توضیحات نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد"),

            shortDescription: yup
                .string()
                .max(500, "توضیحات کوتاه نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),

            category: yup
                .string()
                .oneOf([
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
                ], "دسته‌بندی انتخابی معتبر نیست"),

            brand: yup
                .string()
                .oneOf([
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
                ], "برند انتخابی معتبر نیست"),

            price: yup.object().shape({
                originalPrice: yup
                    .number()
                    .min(0, "قیمت نمی‌تواند منفی باشد"),

                discountPrice: yup
                    .number()
                    .min(0, "قیمت تخفیف نمی‌تواند منفی باشد")
                    .test('discount-validation', 'قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد', function (value) {
                        if (value && this.parent.originalPrice) {
                            return value <= this.parent.originalPrice;
                        }
                        return true;
                    })
            }),

            'inventory.stock': yup
                .number()
                .min(0, "موجودی نمی‌تواند منفی باشد"),

            status: yup
                .string()
                .oneOf(["فعال", "غیرفعال", "ناموجود", "به‌زودی"], "وضعیت انتخابی معتبر نیست"),

            tags: yup
                .array()
                .of(yup.string().oneOf(["ویژه", "پرفروش", "جدید", "پیشنهاد ویژه", "تخفیف ویژه", "محدود"], "تگ انتخابی معتبر نیست"))
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "خطاهای اعتبارسنجی",
                errors: error.errors
            });
        }

        res.status(500).json({
            success: false,
            message: "خطای سرور در اعتبارسنجی",
            error: error.message
        });
    }
};

// اعتبارسنجی به‌روزرسانی موجودی
const updateStockValidation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            stock: yup
                .number()
                .required("مقدار موجودی الزامی است")
                .min(0, "موجودی نمی‌تواند منفی باشد"),

            action: yup
                .string()
                .oneOf(['set', 'add', 'subtract'], "عملیات باید یکی از set, add, subtract باشد")
                .default('set')
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "خطاهای اعتبارسنجی",
                errors: error.errors
            });
        }

        res.status(500).json({
            success: false,
            message: "خطای سرور در اعتبارسنجی",
            error: error.message
        });
    }
};

// اعتبارسنجی پارامترهای جستجو
const searchValidation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            page: yup
                .number()
                .min(1, "شماره صفحه باید حداقل ۱ باشد")
                .default(1),

            limit: yup
                .number()
                .min(1, "تعداد آیتم در صفحه باید حداقل ۱ باشد")
                .max(100, "تعداد آیتم در صفحه نمی‌تواند بیش از ۱۰۰ باشد")
                .default(12),

            sortBy: yup
                .string()
                .oneOf(['createdAt', 'price.originalPrice', 'rating.average', 'salesStats.totalSold', 'name'], "فیلد مرتب‌سازی معتبر نیست")
                .default('createdAt'),

            sortOrder: yup
                .string()
                .oneOf(['asc', 'desc'], "ترتیب مرتب‌سازی باید asc یا desc باشد")
                .default('desc'),

            minPrice: yup
                .number()
                .min(0, "حداقل قیمت نمی‌تواند منفی باشد"),

            maxPrice: yup
                .number()
                .min(0, "حداکثر قیمت نمی‌تواند منفی باشد")
                .test('price-range', 'حداکثر قیمت باید بیشتر از حداقل قیمت باشد', function (value) {
                    if (value && this.parent.minPrice) {
                        return value >= this.parent.minPrice;
                    }
                    return true;
                }),

            category: yup
                .string()
                .oneOf([
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
                ], "دسته‌بندی انتخابی معتبر نیست"),

            brand: yup
                .string()
                .oneOf([
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
                ], "برند انتخابی معتبر نیست"),

            status: yup
                .string()
                .oneOf(["فعال", "غیرفعال", "ناموجود", "به‌زودی"], "وضعیت انتخابی معتبر نیست"),

            search: yup
                .string()
                .max(100, "متن جستجو نمی‌تواند بیش از ۱۰۰ کاراکتر باشد")
        });

        req.query = await schema.validate(req.query, { abortEarly: false, stripUnknown: true });
        next();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "خطاهای اعتبارسنجی پارامترهای جستجو",
                errors: error.errors
            });
        }

        res.status(500).json({
            success: false,
            message: "خطای سرور در اعتبارسنجی",
            error: error.message
        });
    }
};

module.exports = {
    createProductValidation,
    updateProductValidation,
    updateStockValidation,
    searchValidation
};
