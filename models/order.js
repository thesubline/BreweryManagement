const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },
    name: String,
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        price: {
            type: Number,
            min: 0
        }
    }]
});

module.exports = mongoose.model("Order", OrderSchema);