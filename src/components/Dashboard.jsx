import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, ShoppingCart, Utensils, Gift, X, Calendar, DollarSign, Tag, Bell } from 'lucide-react';
import Navbar from './Navbar';

const Dashboard = () => {
  // AddExpense Component (Nested)
  const AddExpense = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('food');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('outflow'); // State for transaction type

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
          description,
          type: transactionType,
        });
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Add Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Inflow/Outflow buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={() => setTransactionType('inflow')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  transactionType === 'inflow' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>Inflow</span>
              </button>
              <div className="w-4"></div> {/* Spacer */}
              <button
                type="button"
                onClick={() => setTransactionType('outflow')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  transactionType === 'outflow' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span>Outflow</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1 text-green-400" />
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Tag className="w-4 h-4 inline mr-1 text-blue-400" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1 text-purple-400" />
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Add a note about this expense..."
                  rows="3"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const dailyData = [
    { date: 'Sep 01', income: 2000, expense: 500 },
    { date: 'Sep 02', income: 1000, expense: 1200 },
    { date: 'Sep 03', income: 2500, expense: 800 },
    { date: 'Sep 04', income: 1800, expense: 2100 },
    { date: 'Sep 05', income: 3000, expense: 1500 },
    { date: 'Sep 06', income: 2200, expense: 1900 },
    { date: 'Sep 07', income: 2700, expense: 1700 },
  ];

  const monthlyData = [
    { date: 'Jul', income: 35000, expense: 24000 },
    { date: 'Aug', income: 33000, expense: 22000 },
    { date: 'Sep', income: 36000, expense: 25000 },
  ];

  const sixMonthData = [
    { date: 'Apr', income: 27000, expense: 16800 },
    { date: 'May', income: 30000, expense: 20000 },
    { date: 'Jun', income: 32000, expense: 21000 },
    { date: 'Jul', income: 35000, expense: 24000 },
    { date: 'Aug', income: 33000, expense: 22000 },
    { date: 'Sep', income: 36000, expense: 25000 },
  ];
  
  const [data, setData] = useState(monthlyData);
  const [activeTimeframe, setActiveTimeframe] = useState('3M');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [inflowData, setInflowData] = useState([
    { name: 'Bank Transfer', date: 'Sep 19, 2025', amount: 10000, icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
    { name: 'Gift from Mom', date: 'Sep 18, 2025', amount: 5000, icon: <Gift className="w-5 h-5 text-purple-400" /> },
  ]);

  const [outflowData, setOutflowData] = useState([
    { name: 'Online Shopping', date: 'Sep 20, 2025', amount: -2500, icon: <ShoppingCart className="w-5 h-5 text-blue-400" /> },
    { name: 'Restaurant', date: 'Sep 19, 2025', amount: -850, icon: <Utensils className="w-5 h-5 text-orange-400" /> },
  ]);

  const handleAddTransaction = (transactionData) => {
    const newTransaction = {
      name: transactionData.description || (transactionData.type === 'inflow' ? 'New Inflow' : 'New Outflow'),
      date: new Date(transactionData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: transactionData.type === 'inflow' ? transactionData.amount : -Math.abs(transactionData.amount),
      icon: transactionData.type === 'inflow' ? <TrendingUp className="w-5 h-5 text-green-400" /> : <ArrowDownLeft className="w-5 h-5 text-red-400" />,
    };

    if (transactionData.type === 'inflow') {
      setInflowData((prevData) => [newTransaction, ...prevData]);
    } else {
      setOutflowData((prevData) => [newTransaction, ...prevData]);
    }

    setShowAddExpense(false);
  };

  const handleTimeframeChange = (timeframe, dataset) => {
    setActiveTimeframe(timeframe);
    setData(dataset);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans">
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      {/* --- NAVBAR --- */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Good Morning, Nishant</h1>
          <p className="text-gray-400">Sunday, September 21, 2025</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Content: Graph and Transactions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">TOTAL BALANCE</p>
                  <h2 className="text-4xl font-bold text-white">₹3,49,904</h2>
                </div>
                <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => handleTimeframeChange('1M', dailyData)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '1M' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('3M', monthlyData)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '3M' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('6M', sixMonthData)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '6M' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    6M
                  </button>
                </div>
              </div>
              <div className="h-96 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                       </linearGradient>
                       <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(value) => `₹${value/1000}k`} />
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: '#1F2937', 
                         border: '1px solid #374151',
                         borderRadius: '8px',
                       }}
                       itemStyle={{ color: '#E5E7EB' }}
                       formatter={(value) => `₹${value.toLocaleString()}`}
                     />
                     <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGradient)" strokeWidth={2} />
                     <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseGradient)" strokeWidth={2} />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latest Inflow section */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Latest Inflow</h3>
                  <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View More</button>
                </div>
                <div className="space-y-4">
                  {inflowData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm text-gray-400">{item.date}</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-semibold">+₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Latest Outflow section */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Latest Outflow</h3>
                  <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View More</button>
                </div>
                <div className="space-y-4">
                  {outflowData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm text-gray-400">{item.date}</p>
                        </div>
                      </div>
                      <span className="text-red-400 font-semibold">-₹{Math.abs(item.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <div
              onClick={() => setShowAddExpense(true)}
              className="bg-gray-900 rounded-lg p-6 border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center h-[525px]"
            >
              <div className="w-16 h-16 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                <span className="text-3xl text-blue-400 font-light">+</span>
              </div>
              <h3 className="text-xl font-medium text-gray-300 group-hover:text-blue-400 transition-colors">Add Transaction</h3>
              <p className="text-sm text-gray-500 mt-1">Track your spending</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;