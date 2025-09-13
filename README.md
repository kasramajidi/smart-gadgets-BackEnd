# 🚀 Smart Gadgets Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-green.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

**A powerful and comprehensive API for smart gadgets e-commerce platform**

[Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About Project](#-about-project)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Examples](#-examples)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About Project

**Smart Gadgets Backend** is a complete and professional API for an online smart gadgets store built with Node.js and Express.js. This project includes all the features needed for a modern e-commerce platform including product management, user management, articles, comments, and newsletter system.

### 🌟 Key Highlights

- ✅ **Complete RESTful API** with standard practices
- ✅ **JWT Authentication** with role-based access control
- ✅ **Advanced Product Management** with filtering and search
- ✅ **Comment System** with reply functionality
- ✅ **Article Management** with multimedia support
- ✅ **Newsletter System** with email automation
- ✅ **Complete Validation** with Yup
- ✅ **Auto-generated Swagger Documentation**
- ✅ **Multimedia File Support**

---

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login** with secure authentication
- **JWT Authentication** with secure cookies
- **Role-based Access Control** (Admin/User)
- **Guest Login** for temporary access
- **Session Management** for users

### 🛍️ Product Management
- **Complete Catalog** of smart gadgets products
- **Advanced Filtering** by category, brand, price
- **Text Search** in product names and descriptions
- **Inventory Management** and product status
- **Discounts** and special offers
- **Rating System** and sales analytics
- **SEO-friendly URLs** and metadata

### 📝 Article System
- **Content Management** with multimedia support
- **Categorization** and tagging
- **Publish/Unpublish** articles
- **Search** within article content
- **Upload Images, Videos, and Audio**

### 💬 Comment System
- **Nested Comments** with reply functionality
- **Admin Approval/Rejection** of comments
- **Admin Response** to user comments
- **Bulk Comment Management**

### 📧 Newsletter System
- **Newsletter Subscription** for users
- **Automated Email** sending
- **Subscriber Management**

### 📊 Analytics & Reporting
- **Sales Analytics** for products
- **View Count** and wishlist tracking
- **Administrative Reports**

---

## 🛠️ Technologies Used

### Backend Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

### File Management
- **Multer** - File upload handling
- **Cloudinary** - Cloud file management

### Validation & Documentation
- **Yup** - Schema validation
- **Swagger** - API documentation

### Email & Communication
- **Nodemailer** - Email sending
- **Axios** - HTTP client

---

## 🚀 Installation

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (version 4.4 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/your-username/smart-gadgets.git
cd smart-gadgets
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

4. **Set up environment variables** (`.env` file)
```env
# Database
MONGO_URI=mongodb://localhost:27017/smart-gadgets

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=7500
NODE_ENV=development
```

5. **Run the project**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. **Access API documentation**
```
http://localhost:7500/api-docs
```

---

## ⚙️ Configuration

### Database Setup
The project uses MongoDB. Make sure MongoDB is installed and running on your system.

### Email Configuration
To use the newsletter system, configure SMTP settings in the `.env` file.

### Cloudinary Setup (Optional)
For cloud file uploads, add Cloudinary configuration settings.

---

## 📚 API Documentation

### 🔐 Authentication

#### Register New User
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Guest Login
```http
POST /auth/guest
```

### 🛍️ Products

#### Get All Products
```http
GET /products?page=1&limit=12&category=Headphones&brand=Samsung
```

#### Get Product by ID
```http
GET /products/:id
```

#### Create New Product (Admin Required)
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Galaxy Buds Pro",
  "title": "Samsung Wireless Headphones",
  "description": "Wireless headphones with excellent sound quality",
  "category": "Headphones",
  "brand": "Samsung",
  "price": {
    "originalPrice": 2500000,
    "discountPrice": 2000000
  },
  "images": {
    "mainImage": "https://example.com/image.jpg"
  },
  "inventory": {
    "stock": 50
  }
}
```

#### Featured Products
```http
GET /products/featured?limit=8
```

#### Discounted Products
```http
GET /products/discounted?limit=8
```

### 📝 Articles

#### Get All Articles
```http
GET /articles?page=1&limit=10&published=true
```

#### Create New Article (Admin Required)
```http
POST /articles
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Headphone Buying Guide",
  "slug": "headphone-buying-guide",
  "summery": "Complete guide to buying the right headphones",
  "category": "Guide",
  "published": true,
  "contentSections": [
    {
      "type": "text",
      "text": "Article content..."
    }
  ]
}
```

### 💬 Comments

#### Create New Comment
```http
POST /comments
Content-Type: application/json

