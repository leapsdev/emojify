'use client';

import { db } from '@/lib/firebase/client';
import { useCallback } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { useSyncExternalStore } from 'react';

export const useIsFriend = (currentUserId: string, targetUserId: string) => {
  const subscribe = useCallback(
    (callback: (isFriend: boolean) => void) => {
      const ref = dbRef(db, `users/${currentUserId}/friends/${targetUserId}`);
      const unsubscribe = onValue(ref, (snapshot) => {
        callback(snapshot.exists());
      });
      return unsubscribe;
    },
    [currentUserId, targetUserId],
  );

  return useSyncExternalStore(
    subscribe,
    () => false, // Client value
    () => false, // Server value
  );
};
