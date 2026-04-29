import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ShortRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!code) {
        setError('Código no válido');
        return;
      }
      const { data, error: dbError } = await supabase
        .from('short_links')
        .select('target_url, click_count')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (dbError || !data) {
        setError('Enlace no encontrado');
        return;
      }

      // Increment click counter (fire-and-forget)
      supabase
        .from('short_links')
        .update({ click_count: (data.click_count || 0) + 1 })
        .eq('code', code.toUpperCase())
        .then(() => {});

      window.location.replace(data.target_url);
    };
    resolve();
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-stone-800 mb-2">{error}</h1>
            <a href="/" className="text-stone-600 underline">Volver al inicio</a>
          </>
        ) : (
          <p className="text-stone-600">Redirigiendo…</p>
        )}
      </div>
    </div>
  );
};

export default ShortRedirect;
