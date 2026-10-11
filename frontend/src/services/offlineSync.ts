import type { WorkoutSet } from '../types';

const OFFLINE_QUEUE_KEY = 'fittrack_offline_sets_queue';

export interface QueuedSet {
  sessionId: number;
  set: Partial<WorkoutSet>;
  timestamp: number;
}

export const saveSetOffline = (sessionId: number, set: Partial<WorkoutSet>): void => {
  const queue: QueuedSet[] = getOfflineSets();
  queue.push({ sessionId, set, timestamp: Date.now() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineSets = (): QueuedSet[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const clearOfflineSets = (): void => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const syncOfflineSets = async (
  logSetFn: (sessionId: number, set: Partial<WorkoutSet>) => Promise<any>
): Promise<number> => {
  const queue = getOfflineSets();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingQueue: QueuedSet[] = [];

  for (const item of queue) {
    try {
      await logSetFn(item.sessionId, item.set);
      syncedCount++;
    } catch (err) {
      remainingQueue.push(item);
    }
  }

  if (remainingQueue.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  } else {
    clearOfflineSets();
  }

  return syncedCount;
};
