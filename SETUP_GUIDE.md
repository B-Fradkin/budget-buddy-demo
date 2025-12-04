# BudgetBuddy - Complete Setup Guide

## 🚀 Quick Start - Get Your App Running in 15 Minutes!

This guide will walk you through setting up your fully functional budget tracking web application.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- A **Google account** (for Firebase)
- A code editor like **VS Code** (recommended)
- A terminal/command prompt

---

## 📁 Step 1: Extract the Project

1. Extract the `budget-buddy-project.zip` file to your desired location
2. Open your terminal/command prompt
3. Navigate to the project folder:
   ```bash
   cd path/to/budget-buddy-project
   ```

---

## 🔥 Step 2: Set Up Firebase (5 minutes)

### 2.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `budget-buddy` (or any name you prefer)
4. Disable Google Analytics (not needed for this project)
5. Click **"Create project"**

### 2.2 Enable Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on **"Email/Password"** under "Sign-in method"
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### 2.3 Create Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Choose your preferred location (closest to you)
5. Click **"Enable"**

### 2.4 Get Your Firebase Config

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** (</>) to add a web app
5. Register app name: `BudgetBuddy Web`
6. Click **"Register app"**
7. Copy the `firebaseConfig` object - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "budget-buddy-xxxxx.firebaseapp.com",
  projectId: "budget-buddy-xxxxx",
  storageBucket: "budget-buddy-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 2.5 Add Config to Your Project

1. Open `src/services/firebase.js` in your code editor
2. Replace the placeholder config with your actual config:

```javascript
// REPLACE THIS:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// WITH YOUR ACTUAL CONFIG:
const firebaseConfig = {
  apiKey: "AIza...",  // Your actual values here
  authDomain: "budget-buddy-xxxxx.firebaseapp.com",
  projectId: "budget-buddy-xxxxx",
  storageBucket: "budget-buddy-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

3. Save the file

---

## 📦 Step 3: Install Dependencies (2 minutes)

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (React, Firebase, Recharts, etc.)

**Wait for it to complete.** You'll see a progress bar and it might take 1-2 minutes.

---

## ▶️ Step 4: Start the Application

Once installation is complete, run:

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

**You should see the login page!** 🎉

---

## 🎯 Step 5: Create Your First Account

1. Click **"Sign up"** on the login page
2. Enter your details:
   - Full Name: Your name
   - Email: Any email (doesn't need to be real for testing)
   - Password: At least 6 characters
3. Click **"Sign Up"**

You'll be automatically logged in and taken to your dashboard!

---

## ✅ Step 6: Test the Features

### Add Your First Category
1. Click **"Budget"** tab at the top
2. Click **"Add Category"**
3. Fill in:
   - Category Name: "Food"
   - Monthly Budget: 600
   - Pick a color
4. Click **"Add Category"**

### Add Your First Transaction
1. Click **"Dashboard"** tab
2. Click **"Add New"** or the blue **+** button (bottom right)
3. Fill in:
   - Description: "Grocery shopping"
   - Amount: -75.50 (negative for expense)
   - Category: Select "Food"
   - Date: Today's date
4. Click **"Add Transaction"**

**You should see your transaction appear and the category spending update!**

---

## 🔒 Step 7: Secure Your Firestore (Important!)

After testing, let's add proper security rules:

1. Go to Firebase Console → **Firestore Database**
2. Click the **"Rules"** tab
3. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. Click **"Publish"**

This ensures users can only access their own data!

---

## 🚀 Step 8: Deploy Your App (Optional)

### Deploy to Firebase Hosting (Free!)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select: **Hosting**
   - Use existing project: Select your budget-buddy project
   - Public directory: **build**
   - Single-page app: **Yes**
   - Automatic builds with GitHub: **No**

4. Build your app:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy
   ```

You'll get a URL like: `https://budget-buddy-xxxxx.web.app`

**Your app is now live on the internet!** 🌐

---

## 📱 Using Your App

### Dashboard Features
- ✅ View total balance
- ✅ See income vs expenses
- ✅ Pie chart of spending by category
- ✅ Recent transactions list
- ✅ Add new transactions (+ button)
- ✅ Delete transactions (hover and click trash icon)

### Budget Features
- ✅ View all budget categories
- ✅ See spending progress bars
- ✅ Add new categories
- ✅ Edit existing categories (hover and click edit icon)
- ✅ Color-coded categories

---

## 🔧 Troubleshooting

### "Firebase not configured" error
**Solution:** Make sure you replaced the config in `src/services/firebase.js` with your actual Firebase config.

### "Permission denied" errors
**Solution:** 
1. Check that you're logged in
2. Verify Firestore security rules are set up correctly
3. Make sure Authentication is enabled in Firebase Console

### Port 3000 already in use
**Solution:** 
```bash
# Kill the process on port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### npm install fails
**Solution:**
1. Delete `node_modules` folder and `package-lock.json`
2. Run `npm install` again
3. Make sure you have Node.js 16+ installed

### App doesn't start
**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📚 Project Structure

```
budget-buddy-project/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   └── PrivateRoute.js     # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.js      # Authentication state
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Register.js         # Registration page
│   │   └── Dashboard.js        # Main app dashboard
│   ├── services/
│   │   ├── firebase.js         # Firebase configuration
│   │   └── database.js         # Database operations
│   ├── App.js                  # Main app component
│   ├── index.js                # Entry point
│   └── index.css               # Styles
├── package.json                # Dependencies
└── tailwind.config.js          # Tailwind configuration
```

---

## 🎨 Customization Ideas

### Change Colors
Edit `src/pages/Dashboard.js` and modify the color arrays:
```javascript
['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899']
```

### Add More Icons
Import more icons from `lucide-react` in Dashboard.js:
```javascript
import { Heart, Zap, Star } from 'lucide-react';
```

### Modify Budget Calculation
Edit the calculation logic in `src/services/database.js`

---

## 🆘 Need Help?

### Common Questions

**Q: Can multiple people use this app?**
A: Yes! Each user creates their own account and has completely separate data.

**Q: Is my data secure?**
A: Yes, with the Firestore security rules in place, users can only access their own data.

**Q: Can I use this on my phone?**
A: Yes! The app is responsive and works on mobile browsers. For a native app feel, add it to your home screen.

**Q: How much does Firebase cost?**
A: Firebase has a generous free tier. For a personal budget app, you'll likely never exceed it. 

**Q: Can I export my data?**
A: You can add an export feature by accessing the Firestore data. This is a great feature to add yourself!

---

## 🎓 Learning Resources

- **React**: https://react.dev
- **Firebase**: https://firebase.google.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/

---

## ✨ Next Steps

Now that your app is running, here are some features you could add:

1. **Recurring Transactions** - Auto-add monthly bills
2. **Budget Alerts** - Email notifications when nearing limits
3. **Data Export** - Download transactions as CSV
4. **Monthly Reports** - View spending trends over time
5. **Multi-currency Support** - Track in different currencies
6. **Savings Goals** - Set and track savings targets
7. **Receipt Upload** - Attach images to transactions
8. **Dark Mode** - Add a theme toggle

---

## 🎉 Congratulations!

You now have a fully functional budget tracking web application! 

**What you've built:**
- ✅ User authentication
- ✅ Real-time database
- ✅ Transaction tracking
- ✅ Budget management
- ✅ Visual analytics
- ✅ Responsive design

Share your success and happy budgeting! 💰

---

**Made with ❤️ for your class project**
