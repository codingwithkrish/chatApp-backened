import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is Required']
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: validator.isEmail
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        unique: true,
        validate: validator.isMobilePhone
    },
    profileImageUrl: {
        type: String,
        required: [true, "Profile Image is required"],
    },
    notificationToken: {
        type: String,
        required: [false]
    }

}, {
    timestamps: true
})


export default mongoose.model("User", userSchema)