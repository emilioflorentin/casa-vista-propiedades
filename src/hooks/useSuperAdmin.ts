import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSuperAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setIsSuperAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    supabase
      .rpc('has_role', { _user_id: user.id, _role: 'superadmin' })
      .then(({ data, error }) => {
        if (!active) return;
        setIsSuperAdmin(!error && data === true);
        setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isSuperAdmin, loading: authLoading || checking, user };
};
