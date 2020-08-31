const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: String,
    password: {
        type: String,
        minlength: 15
    },
    pos: {
        type: String,
        required: true
    },
    posId: String,
    posAccessToken: String,
    lastUpdatedTime: {
        type: String,
        default: Date.now()
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    accountStatus: {
        status: String,
        expiration: Date,
    },
    squareLocation: String,
    inventory: [{
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
        defaultUnit: {
            type: String,
            required: true
        }
    }],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);