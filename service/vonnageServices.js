import { Vonage } from "@vonage/server-sdk"


async function sendSMS(to, text, callback) {
    const vonage = new Vonage({
        apiKey: process.env.API_KEY_VONNAGE,
        apiSecret: process.env.API_SECRET_VONNAGE
    })
    const from = "Vonage APIs"


    await vonage.sms.send({ to, from, text })
        .then(resp => {
            console.log('Message sent successfully');
            console.log(resp);
            callback(null, resp);

        })
        .catch(err => {
            console.log('There was an error sending the messages.'); console.error(err);
            callback({ message: err.message });
        });

}

export { sendSMS };