{
  "text": "My comment about the product",
  "email": "user@example.com",
  "username": "User",
  "postId": "product_id_here"
}
```

#### Get Product Comments
```http
GET /comments/:postId
```

### 📧 Newsletter

#### Subscribe to Newsletter
```http
POST /newLetter
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

## 💡 Examples

### Complete Product Creation Example

```javascript
const productData = {
  name: "AirPods Pro 2",
  title: "Apple AirPods Pro 2nd Generation Wireless Headphones",
  description: "Wireless headphones with active noise cancellation and studio-quality sound",
  shortDescription: "Apple wireless headphones with noise cancellation",
  category: "Headphones",
  brand: "Apple",
  price: {
    originalPrice: 4500000,
    discountPrice: 4000000
  },
  images: {
    mainImage: "https://example.com/airpods-pro-2.jpg",
    thumbnails: [
      "https://example.com/airpods-pro-2-thumb1.jpg",
      "https://example.com/airpods-pro-2-thumb2.jpg"
    ],
    galleryImages: [
      "https://example.com/airpods-pro-2-gallery1.jpg",
      "https://example.com/airpods-pro-2-gallery2.jpg"
    ]
  },
  specifications: {
    colors: [
      { name: "White", colorCode: "#FFFFFF", available: true }
    ],
    connectivity: {
      bluetooth: "5.3",
      wifi: "Wi-Fi 6",
      usb: "Lightning",
      nfc: true
    },
    battery: {
      capacity: "Up to 6 hours",
      chargingTime: "5 minutes for 1 hour",
      playbackTime: "Up to 30 hours with case"
    },
    dimensions: {
      weight: "5.3g per earbud",
      size: "45.2 x 60.9 x 21.7 mm"
    },
    features: [
      "Active Noise Cancellation",
      "Transparency Mode",
      "Water and Sweat Resistant",
      "Touch Controls"
    ],
    compatibility: [
      "iPhone",
      "iPad",
      "Mac",
      "Apple Watch"
    ]
  },
  inventory: {
    stock: 25,
    inStock: true,
    reservedStock: 0
  },
  status: "Active",
  tags: ["Featured", "New", "Special Offer"],
  warranty: {
    period: "1 Year",
    description: "Official Apple Warranty"
  },
  shipping: {
    freeShipping: true,
    weight: 0.2,
    dimensions: {
      length: 10,
      width: 8,
      height: 3
    }
  }
};
```

### Product Filtering Examples

```javascript
// Filter by category and brand
const filters = {
  category: "Headphones",
  brand: "Samsung",
  minPrice: 1000000,
  maxPrice: 5000000,
  inStock: true,
  sortBy: "price.originalPrice",
  sortOrder: "asc"
};

// Search in products
const searchQuery = {
  search: "Galaxy Buds",
  sortBy: "rating.average",
  sortOrder: "desc"
};
```

---

## 📁 Project Structure

```
smart-gadgets/
├── 📁 public/                 # Static files
│   ├── 📁 images/            # Images
│   ├── 📁 Audio/             # Audio files
│   └── 📁 Video/             # Video files
├── 📁 src/                   # Source code
│   ├── 📁 middleware/        # Middlewares
│   │   ├── Auth.js          # Authentication
│   │   └── Admin.js         # Admin access
│   ├── 📁 models/           # Database models
│   │   ├── User.js          # User model
│   │   ├── Product.js       # Product model
│   │   ├── Article.js       # Article model
│   │   ├── Comment.js       # Comment model
│   │   ├── Feedback.js      # Feedback model
│   │   └── Newsletter.js    # Newsletter model
│   ├── 📁 modules/          # API modules
│   │   ├── 📁 Auth/         # Authentication
│   │   ├── 📁 Product/      # Products
│   │   ├── 📁 Article/      # Articles
│   │   ├── 📁 Comment/      # Comments
│   │   ├── 📁 Feedback/     # Feedback
│   │   ├── 📁 NewLetter/    # Newsletter
│   │   └── 📁 api/          # Swagger documentation
│   ├── 📁 utils/            # Utility functions
│   └── app.js               # Express configuration
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # Project documentation
```

---

## 🤝 Contributing

We welcome contributions! To contribute to this project:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Check your code with **ESLint**
- Run **tests** before submitting
- Update **documentation** as needed
- Use meaningful **commit messages**

---

## 📞 Contact & Support
- **Email**: kasramajidy81@gmail.com
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/smart-gadgets/issues)
- **Documentation**: [Complete API Guide](https://smart-gadgets-backend.onrender.com/api)

---

<div align="center">

**⭐ If this project was helpful, please give it a star! ⭐**

Made with ❤️ for the developer community

</div>
