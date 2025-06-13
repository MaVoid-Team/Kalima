const ECProduct = require("../models/ec.productModel");
const path = require("path");
const fs = require("fs");
const { uploadProductImageMiddleware, uploadProductImageToCloudinary } = require("../utils/upload files/uploadProductImage");

// Helper to check PDF file size (max 50MB)
function isValidPDF(file) {
    return (
        file &&
        file.mimetype === "application/pdf" &&
        file.size <= 50 * 1024 * 1024 // 50MB
    );
}

exports.createProduct = async (req, res, next) => {
    try {
        const { title, subtitle, serial, section, price, paymentNumber, discountPercentage } = req.body;
        const createdBy = req.user._id;
        let sample, imageUrl;
        if (req.files && req.files.sample && req.files.sample[0]) {
            const file = req.files.sample[0];
            if (file.mimetype !== "application/pdf" || file.size > 50 * 1024 * 1024) {
                return res.status(400).json({ message: "Sample must be a PDF and <= 50MB" });
            }
            // Upload PDF to Cloudinary and get the URL
            const { uploadPDFToCloudinary } = require("../utils/upload files/uploadPDF");
            sample = await uploadPDFToCloudinary(file, "products", next);
        } else {
            return res.status(400).json({ message: "Sample PDF is required" });
        }
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            imageUrl = await uploadProductImageToCloudinary(req.files.thumbnail[0], "products", next);
        }
        const product = await ECProduct.create({
            title,
            subtitle,
            thumbnail: imageUrl,
            sample,
            section,
            serial,
            price,
            paymentNumber,
            discountPercentage,
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
        res.status(200).json({
            status: "success",
            results: products.length,
            data: {
                products,
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
        res.status(200).json({
            status: "success",
            data: {
                product,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { title, section, price, paymentNumber, discountPercentage, serial } = req.body;
        const updatedBy = req.user._id;
        let update = {
            title,
            section,
            price,
            paymentNumber,
            discountPercentage,
            serial,
            updatedBy,
            updatedAt: new Date(),
        };
        // Handle PDF sample update
        if (req.files && req.files.sample && req.files.sample[0]) {
            const file = req.files.sample[0];
            if (file.mimetype !== "application/pdf" || file.size > 50 * 1024 * 1024) {
                return res.status(400).json({ message: "Sample must be a PDF and <= 50MB" });
            }
            const { uploadPDFToCloudinary } = require("../utils/upload files/uploadPDF");
            update.sample = await uploadPDFToCloudinary(file, "products", () => { });
        }
        // Handle image thumbnail update
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            update.thumbnail = await uploadProductImageToCloudinary(req.files.thumbnail[0], "products", () => { });
        }
        const product = await ECProduct.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate({ path: "section", select: "number" });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({
            status: "success",
            data: {
                product,
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
