import User from "../models/userModels.js";
import otpGenerator from "otp-generator";
import Otp from "../models/otpModel.js";
import { sendSMS } from "../service/vonnageServices.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../controller/jwt_helper.js"
import VerifiedPhone from "../models/verifiedPhone.js"
import bcrypt from "bcryptjs"
import twilio from "twilio"
import nodemailer from "nodemailer";


export const contactUs = async (req, res, next) => {
    const name = req.body.firstName + req.body.lastName;
    const email = req.body.email;
    const message = req.body.message;
    const phone = req.body.phone;
    const mail = {
        from: name,
        to: "krishgupta.8.kg@gmail.com",
        subject: "Contact Form Submission - Portfolio",
        html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
    };
    const contactEmail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    contactEmail.verify((error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Ready to Send");
        }
    });
    contactEmail.sendMail(mail, (error) => {
        if (error) {
            res.json(error);
        } else {
            res.json({ code: 200, status: "Message Sent" });
        }
    });
}

export const sendOtp = async (req, res, next) => {
    const number = req.body.number;
    const user = await User.findOne({
        phone: number
    })

    const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
    const otp = new Otp({
        number: number,
        otp: OTP//need to change to OTP
    });
    console.log(OTP);
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);

    const result = await otp.save();
    // const client = twilio(process.env.ACCOUNT_SID, process.env.TWILLO_TOKEN);
    try {
        // client.messages
        //     .create({
        //         body: `Otp for Phone Verifaction is ${OTP}  Valid For 5 min`,
        //         from: '+13049034932',
        //         to: otp.number
        //     })
        //     .then((message) => {
        //         console.log(message);
        //         if (user) return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": true })

        //         return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": false })
        //     });
        //NEED TO uncomment above lines
        sendSMS(otp.number, "Otp for Phone Verifaction is " + OTP + "  Valid For 5 min", (err, response) => {
            if (err) return res.status(400).send({ "message": "Unable to Send Otp ", "isOtpSendt": false })
            if (user) return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": true })

            return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": false })
        });
        // if (user) return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": true })

        // return res.status(200).send({ "message": "Otp Send", "isOtpSendt": true, "registeredUser": false })

    } catch (error) {
        console.log(error);
        return res.status(400).send({ "message": "Unable to Send Otp ", "isOtpSendt": false })
    }



}

export const verifyOtp = async (req, res, next) => {
    const { number, otp, notificationToken } = req.body;
    const user = await Otp.findOne({
        number: number
    })
    if (!user) return res.status(400).send({ "message": "Wrong Otp or Otp Expired ", "isVerified": false })
    const isOtpVerified = await bcrypt.compare(otp, user.otp);

    if (isOtpVerified) {

        const userFind = await User.findOne({
            phone: number
        })
        await user.deleteOne();
        if (!userFind) {
            const verifiedPhone = new VerifiedPhone({
                number: number,

            });
            const result = await verifiedPhone.save();

            return res.status(200).send({ "message": "OTP Verification Succesfull", "isVerified": true });

        }
        const accessToken = await signAccessToken(userFind.id);
        const refreshToken = await signRefreshToken(userFind.id);
        const newUserUpdate = await User.findOneAndUpdate({
            phone: number
        }, {
            notificationToken: notificationToken
        }, {
            returnOriginal: false
        });

        return res.status(201).send({
            success: true,
            message: "User Logged In Successfully",
            user: {
                name: userFind.name,
                email: userFind.email,
                phone: userFind.phone,
                userId: userFind._id,
                notificationToken: notificationToken,
                accessToken: accessToken,
                refreshToken: refreshToken
            },

        })


    }
    return res.status(400).send({ "message": "Wrong Otp or Otp Expired ", "isVerified": false });
}

export const signup = async (req, res,) => {
    const { name, email, phone, profileImageUrl, notificationToken } = req.body;
    if (!name) {
        return res.status(400).send({ "message": "Name is Required", "isSuccesfull": false });
    }
    if (!email) {
        return res.status(400).send({ "message": "Email is Required", "isSuccesfull": false });

    }
    if (!phone) {
        return res.status(400).send({ "message": "Phone is Required", "isSuccesfull": false });

    }
    if (!profileImageUrl) {
        return res.status(400).send({ "message": "Profile Image is Required", "isSuccesfull": false });
    }
    const emailUser = await User.findOne({ email: email });
    const phoneUser = await User.findOne({ phone: phone });
    if (emailUser || phoneUser) return res.status(400).send({ "message": "Email or Phone Number  Already Exit", "isSuccesfull": false });
    const user = await VerifiedPhone.findOne({
        number: phone
    })
    if (!user) return res.status(400).send({ "message": "Phone Number Not Verified", "isSuccesfull": false })

    const newUser = await User.create({ name, email, phone, profileImageUrl, notificationToken })
    const accessToken = await signAccessToken(newUser.id);
    const refreshToken = await signRefreshToken(newUser.id);

    res.status(201).send({
        success: true,
        message: "User Created Successfully",
        user: {
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            userId: newUser._id,
            accessToken: accessToken,
            refreshToken: refreshToken
        },

    })

}

export const getAlluser = async (req, res, next) => {
    const users = await User.find({});
    res.status(201).send({
        message: "Users Found",
        users: users,
        isSuccesfull: true
    })
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw createError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId);
        const refreshToken1 = await signRefreshToken(userId);
        res.send({ accessToken, refreshToken: refreshToken1 });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" })

    } catch (error) {
        console.log("Error in logout ", error)
    }
}