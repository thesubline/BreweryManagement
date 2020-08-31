const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "Transaction must contain a reference to a merchant"]
    },
    date: {
        type: Date,
        required: [true, "Must provide date and time transacted"]
    },
    device: String,
    recipes: [{
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        quantity: {
            type: Number,
            min: [0, "Must be a positive number"]
        }
    }],
    posId: String
});

module.exports = mongoose.model("Transaction", TransactionSchema);