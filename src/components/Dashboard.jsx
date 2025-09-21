import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, ShoppingCart, Utensils, Gift, X, Calendar, DollarSign, Tag } from 'lucide-react';

// AddExpense Component
const AddExpense = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState('');

  const categories = [
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'transport', label: 'Transportation', icon: '🚗' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'bills', label: 'Bills & Utilities', icon: '💡' },
    { value: 'health', label: 'Healthcare', icon: '🏥' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && category) {
      onSubmit({
        amount: parseFloat(amount),
        category,
        date,
        description
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a note about this expense..."
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FinZDashboard = () => {
  // Graph data
  const dailyData = [
    { date: '2025-09-01', income: 2000, expense: 500 },
    { date: '2025-09-02', income: 1000, expense: 1200 },
    { date: '2025-09-03', income: 2500, expense: 800 },
    { date: '2025-09-04', income: 1800, expense: 2100 },
    { date: '2025-09-05', income: 3000, expense: 1500 },
    { date: '2025-09-06', income: 2200, expense: 1900 },
    { date: '2025-09-07', income: 2700, expense: 1700 },
  ];

  const monthlyData = [
    { date: '2025-09-01', income: 6000, expense: 3200 },
    { date: '2025-09-05', income: 7200, expense: 4100 },
    { date: '2025-09-09', income: 5400, expense: 2900 },
    { date: '2025-09-13', income: 8100, expense: 5000 },
    { date: '2025-09-17', income: 7000, expense: 4600 },
    { date: '2025-09-21', income: 8800, expense: 5600 },
  ];

  const sixMonthData = [
    { date: '2025-04-01', income: 24000, expense: 15000 },
    { date: '2025-04-15', income: 27000, expense: 16800 },
    { date: '2025-05-01', income: 25000, expense: 16000 },
    { date: '2025-05-15', income: 30000, expense: 20000 },
    { date: '2025-06-01', income: 28000, expense: 18500 },
    { date: '2025-06-15', income: 32000, expense: 21000 },
    { date: '2025-07-01', income: 35000, expense: 24000 },
    { date: '2025-07-15', income: 33000, expense: 22000 },
    { date: '2025-08-01', income: 36000, expense: 25000 },
  ];

  const [data, setData] = useState(monthlyData);
  const [activeTimeframe, setActiveTimeframe] = useState('3M');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const handleAddExpense = (expenseData) => {
    console.log('New expense added:', expenseData);
    // Here you would typically add the expense to your data/state
    // For now, just log it
  };

  const handleTimeframeChange = (timeframe, dataset) => {
    setActiveTimeframe(timeframe);
    setData(dataset);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AddExpense Modal */}
      {showAddExpense && (
        <AddExpense 
          onClose={() => setShowAddExpense(false)}
          onSubmit={handleAddExpense}
        />
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-blue-600">FinZ</div>
              <div className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Dashboard</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Transactions</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Banks</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Learn</a>
                <a href="#" className="text-gray-700 hover:text-blue-600">Savings</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Good Morning, Nishant</h1>
          <p className="text-gray-600">Sunday, September 21, 2025</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-5 space-y-6">
            {/* Total Balance Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">TOTAL BALANCE</p>
                  <h2 className="text-4xl font-bold text-gray-900">₹3,49,904</h2>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleTimeframeChange('1M', dailyData)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeTimeframe === '1M' 
                        ? 'bg-gray-200 text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('3M', monthlyData)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeTimeframe === '3M' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    3M
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('6M', sixMonthData)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeTimeframe === '6M' 
                        ? 'bg-gray-200 text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    6M
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#EF4444" 
                      fill="url(#expenseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latest Inflow */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Latest Inflow</h3>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View More
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">Aug 29, 2025</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-semibold">+₹10,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Gift from Mom</p>
                        <p className="text-sm text-gray-500">Aug 28, 2025</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-semibold">+₹5,000</span>
                  </div>
                </div>
              </div>

              {/* Latest Outflow */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Latest Outflow</h3>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View More
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Online Shopping</p>
                        <p className="text-sm text-gray-500">Aug 29, 2025</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-semibold">-₹2,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Restaurant</p>
                        <p className="text-sm text-gray-500">Aug 28, 2025</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-semibold">-₹850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Expense Box */}
            <div 
              onClick={() => setShowAddExpense(true)}
              className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <span className="text-3xl text-blue-600 font-light">+</span>
                </div>
                <h3 className="text-xl font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Expense</h3>
                <p className="text-sm text-gray-500 mt-1">Track your spending</p>
              </div>
            </div>

            {/* Financial Goals Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Emergency Fund</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Vacation Fund</span>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Car Purchase</span>
                    <span className="text-sm text-gray-500">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Add Income</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <ArrowDownLeft className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Record Expense</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">View Analytics</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinZDashboard;