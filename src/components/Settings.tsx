import { X, Key, Zap, Save, Bell, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  autoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
  notifications: boolean;
  onNotificationsChange: (value: boolean) => void;
  onClose: () => void;
}

export function Settings({
  apiKey,
  onApiKeyChange,
  selectedModel,
  onModelChange,
  autoSave,
  onAutoSaveChange,
  notifications,
  onNotificationsChange,
  onClose,
}: SettingsProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    onApiKeyChange(localApiKey);
    toast.success('Settings saved successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass max-w-2xl w-full rounded-2xl shadow-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(244,221,213,0.15)]">
          <div>
            <h2 className="text-xl font-semibold text-[#EAE9E5]">Settings</h2>
            <p className="text-sm text-[rgba(234,233,229,0.6)] mt-1">
              Configure your Legal OS preferences
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#C48F7F]" />
              <label className="font-medium text-[#EAE9E5]">Gemini API Key</label>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="input pr-12"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(234,233,229,0.6)] hover:text-[#EAE9E5]"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-[rgba(234,233,229,0.5)]">
              Get your free API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C48F7F] hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#C48F7F]" />
              <label className="font-medium text-[#EAE9E5]">AI Model</label>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="input"
            >
              <option value="gemini">Gemini Pro (Recommended)</option>
              <option value="gemini-flash">Gemini Flash (Faster)</option>
            </select>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Save className="w-5 h-5 text-[#C48F7F]" />
                <div>
                  <div className="font-medium text-[#EAE9E5]">Auto-Save</div>
                  <div className="text-xs text-[rgba(234,233,229,0.5)]">
                    Automatically save changes
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => onAutoSaveChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[rgba(234,233,229,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C48F7F]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#C48F7F]" />
                <div>
                  <div className="font-medium text-[#EAE9E5]">Notifications</div>
                  <div className="text-xs text-[rgba(234,233,229,0.5)]">
                    Enable system notifications
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => onNotificationsChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[rgba(234,233,229,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C48F7F]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgba(244,221,213,0.15)]">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}