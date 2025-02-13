const axios = require('axios');

// Replace with your actual reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = '6LePlNQqAAAAAIstsbBONeWzvC9mY6ItprJivEUP'; // This is Google's test secret key

const verifyCaptcha = async (req, res, next) => {
    const captchaToken = req.body.captchaToken;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );

        const { success } = response.data;

        if (!success) {
            return res.status(400).json({ message: 'CAPTCHA verification failed' });
        }

        next();
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        res.status(500).json({ message: 'CAPTCHA verification failed' });
    }
};

module.exports = verifyCaptcha;
