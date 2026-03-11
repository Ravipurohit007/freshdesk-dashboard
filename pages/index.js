import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Lock, Unlock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function FreshDeskDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const statusConfig = {
    2: { label: 'Open', color: 'bg-blue-500', icon: '📋' },
    3: { label: 'Pending', color: 'bg-yellow-500', icon: '⏳' },
    4: { label: 'In Progress', color: 'bg-purple-500', icon: '🔄' },
    5: { label: 'On Hold', color: 'bg-orange-500', icon: '⏸️' },
  };

  const priorityConfig = {
    1: { label: 'Low', color: '#6b7280' },
    2: { label: 'Medium', color: '#f59e0b' },
    3: { label: 'High', color: '#ef4444' },
    4: { label: 'Urgent', color: '#7c3aed' },
  };

  const fetchTickets = useCallback(async () => {
    if (!apiKey || !isAuthed) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/freshdesk-tickets?apiKey=${encodeURIComponent(apiKey)}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Failed to fetch tickets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [apiKey, isAuthed]);

  useEffect(() => {
    if (!autoRefreshEnabled || !isAuthed) return;
    const timer = setInterval(() => fetchTickets(), refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshInterval, fetchTickets, isAuthed]);

  const handleAuthenticate = () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }
    setIsAuthed(true);
    fetchTickets();
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setApiKey('');
    setTickets([]);
    setError('');
  };

  const countByStatus = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <style>{`
        .header-title { font-weight: 700; letter-spacing: -0.5px; }
        .animate-pulse-subtle { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>

      {!isAuthed ? (
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-6 h-6 text-teal-400" />
              <h1 className="header-title text-2xl">Connect Freshdesk</h1>
            </div>
            
            <p className="text-slate-400 mb-6 text-sm">Enter your Freshdesk API key</p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Your Freshdesk API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <button
                onClick={handleAuthenticate}
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? 'Authenticating...' : 'Connect'}
              </button>
            </div>

            <p className="text-slate-500 text-xs mt-6 text-center">
              API key is only used for this session.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="header-title text-4xl mb-1">Freshdesk Queue</h1>
              <p className="text-slate-400 text-sm">tatvacare-help</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
            >
              Disconnect
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4 text-sm flex-wrap">
            <button
              onClick={() => fetchTickets()}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              />
              <span className="text-slate-400">Auto-refresh</span>
            </label>
            
            {autoRefreshEnabled && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                {[15, 30, 60, 120].map((sec) => (
                  <option key={sec} value={sec}>{sec}s</option>
                ))}
              </select>
            )}
            
            {lastUpdated && (
              <span className="text-slate-500 text-xs">Last updated: {formatTime(lastUpdated)}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(statusConfig).map(([statusCode, config]) => {
              const count = countByStatus[statusCode] || 0;
              return (
                <div key={statusCode} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                  <div className="text-3xl mb-3">{config.icon}</div>
                  <div className="text-slate-400 text-sm mb-1">{config.label}</div>
                  <div className="text-3xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-200">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="font-semibold">Open Tickets ({tickets.length})</h2>
            </div>
            
            <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  {loading ? 'Loading...' : 'No tickets'}
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="px-6 py-4 hover:bg-slate-700/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{ticket.subject}</h3>
                        <p className="text-slate-400 text-sm">#{ticket.id}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>{formatDate(ticket.created_at)}</div>
                        <div className="text-teal-400">{formatTime(ticket.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

4. Click **Commit new file**

---

## Step 2: Verify in GitHub

Your repo should now have:
```
freshdesk-dashboard/
├── package.json
├── api/
│   └── freshdesk-tickets.js
└── pages/
    └── index.js
```

---

## Step 3: Vercel Auto-Deploys

1. Go to **vercel.com/dashboard**
2. If the project already exists, it will **auto-redeploy** (watch for green checkmark ✅)
3. If it doesn't exist, click **Add New** → **Project** → Select repo → **Import**

**Wait 3-5 minutes** for deployment

---

## Step 4: Test Your Dashboard

Once deployed (green checkmark), go to:
```
https://freshdesk-dashboard.vercel.app/
