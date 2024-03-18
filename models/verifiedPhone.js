import mongoose from 'mongoose';
const VerfiedPhone = mongoose.Schema({
    number: {
        type: String,
        required: true,
    },

    createdAt: { type: Date, default: Date.now, index: { expires: 1800 } }
}, { timestamps: true })


export default mongoose.model("VerifedPhoneNumber", VerfiedPhone);