import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModels.js";
import { SendNotification } from "../service/pushNotificationServices.js"

import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessages = async (req, res) => {
    console.log("Message Sent");
    try {
        const { message } = req.body;
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
            message: message
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