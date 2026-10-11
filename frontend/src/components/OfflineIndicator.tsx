import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineSets, syncOfflineSets } from '../services/offlineSync';
import { workoutService } from '../services/workoutService';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const updateStatus = () => {
    setIsOnline(navigator.onLine);
    setPendingCount(getOfflineSets().length);
  };

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', updateStatus);

    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleOnline = async () => {
    updateStatus();
    await triggerSync();
  };

  const triggerSync = async () => {
    const queue = getOfflineSets();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      const synced = await syncOfflineSets((sessionId, set) => workoutService.logSet(sessionId, set));
      setPendingCount(getOfflineSets().length);
      if (synced > 0) {
        // trigger UI refresh if needed
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${
      !isOnline ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Offline Mode ({pendingCount} saved)</span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Back Online ({pendingCount} to sync)</span>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="p-1 hover:bg-emerald-500/30 rounded-full transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </>
      )}
    </div>
  );
};
