import mongoose from 'mongoose';
const OtpSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { timestamps: true })


export default mongoose.model("Otp", OtpSchema);