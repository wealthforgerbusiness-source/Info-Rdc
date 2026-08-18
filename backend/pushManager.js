/**
 * Gestionnaire Web Push Notifications
 */
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@info-rdc.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

function addSubscription(sub) {
  subscriptions.push(sub);
}

async function sendNotificationToAll(data) {
  const notificationPayload = JSON.stringify(data);

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, notificationPayload);
    } catch (err) {
      console.error("Erreur d'envoi push:", err.message);
    }
  }
}

module.exports = { addSubscription, sendNotificationToAll };
