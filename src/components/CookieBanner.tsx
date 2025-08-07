import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const cookieConsent = Cookies.get('cookie_consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    console.log('BANNER: Setting cookie_consent to accepted');
    
    // Set the cookie with proper configuration
    Cookies.set('cookie_consent', 'accepted', { 
      expires: 365, 
      sameSite: 'strict',
      secure: false // Allow for localhost
    });
    
    // Verify it was set correctly
    const verifyValue = Cookies.get('cookie_consent');
    console.log('BANNER: Cookie verification - value is:', verifyValue);
    
    setShowBanner(false);
    
    // Small delay to ensure cookie is fully set before dispatching event
    setTimeout(() => {
      console.log('BANNER: Dispatching cookies-accepted event');
      window.dispatchEvent(new CustomEvent('cookies-accepted'));
    }, 100);
  };

  const rejectCookies = () => {
    Cookies.set('cookie_consent', 'rejected', { expires: 365, sameSite: 'strict' });
    // Clear any existing cookies except essential ones
    Cookies.remove('user_id');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                {t('cookies.title') || 'Uso de Cookies'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('cookies.description') || 'Utilizamos cookies para mejorar tu experiencia, personalizar contenido y recordar tus preferencias como los favoritos. Al continuar navegando, aceptas nuestro uso de cookies.'}{' '}
                <Link to="/privacy-policy" className="underline hover:no-underline text-primary">
                  {t('cookies.privacy_policy') || 'Política de Privacidad'}
                </Link>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={rejectCookies}
                className="whitespace-nowrap"
              >
                {t('cookies.reject') || 'Rechazar'}
              </Button>
              <Button
                onClick={acceptCookies}
                className="whitespace-nowrap"
              >
                {t('cookies.accept') || 'Aceptar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieBanner;