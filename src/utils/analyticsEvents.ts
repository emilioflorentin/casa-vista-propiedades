import { supabase } from '@/integrations/supabase/client';
import { getUserId } from '@/utils/userIdentification';

export type EntityType = 'property' | 'roomie_listing';
export type ListingEventType = 'view' | 'impression' | 'favorite_add' | 'favorite_remove';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEDUP_MS = 30 * 60 * 1000;

const isDuplicate = (key: string) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw && Date.now() - Number(raw) < DEDUP_MS) return true;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    /* sessionStorage unavailable */
  }
  return false;
};

/** Fire-and-forget analytics event for listings. Never throws, never blocks the UI. */
export const trackListingEvent = (
  entityType: EntityType,
  entityId?: string | number | null,
  eventType: ListingEventType = 'view',
  ownerId?: string | null,
  options?: { dedupe?: boolean }
) => {
  const id = String(entityId ?? '');
  if (!UUID_RE.test(id)) return;

  if (options?.dedupe !== false && isDuplicate(`le:${eventType}:${id}`)) return;

  let visitorHash: string | null = null;
  try {
    visitorHash = getUserId();
  } catch {
    visitorHash = null;
  }

  void supabase
    .from('listing_events')
    .insert({
      entity_type: entityType,
      entity_id: id,
      owner_id: ownerId ?? null,
      event_type: eventType,
      visitor_hash: visitorHash,
    })
    .then(({ error }) => {
      if (error) console.warn('analytics event failed', error.message);
    });
};

export interface ListingStatsRow {
  entity_id: string;
  views: number;
  unique_visitors: number;
  impressions: number;
  favorites: number;
  views_7d: number;
  views_30d: number;
}

export const fetchListingStats = async (entityType: EntityType): Promise<Record<string, ListingStatsRow>> => {
  const { data, error } = await supabase.rpc('get_listing_stats', { p_entity_type: entityType });
  if (error) {
    console.error('get_listing_stats', error.message);
    return {};
  }
  const map: Record<string, ListingStatsRow> = {};
  ((data as ListingStatsRow[]) || []).forEach((r) => {
    map[r.entity_id] = r;
  });
  return map;
};

export const fetchDailyViews = async (entityType: EntityType, entityId: string, days = 30) => {
  const { data, error } = await supabase.rpc('get_listing_daily_views', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_days: days,
  });
  if (error) {
    console.error('get_listing_daily_views', error.message);
    return [];
  }
  return (data as { day: string; views: number }[]) || [];
};
