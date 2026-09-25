import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CompanyUsage = {
  max_listings: number;
  max_advisors: number;
  used_listings: number;
  used_advisors: number;
  company_status: string;
};

export type Membership = {
  company_id: string;
  role: 'owner' | 'advisor';
  is_active: boolean;
  company_name: string;
};

export const useCompanyMembership = () => {
  const { user, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [usage, setUsage] = useState<CompanyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setMembership(null);
      setUsage(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('company_members' as any)
      .select('company_id, role, is_active, companies(company_name)')
      .eq('user_id', user.id)
      .maybeSingle();
    const row = data as any;
    if (row) {
      setMembership({
        company_id: row.company_id,
        role: row.role,
        is_active: row.is_active,
        company_name: row.companies?.company_name || '',
      });
      const { data: u } = await supabase.rpc('get_company_usage' as any, { p_company_id: row.company_id });
      const first = (u as any[])?.[0];
      setUsage(
        first
          ? {
              ...first,
              used_listings: Number(first.used_listings),
              used_advisors: Number(first.used_advisors),
            }
          : null,
      );
    } else {
      setMembership(null);
      setUsage(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return {
    membership,
    usage,
    isCompanyOwner: membership?.role === 'owner' && membership.is_active,
    loading: authLoading || loading,
    refresh,
  };
};
