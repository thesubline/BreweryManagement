const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    ipAddr: String,
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant"
    },
    route: String,
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Activity", ActivitySchema);