import axios from 'axios';

/**
 * Sends an SMS using the Infobip SMS API.
 * 
 * @param {string} authorization - Your API authorization token.
 * @param {string} sender - The sender's name or number.
 * @param {string} to - The recipient's phone number in international format.
 * @param {string} message - The text content of the SMS.
 * @param {function} callback - A callback function to handle the response.
 */
export function sendSms(authorization, sender, to, message, callback) {
    const url = 'https://z3rvvx.api.infobip.com/sms/3/messages';

    const data = {
        messages: [
            {
                sender: sender,
                destinations: [{ to: to }],
                content: { text: message }
            }
        ]
    };

    const headers = {
        Authorization: authorization,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };

    axios.post(url, data, { headers })
        .then(response => {
            console.log(response.data); // Log response data
            if (callback) callback(null, response.data); // Call callback with response data
        })
        .catch(error => {
            if (callback) callback(error, null); // Call callback with error
        });
}
