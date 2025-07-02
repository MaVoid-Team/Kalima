const ECProduct = require("../models/ec.productModel");
const path = require("path");
const fs = require("fs");

// Helper to check PDF file size (max 50MB)
function isValidPDF(file) {
    return (
        file &&
        file.mimetype === "application/pdf" &&
        file.size <= 75 * 1024 * 1024 // 50MB
    );
}

exports.createProduct = async (req, res, next) => {
    try {
        const { title, serial, section, price, priceAfterDiscount, description, whatsAppNumber, paymentNumber } = req.body;
        const createdBy = req.user._id;
        let sample, imageUrl, gallery = [];
        if (req.files && req.files.sample && req.files.sample[0]) {
            const file = req.files.sample[0];
            if (file.mimetype !== "application/pdf" || file.size > 75 * 1024 * 1024) {
                return res.status(400).json({ message: "Sample must be a PDF and <= 75MB" });
            }
            sample = file.path;
        } else {
            return res.status(400).json({ message: "Sample PDF is required" });
        }
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            imageUrl = req.files.thumbnail[0].path;
        }
        if (req.files && req.files.gallery) {
            gallery = req.files.gallery.map(file => file.path);
        }
        // discountPercentage will be auto-calculated in the model, do not include in create
        const product = await ECProduct.create({
            title,
            thumbnail: imageUrl,
            sample,
            gallery,
            section,
            serial,
            price,
            priceAfterDiscount,
            description,
            whatsAppNumber,
            paymentNumber,
            createdBy,
        });

        res.status(201).json({
            message: "Product created successfully",
            data: {
                product
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await ECProduct.find().populate({
            path: "section",
            select: "number"
        });
        // Ensure all fields are present in the response
        const productsWithAllFields = products.map(product => {
            const obj = product.toObject();
            return {
                ...obj,
                description: obj.description,
                whatsAppNumber: obj.whatsAppNumber,
                paymentNumber: obj.paymentNumber,
                gallery: obj.gallery
            };
        });
        res.status(200).json({
            status: "success",
            results: productsWithAllFields.length,
            data: {
                products: productsWithAllFields,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await ECProduct.findById(req.params.id).populate({
            path: "section",
            select: "number"
        });
        if (!product) return res.status(404).json({ message: "Product not found" });
        const obj = product.toObject();
        res.status(200).json({
            status: "success",
            data: {
                product: {
                    ...obj,
                    description: obj.description,
                    whatsAppNumber: obj.whatsAppNumber,
                    paymentNumber: obj.paymentNumber,
                    gallery: obj.gallery
                },
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { title, section, price, priceAfterDiscount, serial, description, whatsAppNumber, paymentNumber } = req.body;
        const updatedBy = req.user._id;
        let update = {
            title,
            section,
            price,
            priceAfterDiscount,
            serial,
            description,
            updatedBy,
            whatsAppNumber,
            paymentNumber,
            updatedAt: new Date(),
        };
        // Handle PDF sample update
        if (req.files && req.files.sample && req.files.sample[0]) {
            const file = req.files.sample[0];
            if (file.mimetype !== "application/pdf" || file.size > 75 * 1024 * 1024) {
                return res.status(400).json({ message: "Sample must be a PDF and <= 75MB" });
            }
            update.sample = file.path;
        }
        // Handle image thumbnail update
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            update.thumbnail = req.files.thumbnail[0].path;
        }
        // Handle gallery update
        if (req.files && req.files.gallery) {
            update.gallery = req.files.gallery.map(file => file.path);
        }
        const product = await ECProduct.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate({ path: "section", select: "number" });
        if (!product) return res.status(404).json({ message: "Product not found" });
        const obj = product.toObject();
        res.status(200).json({
            status: "success",
            data: {
                product: {
                    ...obj,
                    description: obj.description,
                    whatsAppNumber: obj.whatsAppNumber,
                    paymentNumber: obj.paymentNumber,
                    gallery: obj.gallery,
                    sample: obj.sample,
                    thumbnail: obj.thumbnail,
                    subtitle: obj.subtitle
                },
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await ECProduct.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        // Optionally delete the sample file
        if (product.sample && fs.existsSync(product.sample)) {
            fs.unlinkSync(product.sample);
        }
        res.status(200).json({
            status: "success",
            message: "Product deleted"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
