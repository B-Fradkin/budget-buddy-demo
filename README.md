# BudgetBuddy 💰

A modern, beautiful budget tracking app built with React and Firebase.

![BudgetBuddy](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🔐 **User Authentication** - Secure signup and login
- 💳 **Transaction Tracking** - Add, view, and delete transactions
- 📊 **Budget Categories** - Create custom categories with icons and colors
- 📈 **Visual Analytics** - Pie charts and spending breakdowns
- 📧 **Email Notifications** - Get alerts for budget thresholds and large transactions (FREE)
- 💰 **Real-time Balance** - Automatically calculated income and expenses
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ☁️ **Cloud Sync** - Data syncs across all your devices via Firebase

## Email Notifications (Optional)

BudgetBuddy can send you **FREE** email alerts for:
- 🎯 Budget thresholds (50%, 75%, 90%, 100%+)
- 💸 Large transactions over $100

**Setup:** See [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed instructions (takes 5 minutes).

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your config to `src/services/firebase.js`

3. **Set up Email Notifications (Optional):**
   - Copy `.env.example` to `.env`
   - Follow [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for EmailJS credentials

4. **Start the app:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend:** Firebase (Authentication + Firestore)
- **Routing:** React Router v6
- **Emails:** EmailJS (free tier)

## Project Structure

```
src/
├── components/         # Reusable components
├── context/            # React Context (Auth)
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── Login.js        # Login page
│   └── Register.js     # Registration page
├── services/
│   ├── firebase.js     # Firebase configuration
│   ├── database.js     # Firestore operations
│   └── emailService.js # Email notifications
└── App.js              # Main app component
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Vercel/Netlify

Simply connect your GitHub repo and deploy!

## Contributing

This is a class project, but feel free to fork and customize for your own use!

## License

MIT License - Feel free to use this project for learning and personal projects.

## Author

Created for a budget tracker class project.

---

**Happy Budgeting! 🎉**
