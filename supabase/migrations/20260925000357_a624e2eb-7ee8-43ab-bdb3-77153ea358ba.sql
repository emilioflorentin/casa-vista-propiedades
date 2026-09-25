REVOKE EXECUTE ON FUNCTION public.is_company_owner(uuid,uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.owner_manages_user(uuid,uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_company_usage(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_company_owner(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owner_manages_user(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_usage(uuid) TO authenticated;