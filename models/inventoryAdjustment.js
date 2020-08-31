const mongoose = require("mongoose");

let inventoryAdjustmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "Must provide the merchant"]
    },
    ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: [true, "Must provide the ingredient"]
    },
    quantity: {
        type: Number,
        required: [true, "Must provide a quantity"]
    }
});

module.exports = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);