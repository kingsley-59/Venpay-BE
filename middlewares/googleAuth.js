const { OAuth2Client } = require('google-auth-library');
require('dotenv').config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        console.error('Error verifying Google token: ', error);
        return;
    }
};

module.exports = { verify }