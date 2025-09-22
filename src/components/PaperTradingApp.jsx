import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Wallet, History, DollarSign, IndianRupee, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PaperTradingApp = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedMarket, setSelectedMarket] = useState('US');
  const [indianExchange, setIndianExchange] = useState('NSE');
  const [marketData, setMarketData] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [chartData, setChartData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedStock, setSelectedStock] = useState(null);

  // Portfolio state - stored locally
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('trading-portfolio');
    return saved ? JSON.parse(saved) : {
      balance: 100000,
      holdings: {},
      totalValue: 100000,
      totalPL: 0
    };
  });

  // Transactions state - only completed trades
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('trading-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Portfolio history - all individual trades
  const [portfolioHistory, setPortfolioHistory] = useState(() => {
    const saved = localStorage.getItem('trading-portfolio-history');
    return saved ? JSON.parse(saved) : [];
  });

  // API configuration
  const FINNHUB_API_KEY = 'd384d7hr01qlbdj3sbo0d384d7hr01qlbdj3sbog';

  // Stock symbols
  const stockSymbols = {
    US: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'],
    NSE: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'],
    BSE: ['RELIANCE.BO', 'TCS.BO', 'INFY.BO', 'HDFCBANK.BO', 'ICICIBANK.BO']
  };

  // Market indices
  const marketIndices = {
    US: { symbol: 'SPY', name: 'S&P 500' },
    NSE: { symbol: '^NSEI', name: 'NIFTY 50' },
    BSE: { symbol: '^BSESN', name: 'SENSEX' }
  };

  // Stock names
  const stockNames = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy Services',
    'INFY.NS': 'Infosys Limited',
    'HDFCBANK.NS': 'HDFC Bank',
    'ICICIBANK.NS': 'ICICI Bank',
    'RELIANCE.BO': 'Reliance Industries',
    'TCS.BO': 'Tata Consultancy Services',
    'INFY.BO': 'Infosys Limited',
    'HDFCBANK.BO': 'HDFC Bank',
    'ICICIBANK.BO': 'ICICI Bank'
  };

  // Format currency
  const formatCurrency = (amount) => {
    const symbol = selectedMarket === 'US' ? '$' : '₹';
    return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format change percentage
  const formatChange = (change) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  // Show alerts
  const showError = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const showSuccess = (title, message) => {
    alert(`${title}: ${message}`);
  };

  // Generate mock data
  const generateMockData = () => {
    const mockStocks = stockSymbols[selectedMarket === 'US' ? 'US' : indianExchange].map(symbol => ({
      symbol,
      name: stockNames[symbol] || symbol,
      price: Math.random() * 1000 + 50,
      change: (Math.random() - 0.5) * 10,
      volume: `${(Math.random() * 5 + 1).toFixed(1)}M`
    }));

    const mockIndex = {
      name: marketIndices[selectedMarket === 'US' ? 'US' : indianExchange].name,
      value: selectedMarket === 'US' ? 4500 : indianExchange === 'NSE' ? 19500 : 65000,
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 2
    };

    return { stocks: mockStocks, index: mockIndex };
  };

  // Generate chart data
  const generateChartData = (currentPrice) => {
    const data = [];
    let price = currentPrice * 0.98; // Start slightly below current price
    
    for (let i = 0; i < 24; i++) {
      // Add realistic price movement with trend back to current price
      const volatility = currentPrice * 0.01; // 1% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      price += randomChange;
      
      // Ensure price doesn't go negative and trends back to current price near the end
      price = Math.max(price, currentPrice * 0.8);
      if (i > 20) {
        // Trend back to current price in last few data points
        price = price + (currentPrice - price) * 0.3;
      }
      
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: Math.round(price * 100) / 100
      });
    }
    
    // Ensure last point is exactly the current price
    data[data.length - 1].price = currentPrice;
    
    return data;
  };

  // Check for completed transactions
  const checkForCompletedTransactions = (symbol, currentHolding, previousHolding, sellPrice, sellTotal) => {
    if (previousHolding && previousHolding.quantity > 0 && currentHolding.quantity === 0) {
      const totalPL = sellTotal - previousHolding.totalCost;
      const plPercent = (totalPL / previousHolding.totalCost) * 100;

      const completedTransaction = {
        id: Date.now(),
        symbol,
        name: stockNames[symbol] || symbol,
        quantity: previousHolding.quantity,
        avgBuyPrice: previousHolding.avgPrice,
        avgSellPrice: sellPrice,
        totalPL,
        plPercent,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      const newTransactions = [completedTransaction, ...transactions];
      setTransactions(newTransactions);
      localStorage.setItem('trading-transactions', JSON.stringify(newTransactions));
    }
  };

  // Execute trade
  const executeTrade = (stock, type, quantity) => {
    const total = stock.price * quantity;
    
    if (type === 'BUY' && total > portfolio.balance) {
      showError('Insufficient Funds', 'Not enough balance');
      return;
    }
    
    if (type === 'SELL') {
      const currentHolding = portfolio.holdings[stock.symbol];
      if (!currentHolding || currentHolding.quantity < quantity) {
        showError('Insufficient Shares', 'Not enough shares');
        return;
      }
    }
    
    // Add to portfolio history
    const portfolioTrade = {
      id: Date.now(),
      symbol: stock.symbol,
      name: stock.name,
      type: type.toUpperCase(),
      quantity,
      price: stock.price,
      total,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    const newPortfolioHistory = [portfolioTrade, ...portfolioHistory];
    setPortfolioHistory(newPortfolioHistory);
    localStorage.setItem('trading-portfolio-history', JSON.stringify(newPortfolioHistory));
    
    // Update portfolio
    setPortfolio(prev => {
      const newPortfolio = { ...prev };
      const currentHolding = newPortfolio.holdings[stock.symbol] || { quantity: 0, totalCost: 0, avgPrice: 0 };
      const previousHolding = { ...currentHolding };
      
      if (type === 'BUY') {
        newPortfolio.balance -= total;
        const newQuantity = currentHolding.quantity + quantity;
        const newTotalCost = currentHolding.totalCost + total;
        
        newPortfolio.holdings[stock.symbol] = {
          quantity: newQuantity,
          totalCost: newTotalCost,
          avgPrice: newTotalCost / newQuantity
        };
      } else {
        newPortfolio.balance += total;
        const newQuantity = currentHolding.quantity - quantity;
        const costReduction = (quantity / currentHolding.quantity) * currentHolding.totalCost;
        
        if (newQuantity === 0) {
          checkForCompletedTransactions(stock.symbol, { quantity: 0 }, previousHolding, stock.price, total);
          delete newPortfolio.holdings[stock.symbol];
        } else {
          newPortfolio.holdings[stock.symbol] = {
            quantity: newQuantity,
            totalCost: currentHolding.totalCost - costReduction,
            avgPrice: currentHolding.avgPrice
          };
        }
      }
      
      // Update total portfolio value
      let holdingsValue = 0;
      Object.entries(newPortfolio.holdings).forEach(([symbol, holding]) => {
        if (holding.quantity > 0) {
          const currentStock = stocks.find(s => s.symbol === symbol);
          if (currentStock) {
            holdingsValue += currentStock.price * holding.quantity;
          }
        }
      });
      
      newPortfolio.totalValue = newPortfolio.balance + holdingsValue;
      
      localStorage.setItem('trading-portfolio', JSON.stringify(newPortfolio));
      return newPortfolio;
    });
    
    showSuccess('Trade Executed', `${type} ${quantity} shares of ${stock.name}`);
  };

  // Initialize data
  useEffect(() => {
    const { stocks: mockStocks, index: mockIndex } = generateMockData();
    setStocks(mockStocks);
    setMarketData(mockIndex);
    setChartData(generateChartData(mockIndex.value));
    setLastUpdated(new Date());
    setIsLoading(false);
  }, [selectedMarket, indianExchange]);

  // Update chart data when timeframe changes
  useEffect(() => {
    if (marketData) {
      setChartData(generateChartData(marketData.value));
    }
  }, [selectedTimeframe, marketData]);

  // Trade Modal
  const TradeModal = ({ stock, onClose, onTrade }) => {
    const [tradeType, setTradeType] = useState('BUY');
    const [quantity, setQuantity] = useState(1);

    const handleTrade = () => {
      onTrade(stock, tradeType, quantity);
      onClose();
    };

    const maxSellQuantity = portfolio.holdings[stock.symbol]?.quantity || 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-96">
          <h3 className="text-xl font-bold mb-4 text-white">Trade {stock.name}</h3>
          
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Current Price: {formatCurrency(stock.price)}</p>
            {tradeType === 'SELL' && (
              <p className="text-gray-400 text-sm">Available: {maxSellQuantity} shares</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">Trade Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setTradeType('BUY')}
                className={`px-4 py-2 rounded ${tradeType === 'BUY' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`px-4 py-2 rounded ${tradeType === 'SELL' ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                disabled={maxSellQuantity === 0}
              >
                SELL
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, tradeType === 'SELL' ? maxSellQuantity : 9999)))}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
              min="1"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-white">Total: {formatCurrency(stock.price * quantity)}</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleTrade}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Execute Trade
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Investr</h1>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSelectedMarket('US')}
                className={`px-4 py-2 rounded ${selectedMarket === 'US' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
              >
                US
              </button>
              <button
                onClick={() => setSelectedMarket('India')}
                className={`px-4 py-2 rounded ${selectedMarket === 'India' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
              >
                India
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('market')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'market' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BarChart3 size={20} />
              <span>Market</span>
            </button>
            
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <History size={20} />
              <span>Transactions</span>
            </button>
            
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Wallet size={20} />
              <span>Portfolio</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'market' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Market Overview</h2>
                <div className="flex items-center space-x-4">
                  {selectedMarket === 'India' && (
                    <div className="flex bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setIndianExchange('NSE')}
                        className={`px-3 py-1 rounded text-sm ${indianExchange === 'NSE' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                      >
                        NSE
                      </button>
                      <button
                        onClick={() => setIndianExchange('BSE')}
                        className={`px-3 py-1 rounded text-sm ${indianExchange === 'BSE' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                      >
                        BSE
                      </button>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    {['1D', '5D', '1M', '6M', '1Y'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimeframe(period)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          selectedTimeframe === period 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Index */}
              {marketData && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{marketData.name}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-bold">{marketData.value.toLocaleString()}</span>
                        <div className={`flex items-center space-x-1 ${marketData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {marketData.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          <span>{formatChange(marketData.changePercent)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="bg-gray-700 rounded-lg h-64 p-4">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={marketData.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={marketData.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9ca3af" 
                            fontSize={12}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            domain={['dataMin - 50', 'dataMax + 50']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#374151', 
                              border: 'none', 
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value) => [formatCurrency(value), 'Price']}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke={marketData.change >= 0 ? "#10b981" : "#ef4444"}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="animate-spin" size={32} />
                        <span className="ml-2 text-gray-400">Loading chart...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stocks */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Popular Stocks</h3>
                <div className="space-y-4">
                  {stocks.map((stock) => {
                    const miniChartData = generateChartData(stock.price).slice(-10);
                    
                    return (
                      <div key={stock.symbol} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-mono font-bold text-lg">{stock.symbol}</h4>
                                <p className="text-gray-400 text-sm">{stock.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                                <p className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatChange(stock.change)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
          {/* Mini Chart */}
                          <div className="w-32 h-16 mx-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={miniChartData}>
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke={stock.change >= 0 ? "#10b981" : "#ef4444"}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <p className="text-gray-400 text-sm">Volume: {stock.volume}</p>
                            <button
                              onClick={() => setSelectedStock(stock)}
                              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm"
                            >
                              Trade
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Completed Transactions</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History size={48} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400">No completed transactions yet</p>
                    <p className="text-sm text-gray-500">Complete a buy-sell cycle to see transactions here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className={`border-l-4 ${transaction.totalPL >= 0 ? 'border-green-400 bg-green-900/20' : 'border-red-400 bg-red-900/20'} rounded-lg p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-mono font-bold text-lg">{transaction.symbol}</h4>
                                <p className="text-gray-400 text-sm">{transaction.name}</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-sm text-gray-400">Quantity</p>
                                <p className="font-bold">{transaction.quantity}</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-sm text-gray-400">P&L</p>
                                <p className={`font-bold text-lg ${transaction.totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {transaction.totalPL >= 0 ? '+' : ''}{formatCurrency(transaction.totalPL)}
                                </p>
                                <p className={`text-sm ${transaction.totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ({transaction.plPercent >= 0 ? '+' : ''}{transaction.plPercent.toFixed(2)}%)
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm"
                            onClick={() => alert(`AI Analysis for ${transaction.symbol}: This trade resulted in a ${transaction.totalPL >= 0 ? 'profit' : 'loss'} of ${formatCurrency(Math.abs(transaction.totalPL))}`)}
                          >
                            AI Overview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Portfolio</h2>
              
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    {selectedMarket === 'US' ? <DollarSign size={24} /> : <IndianRupee size={24} />}
                    <div>
                      <p className="text-gray-400 text-sm">Cash Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolio.balance)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <Wallet size={24} />
                    <div>
                      <p className="text-gray-400 text-sm">Total Portfolio</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp size={24} />
                    <div>
                      <p className="text-gray-400 text-sm">Total P&L</p>
                      <p className={`text-2xl font-bold ${portfolio.totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {portfolio.totalPL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPL)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holdings */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Current Holdings</h3>
                {Object.keys(portfolio.holdings).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No holdings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(portfolio.holdings).map(([symbol, holding]) => (
                      <div key={symbol} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="font-mono">{symbol}</span>
                        <span>{holding.quantity} shares</span>
                        <span>{formatCurrency(holding.avgPrice)} avg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio History */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Portfolio History</h3>
                {portfolioHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No trades yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Symbol</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Quantity</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioHistory.map((trade) => (
                          <tr key={trade.id} className="border-b border-gray-700">
                            <td className="py-4">{trade.date}</td>
                            <td className="py-4 font-mono">{trade.symbol}</td>
                            <td className={`py-4 font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.type}
                            </td>
                            <td className="py-4">{trade.quantity}</td>
                            <td className="py-4">{formatCurrency(trade.price)}</td>
                            <td className="py-4">{formatCurrency(trade.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onTrade={executeTrade}
        />
      )}
    </div>
  );
};

export default PaperTradingApp;
                