const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hrUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pdfUrl: { type: String, required: true },
    pdfPublicId: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    respondedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('OfferLetter', offerLetterSchema);
