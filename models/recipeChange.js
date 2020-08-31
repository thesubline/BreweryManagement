const mongoose = require("mongoose");

const RecipeChangeSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    changes: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },
        change: {
            type: Number,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("RecipeChange", RecipeChangeSchema);