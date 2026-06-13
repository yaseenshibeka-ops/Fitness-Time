const crypto = require('crypto');

const generateOrderReference = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `FT-${timestamp}-${random}`;
};

module.exports = {
    generateOrderReference
};
