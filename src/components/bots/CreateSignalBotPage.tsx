import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  Settings, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { supabase, Exchange, ApiKey } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const CreateSignalBotPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    signalAlerts: true,
    longOrders: true,
    shortOrders: true,
    advanced: false
  });

  const [formData, setFormData] = useState({
    name: 'Binance Futures USDT-M Signal Bot',
    exchange_id: '',
    api_key_id: '',
    trading_pair: 'ETHUSDT/USDT',
    alert_type: 'custom_signal',
    leverage_type: 'cross',
    leverage_value: 3,
    max_margin_usage: 100,
    margin_per_bot: 'percentage',
    webhook_url: 'https://api.3commas.io/signal_bots/webhooks',
    
    // Long orders settings
    long_entry_enabled: true,
    long_volume_per_order: 100,
    long_order_type: 'market',
    long_total_investment_percentage: 100,
    long_webhook_message: '{"secret": "eyjhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWduYWxfaWQiOiI2NzA4MjU4NyIsImJvdF9pZCI6IjY3MDgyNTg3IiwiYWN0aW9uIjoiYnV5IiwicGFpcnMiOlsiRVRIVVNEVCJdLCJtZXNzYWdlX3R5cGUiOiJidXkifQ.8d3B3eibW..."}',
    
    // Price deviation options
    long_price_deviation_same_order: false,
    long_price_deviation_same_order_value: 1,
    long_price_deviation_average_entry: false,
    long_price_deviation_average_entry_value: 1,
    long_reset_price_deviation: false,
    long_max_entry_orders: 5,
    
    // Exit/Take profit/Stop loss
    long_exit_order_enabled: true,
    long_take_profit_enabled: true,
    long_stop_loss_enabled: true,
    
    // Short orders settings
    short_entry_enabled: true,
    short_volume_per_order: 100,
    short_order_type: 'market',
    short_total_investment_percentage: 100,
    short_webhook_message: '{"secret": "eyjhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWduYWxfaWQiOiI2NzA4MjU4NyIsImJvdF9pZCI6IjY3MDgyNTg3IiwiYWN0aW9uIjoic2VsbCIsInBhaXJzIjpbIkVUSFVTRFQiXSwibWVzc2FnZV90eXBlIjoic2VsbCJ9.8d3B3eibW..."}',
    
    // Price deviation options for short
    short_price_deviation_same_order: false,
    short_price_deviation_same_order_value: 1,
    short_price_deviation_average_entry: false,
    short_price_deviation_average_entry_value: 1,
    short_reset_price_deviation: false,
    short_max_entry_orders: 5,
    
    // Exit/Take profit/Stop loss for short
    short_exit_order_enabled: true,
    short_take_profit_enabled: true,
    short_stop_loss_enabled: true,
    
    // Advanced settings
    reverse_position: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch exchanges
      const { data: exchangesData } = await supabase
        .from('exchanges')
        .select('*')
        .eq('is_active', true);
      
      // Fetch user's API keys
      const { data: apiKeysData } = await supabase
        .from('api_keys')
        .select('*, exchange:exchanges(*)')
        .eq('user_id', userProfile?.id)
        .eq('is_active', true);

      setExchanges(exchangesData || []);
      setApiKeys(apiKeysData || []);
      
      // Set default exchange if available
      if (apiKeysData && apiKeysData.length > 0) {
        setFormData(prev => ({
          ...prev,
          api_key_id: apiKeysData[0].id,
          exchange_id: apiKeysData[0].exchange_id
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const botConfig = {
        alert_type: formData.alert_type,
        leverage_type: formData.leverage_type,
        leverage_value: formData.leverage_value,
        max_margin_usage: formData.max_margin_usage,
        webhook_url: formData.webhook_url,
        long_settings: {
          enabled: formData.long_entry_enabled,
          volume_per_order: formData.long_volume_per_order,
          order_type: formData.long_order_type,
          total_investment_percentage: formData.long_total_investment_percentage,
          webhook_message: formData.long_webhook_message,
          price_deviation_same_order: formData.long_price_deviation_same_order,
          price_deviation_same_order_value: formData.long_price_deviation_same_order_value,
          price_deviation_average_entry: formData.long_price_deviation_average_entry,
          price_deviation_average_entry_value: formData.long_price_deviation_average_entry_value,
          reset_price_deviation: formData.long_reset_price_deviation,
          max_entry_orders: formData.long_max_entry_orders,
          exit_order_enabled: formData.long_exit_order_enabled,
          take_profit_enabled: formData.long_take_profit_enabled,
          stop_loss_enabled: formData.long_stop_loss_enabled
        },
        short_settings: {
          enabled: formData.short_entry_enabled,
          volume_per_order: formData.short_volume_per_order,
          order_type: formData.short_order_type,
          total_investment_percentage: formData.short_total_investment_percentage,
          webhook_message: formData.short_webhook_message,
          price_deviation_same_order: formData.short_price_deviation_same_order,
          price_deviation_same_order_value: formData.short_price_deviation_same_order_value,
          price_deviation_average_entry: formData.short_price_deviation_average_entry,
          price_deviation_average_entry_value: formData.short_price_deviation_average_entry_value,
          reset_price_deviation: formData.short_reset_price_deviation,
          max_entry_orders: formData.short_max_entry_orders,
          exit_order_enabled: formData.short_exit_order_enabled,
          take_profit_enabled: formData.short_take_profit_enabled,
          stop_loss_enabled: formData.short_stop_loss_enabled
        },
        advanced_settings: {
          reverse_position: formData.reverse_position
        }
      };

      const { error } = await supabase
        .from('trading_bots')
        .insert({
          user_id: userProfile?.id,
          name: formData.name,
          strategy_type: 'signal',
          trading_pair: formData.trading_pair,
          base_currency: formData.trading_pair.split('/')[0],
          quote_currency: formData.trading_pair.split('/')[1],
          exchange_id: formData.exchange_id,
          api_key_id: formData.api_key_id,
          initial_balance: 1000, // Default value
          config: botConfig,
          status: 'stopped',
          webhook_url: formData.webhook_url
        });

      if (error) throw error;

      // Navigate back to bots page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error creating signal bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(formData.webhook_url);
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-teal-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Create Signal Bot</h1>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Info className="w-4 h-4" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => toggleSection('main')}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <h2 className="text-lg font-semibold">Main</h2>
                {expandedSections.main ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSections.main && (
                <div className="p-6 pt-0 space-y-6">
                  {/* Alert Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Alert type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.alert_type === 'custom_signal'
                            ? 'border-teal-500 bg-teal-500 bg-opacity-10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setFormData({ ...formData, alert_type: 'custom_signal' })}
                      >
                        <div className="flex items-center space-x-3">
                          <Zap className="w-6 h-6 text-teal-400" />
                          <div>
                            <h3 className="font-semibold">Custom Signal</h3>
                            <p className="text-sm text-gray-400">Different types of signals from any sources.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.alert_type === 'tradingview_strategy'
                            ? 'border-teal-500 bg-teal-500 bg-opacity-10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setFormData({ ...formData, alert_type: 'tradingview_strategy' })}
                      >
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-6 h-6 text-blue-400" />
                          <div>
                            <h3 className="font-semibold">TradingView Strategy</h3>
                            <p className="text-sm text-gray-400">Automate trading rules with Pine Script</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bot Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Exchange Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
                    <select
                      value={formData.api_key_id}
                      onChange={(e) => {
                        const apiKey = apiKeys.find(k => k.id === e.target.value);
                        setFormData({
                          ...formData,
                          api_key_id: e.target.value,
                          exchange_id: apiKey?.exchange_id || '',
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select Exchange</option>
                      {apiKeys.map((apiKey) => (
                        <option key={apiKey.id} value={apiKey.id}>
                          ⭐ {apiKey.exchange?.display_name} | {apiKey.exchange?.name} {apiKey.exchange?.supports_futures ? 'USDT-M' : 'Spot'} - ${apiKey.exchange?.supports_futures ? '0' : '0'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="mt-2 text-teal-400 text-sm hover:text-teal-300 flex items-center space-x-1"
                    >
                      <span>+ Connect another exchange</span>
                    </button>
                  </div>

                  {/* Trading Pairs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pairs</label>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <select
                        value={formData.trading_pair}
                        onChange={(e) => setFormData({ ...formData, trading_pair: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="ETHUSDT/USDT">ETHUSDT/USDT</option>
                        <option value="BTCUSDT/USDT">BTCUSDT/USDT</option>
                        <option value="ADAUSDT/USDT">ADAUSDT/USDT</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-teal-400 text-sm hover:text-teal-300"
                    >
                      Unselect all (1)
                    </button>
                  </div>

                  {/* Leverage Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Leverage type</label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leverage_type: 'cross' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.leverage_type === 'cross'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Cross
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leverage_type: 'isolated' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.leverage_type === 'isolated'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Isolated
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Leverage custom value</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leverage_value: Math.max(1, formData.leverage_value - 1) })}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={formData.leverage_value}
                          onChange={(e) => setFormData({ ...formData, leverage_value: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center"
                          min="1"
                          max="125"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, leverage_value: Math.min(125, formData.leverage_value + 1) })}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Max Margin Usage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max. margin usage <span className="text-teal-400">0 USDT</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={formData.max_margin_usage}
                        onChange={(e) => setFormData({ ...formData, max_margin_usage: parseInt(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                      <select
                        value={formData.margin_per_bot}
                        onChange={(e) => setFormData({ ...formData, margin_per_bot: e.target.value })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="percentage">% USDT per Bot</option>
                        <option value="fixed">Fixed USDT</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Set Signal Alerts Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => toggleSection('signalAlerts')}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <h2 className="text-lg font-semibold">Set signal alerts</h2>
                {expandedSections.signalAlerts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSections.signalAlerts && (
                <div className="p-6 pt-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Webhook URL for TradingView or other sources
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={formData.webhook_url}
                        onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={copyWebhookUrl}
                        className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center space-x-2"
                      >
                        <span>Go to TradingView</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Copy and paste the Webhook URL into your Alert notifications tab on TradingView or other sources
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Long Orders Settings */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => toggleSection('longOrders')}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold">Long orders settings</h2>
                  <ToggleSwitch
                    enabled={formData.long_entry_enabled}
                    onChange={(enabled) => setFormData({ ...formData, long_entry_enabled: enabled })}
                  />
                </div>
                {expandedSections.longOrders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSections.longOrders && formData.long_entry_enabled && (
                <div className="p-6 pt-0 space-y-6">
                  {/* Volume and Order Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Volume per order</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={formData.long_volume_per_order}
                          onChange={(e) => setFormData({ ...formData, long_volume_per_order: parseInt(e.target.value) || 0 })}
                          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                        />
                        <select
                          value="percentage"
                          className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                          <option value="percentage">Total investment, %</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Order type</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, long_order_type: 'market' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.long_order_type === 'market'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Market
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, long_order_type: 'limit' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.long_order_type === 'limit'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Limit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Webhook Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Webhook message for entry order signals
                    </label>
                    <textarea
                      value={formData.long_webhook_message}
                      onChange={(e) => setFormData({ ...formData, long_webhook_message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg h-20 font-mono text-sm"
                      placeholder='{"secret": "your_webhook_secret"}'
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        className="text-teal-400 text-sm hover:text-teal-300"
                      >
                        What JSON parameters are configurable? ℹ️
                      </button>
                      <button
                        type="button"
                        className="text-teal-400 text-sm hover:text-teal-300"
                      >
                        Copy and paste the JSON code to alert settings
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <h3 className="font-semibold mb-4">Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Price deviation from the same order in past</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="number"
                              value={formData.long_price_deviation_same_order_value}
                              onChange={(e) => setFormData({ ...formData, long_price_deviation_same_order_value: parseFloat(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                              disabled={!formData.long_price_deviation_same_order}
                            />
                            <span className="text-sm text-gray-400">%</span>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={formData.long_price_deviation_same_order}
                          onChange={(enabled) => setFormData({ ...formData, long_price_deviation_same_order: enabled })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Price deviation from average entry price</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="number"
                              value={formData.long_price_deviation_average_entry_value}
                              onChange={(e) => setFormData({ ...formData, long_price_deviation_average_entry_value: parseFloat(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                              disabled={!formData.long_price_deviation_average_entry}
                            />
                            <span className="text-sm text-gray-400">%</span>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={formData.long_price_deviation_average_entry}
                          onChange={(enabled) => setFormData({ ...formData, long_price_deviation_average_entry: enabled })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Reset price deviation for a new SmartTrade</span>
                          <p className="text-sm text-gray-400">Signal will be received only if this condition is met</p>
                        </div>
                        <ToggleSwitch
                          enabled={formData.long_reset_price_deviation}
                          onChange={(enabled) => setFormData({ ...formData, long_reset_price_deviation: enabled })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Max. number of entry orders per SmartTrade</span>
                          <input
                            type="number"
                            value={formData.long_max_entry_orders}
                            onChange={(e) => setFormData({ ...formData, long_max_entry_orders: parseInt(e.target.value) || 1 })}
                            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm mt-1"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exit/Take Profit/Stop Loss Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Exit order</span>
                      <ToggleSwitch
                        enabled={formData.long_exit_order_enabled}
                        onChange={(enabled) => setFormData({ ...formData, long_exit_order_enabled: enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Take profit</span>
                      <ToggleSwitch
                        enabled={formData.long_take_profit_enabled}
                        onChange={(enabled) => setFormData({ ...formData, long_take_profit_enabled: enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Stop Loss</span>
                      <ToggleSwitch
                        enabled={formData.long_stop_loss_enabled}
                        onChange={(enabled) => setFormData({ ...formData, long_stop_loss_enabled: enabled })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Short Orders Settings */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => toggleSection('shortOrders')}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold">Short orders settings</h2>
                  <ToggleSwitch
                    enabled={formData.short_entry_enabled}
                    onChange={(enabled) => setFormData({ ...formData, short_entry_enabled: enabled })}
                  />
                </div>
                {expandedSections.shortOrders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSections.shortOrders && formData.short_entry_enabled && (
                <div className="p-6 pt-0 space-y-6">
                  {/* Similar structure as Long Orders but for Short */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Volume per order</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={formData.short_volume_per_order}
                          onChange={(e) => setFormData({ ...formData, short_volume_per_order: parseInt(e.target.value) || 0 })}
                          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                        />
                        <select
                          value="percentage"
                          className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                          <option value="percentage">Total investment, %</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Order type</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, short_order_type: 'market' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.short_order_type === 'market'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Market
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, short_order_type: 'limit' })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            formData.short_order_type === 'limit'
                              ? 'border-teal-500 bg-teal-500 bg-opacity-20 text-teal-400'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          Limit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Exit/Take Profit/Stop Loss Toggles for Short */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Exit order</span>
                      <ToggleSwitch
                        enabled={formData.short_exit_order_enabled}
                        onChange={(enabled) => setFormData({ ...formData, short_exit_order_enabled: enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Take profit</span>
                      <ToggleSwitch
                        enabled={formData.short_take_profit_enabled}
                        onChange={(enabled) => setFormData({ ...formData, short_take_profit_enabled: enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium">Stop Loss</span>
                      <ToggleSwitch
                        enabled={formData.short_stop_loss_enabled}
                        onChange={(enabled) => setFormData({ ...formData, short_stop_loss_enabled: enabled })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => toggleSection('advanced')}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <h2 className="text-lg font-semibold">Advanced</h2>
                {expandedSections.advanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSections.advanced && (
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Reverse position</span>
                    <ToggleSwitch
                      enabled={formData.reverse_position}
                      onChange={(enabled) => setFormData({ ...formData, reverse_position: enabled })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span>Start</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="w-80 p-6 bg-gray-800 border-l border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Max. total investment</span>
              <span className="font-semibold">0 USDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entry long order</span>
              <span className="font-semibold">0 USDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entry short order</span>
              <span className="font-semibold">0 USDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Deal start condition</span>
              <span className="font-semibold">Custom signal</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
              <p className="text-yellow-200 text-sm">
                Bot will use more funds than you have in your total balance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};