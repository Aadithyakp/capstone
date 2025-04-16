const axios = require('axios');

// Replace with your actual reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = '6LdIIBsrAAAAAAtX_uJTOuLRQY5irHL1v8XJ6vmS'; // This is Google's test secret key
const VERIFICATION_TIMEOUT = 5000; // 5 seconds timeout
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple in-memory cache
const tokenCache = new Map();

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of tokenCache.entries()) {
        if (now - data.timestamp > CACHE_DURATION) {
            tokenCache.delete(token);
        }
    }
}, CACHE_DURATION);

const verifyCaptcha = async (req, res, next) => {
    const captchaToken = req.body.captchaToken;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA token required' });
    }

    // Check cache first
    const cachedResult = tokenCache.get(captchaToken);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
        if (cachedResult.success) {
            return next();
        }
        return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT);

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
            null,
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const { success } = response.data;

        // Cache the result
        tokenCache.set(captchaToken, {
            success,
            timestamp: Date.now()
        });

        if (!success) {
            return res.status(400).json({ message: 'CAPTCHA verification failed' });
        }

        next();
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(408).json({ message: 'CAPTCHA verification timeout' });
        }
        console.error('CAPTCHA verification error:', error.message);
        res.status(500).json({ message: 'CAPTCHA verification failed' });
    }
};

module.exports = verifyCaptcha;
