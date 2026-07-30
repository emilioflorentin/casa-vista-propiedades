import { supabase } from '@/integrations/supabase/client';

export const ROOMIE_BUCKET = 'property-images';
export const ROOMIE_PREFIX = 'roomie';

/** Compresses an image client-side to max 1920px / JPEG 82% (project standard). */
export const compressRoomieImage = (file: File, maxWidth = 1920, quality = 0.82): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, maxWidth / img.width, maxWidth / img.height);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });

export const uploadRoomieImages = async (
  files: File[],
  userId: string,
  folder: string
): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const blob = await compressRoomieImage(file);
    const path = `${ROOMIE_PREFIX}/${userId}/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;
    const { error } = await supabase.storage
      .from(ROOMIE_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(ROOMIE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
};

export const formatMoney = (value?: number | null) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

export const openRoomieWhatsApp = (phone: string, message: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return false;
  const full = digits.startsWith('34') ? digits : `34${digits}`;
  window.open(`https://api.whatsapp.com/send?phone=${full}&text=${encodeURIComponent(message)}`, '_blank');
  return true;
};

export const SOCIAL_LEVELS: Record<string, string> = {
  social: 'Muy sociable',
  balanced: 'Equilibrado',
  quiet: 'Tranquilo y reservado',
};

export const SCHEDULES: Record<string, string> = {
  morning: 'Mañanas',
  afternoon: 'Tardes',
  night: 'Noches',
  shifts: 'Turnos',
  mixed: 'Variado',
};

export const OCCUPATIONS: Record<string, string> = {
  works: 'Trabaja',
  studies: 'Estudia',
  both: 'Trabaja y estudia',
  any: 'Indiferente',
};

export const CLEANLINESS: Record<string, string> = {
  relaxed: 'Relajada',
  normal: 'Normal',
  strict: 'Muy ordenada',
};

export const GUESTS_POLICY: Record<string, string> = {
  yes: 'Se admiten visitas',
  occasionally: 'Visitas puntuales',
  no: 'Sin visitas',
};

export const GENDER_MIX: Record<string, string> = {
  mixed: 'Mixto',
  female: 'Solo chicas',
  male: 'Solo chicos',
};

export const GENDERS: Record<string, string> = {
  female: 'Mujer',
  male: 'Hombre',
  other: 'Otro',
  any: 'Indiferente',
};

export const PROPERTY_TYPES: Record<string, string> = {
  apartment: 'Piso',
  house: 'Casa',
  loft: 'Loft',
  studio: 'Estudio',
};

export const includedBills = (l: {
  includes_water: boolean;
  includes_electricity: boolean;
  includes_gas: boolean;
  includes_internet: boolean;
  includes_community: boolean;
}) =>
  [
    l.includes_water && 'Agua',
    l.includes_electricity && 'Luz',
    l.includes_gas && 'Gas',
    l.includes_internet && 'Internet',
    l.includes_community && 'Comunidad',
  ].filter(Boolean) as string[];