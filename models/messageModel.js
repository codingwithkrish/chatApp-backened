import mongoose from 'mongoose'
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    type: {
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'money'],
        type: String,
        default: 'text'
    },
    message: {
        type: String,
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    moneyAcceptedAt: {
        type: Date,
        default: Date.now
    },
    iv: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Message = mongoose.model("Message", messageSchema);
export default Message;