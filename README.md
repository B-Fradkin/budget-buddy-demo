# BudgetBuddy 💰

A modern, full-stack budget tracking web application built with React and Firebase.

![BudgetBuddy](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🔐 **User Authentication** - Secure signup and login
- 💳 **Transaction Tracking** - Add, view, and delete transactions
- 📊 **Budget Categories** - Create and manage spending categories
- 📈 **Visual Analytics** - Pie charts and progress bars
- 💰 **Real-time Balance** - Automatically calculated income and expenses
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ☁️ **Cloud Database** - Firebase Firestore for data persistence

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

3. **Start the app:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Full Setup Instructions

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step instructions.

## Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend:** Firebase (Authentication + Firestore)
- **Routing:** React Router v6

## Project Structure

```
src/
├── components/     # Reusable components
├── context/        # React Context (Auth)
├── pages/          # Page components
├── services/       # Firebase services
└── App.js          # Main app component
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
