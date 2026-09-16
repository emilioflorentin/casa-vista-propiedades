import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, Info } from 'lucide-react';
import { formatMoney, includedBills, SOCIAL_LEVELS, CLEANLINESS, SCHEDULES } from '@/utils/roomie';
import type { RoomieListing } from './RoomieListingCard';
import { trackListingEvent } from '@/utils/analyticsEvents';

interface Props {
  listings: RoomieListing[];
  onLike: (listing: RoomieListing) => void;
  onSkip: (listing: RoomieListing) => void;
}

export const RoomieSwipeDeck = ({ listings, onLike, onSkip }: Props) => {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const current = listings[0];
  const next = listings[1];

  useEffect(() => {
    if (current) trackListingEvent('roomie_listing', current.id, 'impression', current.user_id);
  }, [current?.id]);

  if (!current) return null;

  const finish = (dir: 'like' | 'skip') => {
    setDx(dir === 'like' ? 600 : -600);
    const l = current;
    window.setTimeout(() => {
      setDx(0);
      dir === 'like' ? onLike(l) : onSkip(l);
    }, 180);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dx > 110) finish('like');
    else if (dx < -110) finish('skip');
    else setDx(0);
  };

  const cover = current.room_images?.[0] || current.home_images?.[0];
  const bills = includedBills(current);

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      <div className="relative h-[560px]">
        {next && (
          <div className="absolute inset-0 rounded-2xl bg-muted scale-95 translate-y-3 shadow-md overflow-hidden">
            {(next.room_images?.[0] || next.home_images?.[0]) && (
              <img src={next.room_images?.[0] || next.home_images?.[0]} alt="" className="w-full h-full object-cover opacity-60" />
            )}
          </div>
        )}

        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl cursor-grab active:cursor-grabbing touch-none"
          style={{
            transform: `translateX(${dx}px) rotate(${dx / 25}deg)`,
            transition: dragging ? 'none' : 'transform 180ms ease-out',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="relative h-[62%] bg-muted">
            {cover ? (
              <img src={cover} alt={`Habitación en ${current.municipality}`} className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin foto</div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-2xl font-bold">{formatMoney(current.rent_amount)}<span className="text-sm font-normal">/mes</span></p>
              <p className="text-white/90 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{current.address}, {current.municipality}</p>
            </div>
            {dx > 40 && (
              <span className="absolute top-6 left-6 border-4 border-green-500 text-green-500 font-extrabold text-2xl px-3 py-1 rounded-lg -rotate-12">ME GUSTA</span>
            )}
            {dx < -40 && (
              <span className="absolute top-6 right-6 border-4 border-red-500 text-red-500 font-extrabold text-2xl px-3 py-1 rounded-lg rotate-12">PASO</span>
            )}
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{current.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{current.room_area} m² habitación</Badge>
              <Badge variant="secondary">{current.flatmates_count} convivientes</Badge>
              <Badge variant="outline">{SOCIAL_LEVELS[current.social_level]}</Badge>
              <Badge variant="outline">{CLEANLINESS[current.cleanliness]}</Badge>
              <Badge variant="outline">{SCHEDULES[current.flatmates_schedule]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {bills.length > 0 ? `Gastos incluidos: ${bills.join(', ')}` : `Gastos aparte · ~${formatMoney(current.bills_estimate)}/mes`}
              {' · '}Fianza {formatMoney(current.deposit_amount)}
            </p>
            <Link to={`/roomie-finder/${current.id}`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
              <Info className="w-3 h-3" /> Ver ficha completa
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6">
        <Button size="lg" variant="outline" className="rounded-full h-16 w-16 border-red-200 hover:bg-red-50" onClick={() => finish('skip')} aria-label="Descartar">
          <X className="w-7 h-7 text-red-500" />
        </Button>
        <Button size="lg" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700" onClick={() => finish('like')} aria-label="Me gusta">
          <Heart className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};