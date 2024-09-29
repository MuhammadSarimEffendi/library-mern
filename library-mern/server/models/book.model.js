const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    price: {
        type: Number,
        default: 0
    },
    rentalPrice: {
        type: Number,
        default: 0
    },
    availableForPurchase: {
        type: Boolean,
        default: false
    },
    availableForRental: {
        type: Boolean,
        default: false
    },
    image: { // New field to store the image URL
        url: { type: String, default: null },
        public_id: { type: String, default: null }
    },
    purchasers: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            purchaseDate: {
                type: Date,
                default: Date.now
            },
            paymentId: {
                type: String
            }
        }
    ],
    renters: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            rentalDate: {
                type: Date,
                default: Date.now
            },
            rentalEndDate: {
                type: Date
            },
            paymentId: {
                type: String
            }
        }
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
