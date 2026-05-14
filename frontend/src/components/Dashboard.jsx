import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, X, Calendar, DollarSign, Tag } from 'lucide-react';
import { formatCurrency, getCurrentBalance } from '../services/financeSummary';

const Dashboard = ({ user = null, profile = null, transactions = [], onAddTransaction, persistenceError = null }) => {
  const DEV_MODE = true;
  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')?.[0] || 'User';
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const currentBalance = useMemo(() => getCurrentBalance(transactions), [transactions]);

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

  const [activeTimeframe, setActiveTimeframe] = useState('3M');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const inflowData = useMemo(
    () => transactions.filter((transaction) => transaction.amount >= 0),
    [transactions]
  );
  const outflowData = useMemo(
    () => transactions.filter((transaction) => transaction.amount < 0),
    [transactions]
  );

  const randomInflowSources = ['Freelance Payment', 'Salary Credit', 'Refund', 'Cashback', 'Bonus'];
  const randomOutflowSources = ['Groceries', 'Cab Ride', 'Coffee', 'Movie', 'Online Shopping', 'Dinner'];

  const createRandomTransaction = (type) => {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 25));

    const isInflow = type === 'inflow';
    const randomAmount = isInflow
      ? Math.floor(Math.random() * 9000) + 1000
      : Math.floor(Math.random() * 4500) + 200;
    const randomName = isInflow
      ? randomInflowSources[Math.floor(Math.random() * randomInflowSources.length)]
      : randomOutflowSources[Math.floor(Math.random() * randomOutflowSources.length)];

    return {
      name: randomName,
      date: randomDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      rawDate: randomDate.toISOString(),
      amount: isInflow ? randomAmount : -randomAmount,
      icon: isInflow ? <TrendingUp className="w-5 h-5 text-green-400" /> : <ArrowDownLeft className="w-5 h-5 text-red-400" />,
    };
  };

  const addRandomTransaction = async (type) => {
    const transaction = createRandomTransaction(type);
    try {
      await onAddTransaction?.(transaction);
    } catch (error) {
      console.error('Failed to save random transaction:', error);
    }
  };

  const allTransactions = useMemo(
    () => [...inflowData, ...outflowData],
    [inflowData, outflowData]
  );

  const hasTransactions = allTransactions.length > 0;

  const chartData = useMemo(() => {
    if (!hasTransactions) return [];

    const monthsToShow = activeTimeframe === '1M' ? 1 : activeTimeframe === '6M' ? 6 : 3;
    const now = new Date();
    const monthBuckets = [];

    for (let index = monthsToShow - 1; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      monthBuckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expense: 0,
      });
    }

    const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

    allTransactions.forEach((transaction) => {
      const transactionDate = transaction.rawDate ? new Date(transaction.rawDate) : new Date(transaction.date);
      if (Number.isNaN(transactionDate.getTime())) return;

      const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
      const monthBucket = monthMap.get(key);
      if (!monthBucket) return;

      if (transaction.amount >= 0) {
        monthBucket.income += transaction.amount;
      } else {
        monthBucket.expense += Math.abs(transaction.amount);
      }
    });

    return monthBuckets;
  }, [activeTimeframe, allTransactions, hasTransactions]);

  const handleAddTransaction = async (transactionData) => {
    const normalizedDescription = transactionData.description || '';
    const newTransaction = {
      name: normalizedDescription || (transactionData.type === 'inflow' ? 'New Inflow' : 'New Outflow'),
      date: new Date(transactionData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      rawDate: transactionData.date,
      amount: transactionData.type === 'inflow' ? transactionData.amount : -Math.abs(transactionData.amount),
      description: normalizedDescription,
      category: transactionData.category || 'other',
      icon: transactionData.type === 'inflow' ? <TrendingUp className="w-5 h-5 text-green-400" /> : <ArrowDownLeft className="w-5 h-5 text-red-400" />,
    };

    try {
      await onAddTransaction?.(newTransaction);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      return;
    }

    setShowAddExpense(false);
  };

  const handleTimeframeChange = (timeframe) => {
    setActiveTimeframe(timeframe);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans">
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {persistenceError ? (
          <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {persistenceError}
          </div>
        ) : null}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Good Morning, {displayName}</h1>
          <p className="text-gray-400">{todayLabel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Content: Graph and Transactions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">TOTAL BALANCE</p>
                  <h2 className="text-4xl font-bold text-white">
                    {currentBalance === null ? 'No balance yet' : formatCurrency(currentBalance)}
                  </h2>
                </div>
                <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => handleTimeframeChange('1M')}
                    disabled={!hasTransactions}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '1M' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('3M')}
                    disabled={!hasTransactions}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '3M' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('6M')}
                    disabled={!hasTransactions}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTimeframe === '6M' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    6M
                  </button>
                </div>
                {DEV_MODE && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addRandomTransaction('inflow')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                    >
                      + Random Inflow
                    </button>
                    <button
                      onClick={() => addRandomTransaction('outflow')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      + Random Outflow
                    </button>
                  </div>
                )}
              </div>
              <div className="h-96 w-full">
                {hasTransactions ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGradient)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-lg border border-dashed border-gray-700 bg-gray-950/40 flex flex-col items-center justify-center text-center px-6">
                    <p className="text-xl font-semibold text-white mb-2">No transactions yet</p>
                    <p className="text-gray-400 max-w-md">Add your first transaction to generate your expense graph.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latest Inflow section */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Latest Inflow</h3>
                  <div className="flex items-center gap-2">
                    {DEV_MODE && (
                      <button
                        onClick={() => addRandomTransaction('inflow')}
                        className="text-green-400 text-sm font-medium hover:text-green-300"
                      >
                        + Add
                      </button>
                    )}
                    <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View More</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {inflowData.length === 0 ? (
                    <p className="text-sm text-gray-500">No inflow transactions yet.</p>
                  ) : (
                    inflowData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.date}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-semibold">+{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Latest Outflow section */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Latest Outflow</h3>
                  <div className="flex items-center gap-2">
                    {DEV_MODE && (
                      <button
                        onClick={() => addRandomTransaction('outflow')}
                        className="text-red-400 text-sm font-medium hover:text-red-300"
                      >
                        + Add
                      </button>
                    )}
                    <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View More</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {outflowData.length === 0 ? (
                    <p className="text-sm text-gray-500">No outflow transactions yet.</p>
                  ) : (
                    outflowData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.date}</p>
                          </div>
                        </div>
                        <span className="text-red-400 font-semibold">-{formatCurrency(Math.abs(item.amount))}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <div
              onClick={() => setShowAddExpense(true)}
              className={`bg-gray-900 rounded-lg p-6 border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center ${hasTransactions ? 'h-[525px]' : 'h-[620px]'}`}
            >
              <div className="w-16 h-16 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                <span className="text-3xl text-blue-400 font-light">+</span>
              </div>
              <h3 className="text-xl font-medium text-gray-300 group-hover:text-blue-400 transition-colors">{hasTransactions ? 'Add Transaction' : 'Add your first transaction'}</h3>
              <p className="text-sm text-gray-500 mt-1">{hasTransactions ? 'Track your spending' : 'Start tracking to unlock your expense graph'}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
