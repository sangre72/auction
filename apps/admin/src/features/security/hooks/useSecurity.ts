'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BannedIP, SuspiciousActivity, SecurityStats, BanIPRequest } from '@auction/shared';
import { securityApi } from '../api';

export function useSecurityStats() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await securityApi.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '통계를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

export function useBannedList() {
  const [bannedList, setBannedList] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await securityApi.getBannedList();
      setBannedList(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '차단 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const unban = useCallback(async (ip: string) => {
    try {
      await securityApi.unbanIP(ip);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  const ban = useCallback(async (data: BanIPRequest) => {
    try {
      await securityApi.banIP(data);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  return { bannedList, loading, error, refresh: fetchList, unban, ban };
}

export function useSuspiciousList() {
  const [suspiciousList, setSuspiciousList] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await securityApi.getSuspiciousList();
      setSuspiciousList(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '의심 활동 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const clear = useCallback(async (ip: string) => {
    try {
      await securityApi.clearSuspicious(ip);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  return { suspiciousList, loading, error, refresh: fetchList, clear };
}

export function useWhitelist() {
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await securityApi.getWhitelist();
      setWhitelist(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '화이트리스트를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const add = useCallback(async (ip: string) => {
    try {
      await securityApi.addToWhitelist(ip);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  const remove = useCallback(async (ip: string) => {
    try {
      await securityApi.removeFromWhitelist(ip);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  return { whitelist, loading, error, refresh: fetchList, add, remove };
}

export function useBlacklist() {
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await securityApi.getBlacklist();
      setBlacklist(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '블랙리스트를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const add = useCallback(async (ip: string, reason?: string) => {
    try {
      await securityApi.addToBlacklist(ip, reason);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  const remove = useCallback(async (ip: string) => {
    try {
      await securityApi.removeFromBlacklist(ip);
      await fetchList();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchList]);

  return { blacklist, loading, error, refresh: fetchList, add, remove };
}
