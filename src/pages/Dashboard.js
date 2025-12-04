// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingBag, Home, Car,
  Coffee, Smartphone, Bell, Search, Plus, X, Edit2, Trash2, Save, LogOut,
  Settings, Moon, Sun, Mail, MessageSquare, ChevronDown
} from 'lucide-react';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateCategorySpending
} from '../services/database';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Modal states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Settings states
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    enabled: true
  });

  // Form states
  const [transactionForm, setTransactionForm] = useState({
    name: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    budget: '',
    color: '#3b82f6',
    icon: 'Coffee'
  });

  // Icon mapping
  const iconMap = {
    Home: Home,
    ShoppingBag: ShoppingBag,
    Car: Car,
    Coffee: Coffee,
    Smartphone: Smartphone,
    DollarSign: DollarSign
  };

  // Preset categories
  const presetCategories = [
    { name: 'Housing', budget: 1200, color: '#3b82f6', icon: 'Home' },
    { name: 'Transportation', budget: 300, color: '#f59e0b', icon: 'Car' },
    { name: 'Food & Dining', budget: 500, color: '#10b981', icon: 'Coffee' },
    { name: 'Shopping', budget: 200, color: '#8b5cf6', icon: 'ShoppingBag' },
    { name: 'Entertainment', budget: 150, color: '#ec4899', icon: 'Smartphone' },
    { name: 'Utilities', budget: 150, color: '#ef4444', icon: 'DollarSign' }
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, transactionsData] = await Promise.all([
        getCategories(currentUser.uid),
        getTransactions(currentUser.uid)
      ]);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Calculate totals
  const totalSpent = categories.reduce((acc, item) => acc + (item.value || 0), 0);
  const totalBudget = categories.reduce((acc, item) => acc + item.budget, 0);
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  // Add transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        categoryId: transactionForm.categoryId || null
      };

      await addTransaction(currentUser.uid, transactionData);
      await updateCategorySpending(currentUser.uid);
      await loadData();

      setTransactionForm({
        name: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddTransaction(false);
    } catch (error) {
      console.error('Error adding transaction:', error);

      // Show specific error message
      let errorMessage = 'Failed to add transaction';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      } else if (error.message) {
        errorMessage = `Failed to add transaction: ${error.message}`;
      }
      alert(errorMessage);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await deleteTransaction(id);
      await updateCategorySpending(currentUser.uid);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...categoryForm,
        budget: parseFloat(categoryForm.budget)
      };
      
      await addCategory(currentUser.uid, categoryData);
      await loadData();
      
      setCategoryForm({ name: '', budget: '', color: '#3b82f6', icon: 'Coffee' });
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  // Update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const updates = {
        name: categoryForm.name,
        budget: parseFloat(categoryForm.budget),
        color: categoryForm.color,
        icon: categoryForm.icon
      };

      await updateCategory(selectedCategory.id, updates);
      await loadData();

      setShowEditCategory(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      await deleteCategory(id);
      await loadData();
      setShowEditCategory(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Add preset categories
  const handleAddPresetCategories = async () => {
    try {
      setLoading(true);
      for (const preset of presetCategories) {
        await addCategory(currentUser.uid, preset);
      }
      await loadData();
      alert('Preset categories added successfully!');
    } catch (error) {
      console.error('Error adding preset categories:', error);
      alert('Failed to add preset categories');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navigation */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>BudgetBuddy</span>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {currentUser.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{currentUser.displayName}</span>
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className={`absolute top-full right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg z-50`}>
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.displayName}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    setActiveScreen('settings');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  onClick={() => {
                    setActiveScreen('notifications');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="text-sm font-medium">Notifications</span>
                </button>
              </div>
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-2`}>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-600'} transition-colors`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Screen Navigation */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', name: 'Dashboard' },
            { id: 'budget', name: 'Budget' },
            { id: 'transactions', name: 'Transactions' },
            { id: 'analytics', name: 'Analytics' },
          ].map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeScreen === screen.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {screen.name}
            </button>
          ))}
        </div>

        {/* Dashboard Screen */}
        {activeScreen === 'dashboard' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">Total Balance</div>
              <div className="text-4xl font-bold mb-4">${balance.toFixed(2)}</div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs opacity-75">Income</div>
                  <div className="text-lg font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    ${totalIncome.toFixed(2)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs opacity-75">Expenses</div>
                  <div className="text-lg font-semibold flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    ${totalExpenses.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Overview */}
            {categories.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Spending Overview</h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {categories.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${(item.value || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {totalBudget > 0 && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Spent</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Transactions */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Transactions</h2>
                <button 
                  onClick={() => setShowAddTransaction(true)}
                  className="text-sm text-blue-600 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
              {transactions.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>No transactions yet. Add your first transaction!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const Icon = iconMap[category?.icon] || DollarSign;
                    const color = category?.color || '#10b981';

                    return (
                      <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.name}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(transaction.date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Screen */}
        {activeScreen === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Budget Categories</h1>
              <button 
                onClick={() => setShowAddCategory(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {totalBudget > 0 && (
              <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-sm opacity-90 mb-2">Remaining Budget</div>
                <div className="text-4xl font-bold mb-2">${(totalBudget - totalSpent).toFixed(2)}</div>
                <div className="text-sm opacity-90">of ${totalBudget.toFixed(2)} budgeted this month</div>
              </div>
            )}

            {categories.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 text-center shadow-sm`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No budget categories yet. Create your first category to start tracking your spending!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleAddPresetCategories}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Add Preset Categories
                  </button>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Custom Category
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => {
                  const percentage = (category.value / category.budget) * 100;
                  const isOverBudget = percentage > 100;
                  const Icon = iconMap[category.icon] || Coffee;

                  return (
                    <div key={category.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm group`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                            <Icon className="w-6 h-6" style={{ color: category.color }} />
                          </div>
                          <div>
                            <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>${(category.value || 0).toFixed(2)} of ${category.budget.toFixed(2)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setCategoryForm({
                              name: category.name,
                              budget: category.budget,
                              color: category.color,
                              icon: category.icon
                            });
                            setShowEditCategory(true);
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: isOverBudget ? '#ef4444' : category.color
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {percentage.toFixed(0)}% used
                          </span>
                          <span className="text-gray-500">${(category.budget - (category.value || 0)).toFixed(2)} left</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Transactions Screen */}
        {activeScreen === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Transactions</h1>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 text-center shadow-sm`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No transactions yet. Add your first transaction!</p>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const Icon = iconMap[category?.icon] || DollarSign;
                    const color = category?.color || '#10b981';

                    return (
                      <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.name}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {category?.name || 'Uncategorized'} • {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Screen */}
        {activeScreen === 'analytics' && (
          <div className="space-y-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-sm opacity-90 mb-2">Total Income</div>
                <div className="text-4xl font-bold">${totalIncome.toFixed(2)}</div>
              </div>

              <div className="bg-red-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-sm opacity-90 mb-2">Total Expenses</div>
                <div className="text-4xl font-bold">${totalExpenses.toFixed(2)}</div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Spending by Category</h2>
              {categories.length === 0 ? (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>No categories yet. Create categories to see analytics.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const percentage = totalExpenses > 0 ? ((category.value || 0) / totalExpenses) * 100 : 0;
                    const Icon = iconMap[category.icon] || Coffee;

                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                              <Icon className="w-4 h-4" style={{ color: category.color }} />
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</span>
                          </div>
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${(category.value || 0).toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: category.color
                            }}
                          ></div>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{percentage.toFixed(1)}% of total expenses</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Screen */}
        {activeScreen === 'settings' && (
          <div className="space-y-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Appearance</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {darkMode ? 'Dark theme is enabled' : 'Light theme is enabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        darkMode ? 'transform translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Account</h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.displayName || ''}
                    disabled
                    className={`w-full px-4 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email || ''}
                    disabled
                    className={`w-full px-4 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    } rounded-lg`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Screen */}
        {activeScreen === 'notifications' && (
          <div className="space-y-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Enable Notifications</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Receive updates about your budget and transactions
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, enabled: !notifications.enabled })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    notifications.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.enabled ? 'transform translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>

              {notifications.enabled && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Notification Methods
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Mail className={`w-5 h-5 ${notifications.email ? 'text-blue-600' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Notifications</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            notifications.email ? 'transform translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Smartphone className={`w-5 h-5 ${notifications.push ? 'text-blue-600' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Push Notifications</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Receive push notifications on mobile
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            notifications.push ? 'transform translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <MessageSquare className={`w-5 h-5 ${notifications.sms ? 'text-blue-600' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>SMS Notifications</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Receive notifications via text message
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            notifications.sms ? 'transform translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
              <button 
                onClick={() => setShowAddTransaction(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={transactionForm.name}
                  onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grocery shopping"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -50.00 or +2500.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use negative for expenses, positive for income</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={transactionForm.categoryId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Income/Other)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Category</h2>
              <button 
                onClick={() => setShowAddCategory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Healthcare"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
                <input
                  type="number"
                  step="0.01"
                  value={categoryForm.budget}
                  onChange={(e) => setCategoryForm({ ...categoryForm, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        categoryForm.color === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { name: 'Home', component: Home },
                    { name: 'Car', component: Car },
                    { name: 'Coffee', component: Coffee },
                    { name: 'ShoppingBag', component: ShoppingBag },
                    { name: 'Smartphone', component: Smartphone },
                    { name: 'DollarSign', component: DollarSign }
                  ].map(({ name, component: IconComponent }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: name })}
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all hover:bg-gray-50 ${
                        categoryForm.icon === name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${categoryForm.icon === name ? 'text-blue-600' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Category</h2>
              <button 
                onClick={() => { setShowEditCategory(false); setSelectedCategory(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
                <input
                  type="number"
                  step="0.01"
                  value={categoryForm.budget}
                  onChange={(e) => setCategoryForm({ ...categoryForm, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        categoryForm.color === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { name: 'Home', component: Home },
                    { name: 'Car', component: Car },
                    { name: 'Coffee', component: Coffee },
                    { name: 'ShoppingBag', component: ShoppingBag },
                    { name: 'Smartphone', component: Smartphone },
                    { name: 'DollarSign', component: DollarSign }
                  ].map(({ name, component: IconComponent }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: name })}
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all hover:bg-gray-50 ${
                        categoryForm.icon === name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${categoryForm.icon === name ? 'text-blue-600' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(selectedCategory.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditCategory(false); setSelectedCategory(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddTransaction(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
