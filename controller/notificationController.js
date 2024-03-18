import { SendNotification } from "../service/pushNotificationServices.js"

export const notificationController = async (req, res) => {
    var message = {
        app_id: process.env.APP_ID,
        contents: {
            "en": "Test push notification"
        },
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "CUSTOM NOTIFICATION"
        }

    }
    SendNotification(message, (error, results) => {
        if (error) return next(error);
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })


}


export const notificationToDeviceController = async (req, res) => {
    console.log(req.body.devices);
    var message = {
        app_id: process.env.APP_ID,
        contents: {
            "en": "Test push notification"
        },
        included_segments: ["include_subscription_ids"],
        include_subscription_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "CUSTOM NOTIFICATION"
        }

    }
    SendNotification(message, (error, results) => {
        if (error) return next(error);
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })


}