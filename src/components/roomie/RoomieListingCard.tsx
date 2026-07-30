import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Ruler, Users, Bath, PawPrint, Cigarette } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { formatMoney, includedBills, SOCIAL_LEVELS } from '@/utils/roomie';

export type RoomieListing = Tables<'roomie_listings'>;

export const RoomieListingCard = ({ listing }: { listing: RoomieListing }) => {
  const cover = listing.room_images?.[0] || listing.home_images?.[0];
  const bills = includedBills(listing);

  return (
    <Link to={`/roomie-finder/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full">
        <div className="aspect-[4/3] bg-stone-100">
          {cover ? (
            <img src={cover} alt={`Habitación en ${listing.municipality}`} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sin foto</div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2">{listing.title}</h3>
            <span className="text-primary font-bold whitespace-nowrap">{formatMoney(listing.rent_amount)}</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {listing.address}, {listing.municipality}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="secondary" className="gap-1"><Ruler className="w-3 h-3" />{listing.room_area} m²</Badge>
            <Badge variant="secondary" className="gap-1"><Users className="w-3 h-3" />{listing.flatmates_count} conviv.</Badge>
            {listing.room_private_bath && <Badge variant="secondary" className="gap-1"><Bath className="w-3 h-3" />Baño privado</Badge>}
            {listing.pets_allowed && <Badge variant="secondary" className="gap-1"><PawPrint className="w-3 h-3" />Mascotas</Badge>}
            {listing.smokers && <Badge variant="secondary" className="gap-1"><Cigarette className="w-3 h-3" />Fumadores</Badge>}
            <Badge variant="outline">{SOCIAL_LEVELS[listing.social_level] || listing.social_level}</Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {bills.length > 0 ? `Incluye: ${bills.join(', ')}` : `Gastos aparte · ~${formatMoney(listing.bills_estimate)}/mes`}
          </p>
        </div>
      </Card>
    </Link>
  );
};