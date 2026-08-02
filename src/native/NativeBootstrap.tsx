import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initNative, isNative, NATIVE_HOME_ROUTE } from './capacitor';

/**
 * Runs once inside the router: initialises native plugins, handles deep links
 * and sends the mobile app straight into the Roomie Finder section.
 */
const NativeBootstrap = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNative()) return;
    initNative((path) => navigate(path));
    if (location.pathname === '/') navigate(NATIVE_HOME_ROUTE, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default NativeBootstrap;