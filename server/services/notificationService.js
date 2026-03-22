const Notification = require('../models/Notification');

async function createNotification({ recipient, sender, type, post = null, comment = '' }) {
    return Notification.create({ recipient, sender, type, post, comment });
}

module.exports = { createNotification };

