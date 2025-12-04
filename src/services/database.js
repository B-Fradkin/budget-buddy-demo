// src/services/database.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Categories
export const addCategory = async (userId, categoryData) => {
  const categoriesRef = collection(db, 'categories');
  return await addDoc(categoriesRef, {
    ...categoryData,
    userId,
    value: 0,
    createdAt: Timestamp.now()
  });
};

export const getCategories = async (userId) => {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateCategory = async (categoryId, updates) => {
  const categoryRef = doc(db, 'categories', categoryId);
  return await updateDoc(categoryRef, updates);
};

export const deleteCategory = async (categoryId) => {
  const categoryRef = doc(db, 'categories', categoryId);
  return await deleteDoc(categoryRef);
};

// Transactions
export const addTransaction = async (userId, transactionData) => {
  const transactionsRef = collection(db, 'transactions');
  return await addDoc(transactionsRef, {
    ...transactionData,
    userId,
    createdAt: Timestamp.now()
  });
};

export const getTransactions = async (userId) => {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  // Sort by date in JavaScript instead of Firestore to avoid needing an index
  const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const updateTransaction = async (transactionId, updates) => {
  const transactionRef = doc(db, 'transactions', transactionId);
  return await updateDoc(transactionRef, updates);
};

export const deleteTransaction = async (transactionId) => {
  const transactionRef = doc(db, 'transactions', transactionId);
  return await deleteDoc(transactionRef);
};

// Helper function to calculate category spending
export const updateCategorySpending = async (userId) => {
  const transactions = await getTransactions(userId);
  const categories = await getCategories(userId);
  
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
  
  // Update each category's value
  for (const category of categories) {
    const spending = categorySpending[category.id] || 0;
    if (category.value !== spending) {
      await updateCategory(category.id, { value: spending });
    }
  }
};
