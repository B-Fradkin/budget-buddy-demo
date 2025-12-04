// src/services/emailService.js
import emailjs from '@emailjs/browser';

// EmailJS configuration
// Get these from your EmailJS dashboard: https://www.emailjs.com/
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

// Debug logging
console.log('EmailJS Configuration:', {
  serviceId: EMAILJS_SERVICE_ID,
  templateId: EMAILJS_TEMPLATE_ID,
  publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Not set'
});

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully');
} else {
  console.warn('EmailJS not configured - email notifications will not work. See EMAILJS_SETUP.md');
}

// Track sent notifications in localStorage to prevent duplicates
const getNotificationKey = (userId, type, key) => `notification_${userId}_${type}_${key}`;

const wasNotificationSent = (userId, type, key) => {
  const notificationKey = getNotificationKey(userId, type, key);
  return localStorage.getItem(notificationKey) !== null;
};

const markNotificationSent = (userId, type, key) => {
  const notificationKey = getNotificationKey(userId, type, key);
  localStorage.setItem(notificationKey, Date.now().toString());
};

// Send email notification
const sendEmail = async (toEmail, subject, message) => {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS not configured - skipping email send');
    return false;
  }

  try {
    console.log('Attempting to send email:', { toEmail, subject });

    const templateParams = {
      to_email: toEmail,
      subject: subject,
      message: message,
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✅ Email sent successfully:', subject);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Check budget thresholds and send notifications
export const checkBudgetThresholds = async (userId, userEmail, categories, transactions) => {
  const thresholds = [50, 75, 90, 100];

  // Calculate spending per category
  const categorySpending = {};
  transactions.forEach(transaction => {
    if (transaction.categoryId && transaction.amount < 0) {
      if (!categorySpending[transaction.categoryId]) {
        categorySpending[transaction.categoryId] = 0;
      }
      categorySpending[transaction.categoryId] += Math.abs(transaction.amount);
    }
  });

  // Check each category for threshold breaches
  for (const category of categories) {
    const spending = categorySpending[category.id] || 0;
    const budget = category.budget || 0;

    if (budget === 0) continue;

    const percentage = (spending / budget) * 100;

    for (const threshold of thresholds) {
      if (percentage >= threshold) {
        const notificationKey = `${category.id}_${threshold}`;

        // Check if we already sent this notification
        if (!wasNotificationSent(userId, 'budget_threshold', notificationKey)) {
          const status = threshold >= 100 ? 'over budget' : `at ${threshold}% of budget`;
          const subject = `Budget Alert: ${category.name}`;
          const message = `Your ${category.name} category is ${status} with $${spending.toFixed(2)} spent of $${budget.toFixed(2)} budget.`;

          const sent = await sendEmail(userEmail, subject, message);
          if (sent) {
            markNotificationSent(userId, 'budget_threshold', notificationKey);
          }
        }
      }
    }
  }
};

// Check large transactions and send notifications
export const checkLargeTransaction = async (userId, userEmail, transaction) => {
  const amount = Math.abs(transaction.amount);

  console.log('Checking large transaction:', { amount, threshold: 100 });

  // Only send notification for transactions over $100
  if (amount < 100) {
    console.log('Transaction under $100 - no notification needed');
    return;
  }

  const notificationKey = transaction.id || `${Date.now()}`;

  // Check if notification already sent
  if (wasNotificationSent(userId, 'large_transaction', notificationKey)) {
    console.log('Notification already sent for this transaction');
    return;
  }

  // Determine if income or expense
  const type = transaction.amount > 0 ? 'income' : 'expense';
  const subject = `Large ${type.charAt(0).toUpperCase() + type.slice(1)} Alert`;
  const message = `You have a new ${type} of $${amount.toFixed(2)} recorded in your budget.`;

  console.log('Sending large transaction notification:', { userId, userEmail, amount, type });

  const sent = await sendEmail(userEmail, subject, message);
  if (sent) {
    markNotificationSent(userId, 'large_transaction', notificationKey);
  }
};

// Clean up old notifications from localStorage (optional)
export const cleanupOldNotifications = () => {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('notification_')) {
      const timestamp = parseInt(localStorage.getItem(key) || '0');
      if (timestamp < thirtyDaysAgo) {
        localStorage.removeItem(key);
      }
    }
  }
};
