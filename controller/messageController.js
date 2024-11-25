import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModels.js";
import { SendNotification } from "../service/pushNotificationServices.js"

import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessages = async (req, res) => {
    console.log("Message Sent");
    try {
        const { message, iv, type } = req.body;
        const { userId: receiverId } = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],

            })
        }
        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
            iv: iv,
            type: type
        })
        if (newMessage) {
            conversation.messages.push(newMessage._id);

        }


        await Promise.all([conversation.save(), newMessage.save()])

        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);

        }
        const userFind = await User.findOne({
            _id: receiverId
        });
        const fromUser = await User.findOne({
            _id: senderId
        })
        console.log(userFind);
        if (userFind && fromUser && userFind.notificationToken) {
            var notificationMessage = {
                app_id: process.env.APP_ID,
                contents: {
                    "en": message
                },
                headings: {
                    "en": `Message from ${fromUser.name}`
                },
                subtitle: {
                    "en": "New Message Received "
                },
                included_segments: ["include_subscription_ids"],
                include_subscription_ids: [`${userFind.notificationToken}`],
                content_available: true,
                small_icon: "ic_notification_icon",
                data: {
                    user: userFind,
                    PushTitle: `Message from ${userFind.name}`
                }
            };
            SendNotification(notificationMessage, async (error, results) => {
                if (error) return next(error);
                return res.status(201).send({
                    message: newMessage,
                    isOtpSent: true,

                })
            })
        } else {
            return res.status(201).send({
                message: newMessage,
                isOtpSent: false,

            });

        }
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId: userToChatId } = req.params;
        const senderId = req.user._id;
        console.log(userToChatId + " " + senderId);
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");
        if (!conversation) return res.status(200).json([]);
        return res.status(200).json(conversation.messages);


    } catch (error) {
        console.log("Error in getMessages controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error" })

    }
}

export const acceptMoney = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const senderId = req.user._id;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });
        if (message.type !== "money") return res.status(400).json({ error: "Invalid message type" });
        console.log(message.receiverId + " " + senderId.toString());
        if (message.receiverId.toString() !== senderId.toString()) return res.status(401).json({ error: "Unauthorized" });
        message.accepted = true;
        message.moneyAcceptedAt = Date.now();
        await message.save();
        return res.status(200).json({ message: "Money accepted successfully" });
    } catch (error) {
        console.log("Error in acceptMoney controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error" });
    }
}