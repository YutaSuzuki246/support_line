'use client';

import { useEffect, useState } from 'react';
import { initLiff, getProfile } from '@/lib/liffClient';

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export function useLiffProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initLiff();
        const p = await getProfile();
        setProfile(p);
      } catch (error) {
        console.error('LIFFログイン取得エラー:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { profile, loading };
}