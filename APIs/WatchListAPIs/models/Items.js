const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    movie_title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        default: 'Not Completed'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true, collection: 'Watchlist_Items'});

module.exports = mongoose.model('Item', ItemSchema);
