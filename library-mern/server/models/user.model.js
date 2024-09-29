const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: [String],
        enum: ['admin', 'author', 'reader'],
        default: ['reader'],
        required: true,
    },
    avatar: {
        type: String,
        default: null
    },
    ownedBooks: [{
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }  
    }],
    rentedBooks: [{
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },  
        rentalEndDate: { type: Date }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
