/**
 * SavedScreen
 * Skyscanner "Saved" screen — React + Tailwind + Backpack design tokens
 * Figma: https://www.figma.com/design/bp5Gt6ptsAs3iOY0mSeWE4/S2L---PA-Consolidation?node-id=1815-37347
 *
 * Prerequisites:
 *   - Tailwind CSS
 *   - Skyscanner Relative font loaded (Bold + Book weights)
 *   - Backpack CSS custom properties in scope (or replace token values below)
 *
 * Note: Figma image assets expire after 7 days — replace with production URLs.
 */

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// ---------------------------------------------------------------------------
// Figma image assets  (valid ~7 days from generation)
// ---------------------------------------------------------------------------
const ASSETS = {
  airline:     'https://www.figma.com/api/mcp/asset/ef7eb560-88a7-47ba-9dba-689b35de0cc1',
  hotelOldShip:'https://www.figma.com/api/mcp/asset/233f34de-24e7-4d1e-a709-f09e5e0671b0',
  hotelMercure:'https://www.figma.com/api/mcp/asset/90dce75d-70c4-4ba5-bb6f-3bb35fe23e26',
  hotelGrand:  'https://www.figma.com/api/mcp/asset/4eed6af4-889e-4ee2-84b8-97c28b7fa1d5',
  carYaris:    'https://www.figma.com/api/mcp/asset/939ccc56-142e-4c83-aab4-ca87bfc64233',
  heartFilled: 'https://www.figma.com/api/mcp/asset/ddc6b833-f597-4693-869c-451f42be27c7',
  heartOutline:'https://www.figma.com/api/mcp/asset/14dc0a7c-912f-4225-b8c8-0c2e7e349e3a',
  shareIcon:   'https://www.figma.com/api/mcp/asset/89e1b8c3-0eda-4116-9dc2-b88a0cbb635b',
  priceUpIcon: 'https://www.figma.com/api/mcp/asset/c0bbfc9e-0780-4415-8d53-f96c3e57496a',
  taLogo:      'https://www.figma.com/api/mcp/asset/2350da2f-25ac-44a4-8e4b-1f7cf31eabe8',
  ratingFull:  'https://www.figma.com/api/mcp/asset/44fa0754-a1c5-4b03-9e2e-493cb620fbfb',
  ratingHalf:  'https://www.figma.com/api/mcp/asset/e7b05250-f723-4476-9a46-958a263417e0',
  ratingEmpty: 'https://www.figma.com/api/mcp/asset/c82afca4-9f64-4427-a617-bf78aa272da5',
  wifi:        'https://www.figma.com/api/mcp/asset/e9cab598-7592-44ca-86b8-b5b6032fb781',
  cellular:    'https://www.figma.com/api/mcp/asset/41a956ff-9c14-4ffb-a5df-68d0d4246c0f',
} as const;

// ---------------------------------------------------------------------------
// Backpack design token values
// When Backpack CSS is available in your app, swap these for var(--token-name)
// using valid CSS custom property names defined by your Backpack setup.
// ---------------------------------------------------------------------------
const bpk = {
  textPrimary:   '#161616',
  textSecondary: '#626971',
  textSecAlt:    '#545860',
  surface:       '#ffffff',
  canvas:        '#eff3f8',
  accent:        '#0062e3',
  badgeFill:     '#eff3f8',
  line:          '#c1c7cf',
  cardBtnFill:   'rgba(255,255,255,0.8)',
  shadow:        '0px 1px 3px 0px rgba(22,22,22,0.25)',
  fontBold:      "'Skyscanner_Relative:Bold', sans-serif",
  fontBook:      "'Skyscanner_Relative:Book', sans-serif",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FlightLeg {
  depart: string;
  arrive: string;
  origin: string;
  dest: string;
  airline: string;
  direct: boolean;
  duration: string;
}

interface FlightItem {
  type: 'flight';
  id: string;
  title: string;
  subtitle: string;
  outbound: FlightLeg;
  inbound: FlightLeg;
  badge?: string;
  price: string;
  totalPrice: string;
}

interface HotelItem {
  type: 'hotel';
  id: string;
  name: string;
  location: string;
  taScore: number;
  reviewCount: string;
  stars: number;
  image: string;
  dateRange: string;
  occupancy: string;
  price: string;
  totalPrice: string;
  prevPrice?: string;
  priceLabel?: string;
}

interface CarItem {
  type: 'car';
  id: string;
  name: string;
  category: string;
  location: string;
  badges: string[];
  dateRange: string;
  cancellation: string;
  price: string;
  totalPrice: string;
  priceLabel?: string;
}

type SavedItem = FlightItem | HotelItem | CarItem;

interface TripGroup {
  id: string;
  heading: string;
  items: SavedItem[];
}

interface SearchItem {
  type: 'search';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeType?: 'increase' | 'drop';
  price: string;
  totalPrice: string;
}

interface SearchGroup {
  id: string;
  heading: string;
  items: SearchItem[];
}

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

/** TripAdvisor bubble rating */
function TaBubbles({ score }: { score: number }) {
  return (
    <div className="flex gap-[2px] items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <img
          key={n}
          alt=""
          className="block size-3"
          src={
            n <= score
              ? ASSETS.ratingFull
              : n - 0.5 <= score
              ? ASSETS.ratingHalf
              : ASSETS.ratingEmpty
          }
        />
      ))}
    </div>
  );
}

/** Hotel star rating (★ glyphs) */
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-[2px]" aria-label={`${stars} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="text-xs leading-none"
          style={{ color: n <= stars ? '#f5a623' : '#d0d0d0' }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

/** Pill badge (Backpack BpkBadge "Light" style) */
function Badge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 text-xs whitespace-nowrap"
      style={{
        backgroundColor: bpk.badgeFill,
        borderRadius: 4,
        color: bpk.textPrimary,
        fontFamily: bpk.fontBook,
        lineHeight: '1.333',
      }}
    >
      {label}
    </span>
  );
}

/** Page-indicator dots overlaid on hotel images */
function PageDots({ total = 5, active = 0 }: { total?: number; active?: number }) {
  return (
    <div className="flex gap-2 items-center justify-center p-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="block size-2 rounded-full"
          style={{ backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.5)' }}
        />
      ))}
    </div>
  );
}

/** Backpack BpkPrice — aligned end */
function Price({
  label,
  price,
  trailing,
}: {
  label?: string;
  price: string;
  trailing?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0 shrink-0">
      {label && (
        <span className="text-xs text-right whitespace-nowrap" style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, lineHeight: '1.333' }}>
          {label}
        </span>
      )}
      <span className="text-xl font-bold text-right whitespace-nowrap" style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, lineHeight: '1.2' }}>
        {price}
      </span>
      {trailing && (
        <span className="text-xs text-right whitespace-nowrap" style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, lineHeight: '1.333' }}>
          {trailing}
        </span>
      )}
    </div>
  );
}

/** iOS-style toggle (Backpack BpkSwitch) */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-6 w-[52px] rounded-2xl shrink-0 transition-colors duration-200"
      style={{ backgroundColor: on ? bpk.accent : '#ccc' }}
    >
      <span
        className="absolute top-[2px] h-5 w-[30px] rounded-2xl bg-white transition-all duration-200"
        style={{ left: on ? 20 : 2 }}
      />
    </button>
  );
}

/**
 * Card action buttons: share + save/unsave
 * contained=true  → white fill (hotel image overlay)
 * contained=false → backdrop-blur (flight card / car card)
 */
function CardActions({
  saved,
  onSave,
  contained = false,
}: {
  saved: boolean;
  onSave: () => void;
  contained?: boolean;
}) {
  const base = `flex items-center justify-center rounded-full size-10 ${
    contained ? '' : 'backdrop-blur-[6px]'
  }`;
  return (
    <div className="flex gap-1 items-center">
      <button
        aria-label="Share"
        className={base}
        style={contained ? { backgroundColor: bpk.cardBtnFill } : undefined}
      >
        <img alt="" className="block size-5" src={ASSETS.shareIcon} />
      </button>
      <button
        aria-label={saved ? 'Unsave' : 'Save'}
        onClick={onSave}
        className={base}
        style={contained ? { backgroundColor: bpk.cardBtnFill } : undefined}
      >
        <img alt="" className="block size-5" src={saved ? ASSETS.heartFilled : ASSETS.heartOutline} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card: Flight
// ---------------------------------------------------------------------------
function FlightCard({
  item,
  saved,
  priceAlert,
  onSave,
  onPriceAlert,
}: {
  item: FlightItem;
  saved: boolean;
  priceAlert: boolean;
  onSave: () => void;
  onPriceAlert: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start overflow-hidden w-[343px] shrink-0"
      style={{ backgroundColor: bpk.surface, borderRadius: 12, boxShadow: bpk.shadow }}
    >
      {/* Info section */}
      <div className="relative flex flex-col gap-4 p-4 w-full">
        {/* Title */}
        <div className="flex items-start pr-[72px] w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: 1.2 }}>
              {item.title}
            </p>
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: 1.428 }}>
              {item.subtitle}
            </p>
          </div>
        </div>

        {/* Flight legs */}
        <div className="flex flex-col gap-2 w-full">
          {[item.outbound, item.inbound].map((leg, i) => (
            <div key={i} className="flex items-start gap-4 w-full overflow-hidden">
              {/* Airline logo */}
              <div className="flex items-start shrink-0 pt-[5px]">
                <div className="overflow-hidden size-6 rounded" style={{ backgroundColor: bpk.surface }}>
                  <img alt={leg.airline} className="block size-full object-cover" src={ASSETS.airline} />
                </div>
              </div>
              {/* Times + route */}
              <div className="flex flex-col flex-1 min-w-0">
                <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 16, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                  {leg.depart} – {leg.arrive}
                </span>
                <span style={{ color: bpk.textSecAlt, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}>
                  {leg.origin} – {leg.dest}, {leg.airline}
                </span>
              </div>
              {/* Direct / duration */}
              <div className="flex flex-col items-end gap-1 shrink-0 pt-px h-9 text-right whitespace-nowrap" style={{ fontSize: 12 }}>
                <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, lineHeight: '16px' }}>
                  {leg.direct ? 'Direct' : '1 stop'}
                </span>
                <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, lineHeight: '16px' }}>
                  {leg.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Deal row */}
        <div className="flex items-end justify-between w-full">
          {item.badge && (
            <div
              className="flex items-center gap-1 px-2 py-1 shrink-0"
              style={{ backgroundColor: bpk.badgeFill, borderRadius: 4 }}
            >
              <img alt="" className="block shrink-0" style={{ width: '1rem', height: '0.8rem' }} src={ASSETS.priceUpIcon} />
              <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: 1.428 }}>
                <strong style={{ fontFamily: bpk.fontBold }}>{item.badge.split(' on ')[0]}</strong>
                {item.badge.includes(' on ') && ` on ${item.badge.split(' on ')[1]}`}
              </p>
            </div>
          )}
          <div className="flex flex-col items-end ml-auto gap-0">
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333', textAlign: 'right' }}>
              From
            </span>
            <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: '1.2', textAlign: 'right' }}>
              {item.price}
            </span>
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333', textAlign: 'right' }}>
              {item.totalPrice}
            </span>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-[6px] right-[6px]">
          <CardActions saved={saved} onSave={onSave} contained={false} />
        </div>
      </div>

      {/* Price Alerts section */}
      <div
        className="flex flex-col items-start p-4 w-full shrink-0"
        style={{ borderTop: `1px solid ${bpk.line}` }}
      >
        <div className="flex items-center justify-between w-full">
          <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 16, lineHeight: '1.5' }}>
            Price Alerts
          </span>
          <Toggle on={priceAlert} onToggle={onPriceAlert} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card: Flight Search (Searches tab)
// ---------------------------------------------------------------------------
function SearchCard({
  item,
  saved,
  priceAlert,
  onSave,
  onPriceAlert,
}: {
  item: SearchItem;
  saved: boolean;
  priceAlert: boolean;
  onSave: () => void;
  onPriceAlert: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start overflow-hidden w-[343px] shrink-0"
      style={{ backgroundColor: bpk.surface, borderRadius: 12, boxShadow: bpk.shadow }}
    >
      <div className="relative flex flex-col gap-4 p-4 w-full">
        {/* Title */}
        <div className="flex items-start pr-[72px] w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: 1.2 }}>
              {item.title}
            </p>
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: 1.428 }}>
              {item.subtitle}
            </p>
          </div>
        </div>

        {/* Deal row */}
        <div className="flex items-end justify-between w-full">
          {item.badge && (
            <div
              className="flex items-center gap-1 px-2 py-1 shrink-0"
              style={{ backgroundColor: bpk.badgeFill, borderRadius: 4 }}
            >
              <img alt="" className="block shrink-0" style={{ width: '1rem', height: '0.8rem', ...(item.badgeType === 'drop' ? { transform: 'scaleY(-1)' } : {}) }} src={ASSETS.priceUpIcon} />
              <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: 1.428 }}>
                <strong style={{ fontFamily: bpk.fontBold }}>{item.badge.split(' on ')[0]}</strong>
                {item.badge.includes(' on ') && ` on ${item.badge.split(' on ')[1]}`}
              </p>
            </div>
          )}
          <div className="flex flex-col items-end ml-auto gap-0">
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333', textAlign: 'right' }}>
              From
            </span>
            <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: '1.2', textAlign: 'right' }}>
              {item.price}
            </span>
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333', textAlign: 'right' }}>
              {item.totalPrice}
            </span>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-[6px] right-[6px]">
          <CardActions saved={saved} onSave={onSave} contained={false} />
        </div>
      </div>

      {/* Price Alerts section */}
      <div
        className="flex flex-col items-start p-4 w-full shrink-0"
        style={{ borderTop: `1px solid ${bpk.line}` }}
      >
        <div className="flex items-center justify-between w-full">
          <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 16, lineHeight: '1.5' }}>
            Price Alerts
          </span>
          <Toggle on={priceAlert} onToggle={onPriceAlert} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card: Hotel
// ---------------------------------------------------------------------------
function HotelCard({
  item,
  saved,
  onSave,
}: {
  item: HotelItem;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start overflow-hidden w-[343px] shrink-0"
      style={{ backgroundColor: bpk.surface, borderRadius: 12, boxShadow: bpk.shadow }}
    >
      {/* Image */}
      <div className="relative h-[168px] w-full shrink-0">
        <div className="absolute inset-0 overflow-hidden">
          <img alt={item.name} className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={item.image} />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(22,22,22,0)] to-[rgba(22,22,22,0.15)]" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <PageDots />
        </div>
        <div className="absolute top-[6px] right-[6px]">
          <CardActions saved={saved} onSave={onSave} contained />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4 p-4 w-full">
        {/* Hotel info row */}
        <div className="flex items-start gap-2 w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: '1.2' }}>
              {item.name}
            </p>
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: '1.428' }}>
              {item.location}
            </p>
            {/* TripAdvisor rating */}
            <div className="flex items-center gap-2">
              <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 16 }}>
                {item.taScore}
              </span>
              <div className="relative h-4 w-[98px]">
                <img alt="TripAdvisor" className="absolute left-0 top-[2px] h-3 w-5 object-contain" src={ASSETS.taLogo} />
                <div className="absolute left-[26px] top-[2px]">
                  <TaBubbles score={item.taScore} />
                </div>
              </div>
              <span className="text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, lineHeight: '1.333' }}>
                {item.reviewCount}
              </span>
            </div>
          </div>
          <StarRating stars={item.stars} />
        </div>

        {/* Deal info row */}
        <div className="flex items-end justify-between w-full gap-4">
          <div className="flex flex-col flex-1 min-w-0 justify-end">
            <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 14, lineHeight: '1.42' }}>
              {item.dateRange}
            </span>
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333' }}>
              {item.occupancy}
            </span>
          </div>
          <Price label={item.priceLabel} price={item.price} trailing={item.totalPrice} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card: Car
// ---------------------------------------------------------------------------
function CarCard({
  item,
  saved,
  onSave,
}: {
  item: CarItem;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start overflow-hidden w-[343px] shrink-0"
      style={{ backgroundColor: bpk.surface, borderRadius: 12, boxShadow: bpk.shadow }}
    >
      {/* Car image area (no overlay) */}
      <div className="relative h-[168px] w-full shrink-0">
        <img
          alt={item.name}
          className="absolute object-contain pointer-events-none"
          style={{ inset: 16 }}
          src={ASSETS.carYaris}
        />
        <div className="absolute top-[6px] right-[6px]">
          <CardActions saved={saved} onSave={onSave} contained={false} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4 p-4 w-full">
        <div className="flex flex-col gap-4 w-full">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-1">
              <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 20, lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: '1.428', whiteSpace: 'nowrap' }}>
                {item.category}
              </span>
            </div>
            <p style={{ color: bpk.textPrimary, fontFamily: bpk.fontBook, fontSize: 14, lineHeight: '1.428' }}>
              {item.location}
            </p>
          </div>
          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 items-center w-full">
            {item.badges.map((b) => (
              <Badge key={b} label={b} />
            ))}
          </div>
        </div>

        {/* Deal info */}
        <div className="flex items-end justify-between w-full gap-4">
          <div className="flex flex-col flex-1 min-w-0 justify-end">
            <span style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 14, lineHeight: '1.42' }}>
              {item.dateRange}
            </span>
            <span style={{ color: bpk.textSecondary, fontFamily: bpk.fontBook, fontSize: 12, lineHeight: '1.333' }}>
              {item.cancellation}
            </span>
          </div>
          <Price label={item.priceLabel} price={item.price} trailing={item.totalPrice} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
interface Toast {
  toastId: string;
  itemId: string;
  label: string;
}

function ToastItem({ toast, onUndo }: { toast: Toast; onUndo: (toastId: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 12,
        backgroundColor: '#161616',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ color: '#ffffff', fontFamily: bpk.fontBook, fontSize: 14, lineHeight: '1.5' }}>
        {toast.label} removed
      </span>
      <button
        onClick={() => onUndo(toast.toastId)}
        style={{
          color: '#4f9cf9',
          fontFamily: bpk.fontBold,
          fontSize: 14,
          lineHeight: '1.5',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          paddingLeft: 16,
          paddingRight: 0,
        }}
      >
        Undo
      </button>
    </div>
  );
}

const MAX_TOASTS = 3;

function ToastStack({ toasts, onUndo }: { toasts: Toast[]; onUndo: (toastId: string) => void }) {
  const visible = toasts.slice(-MAX_TOASTS); // newest last
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 343,
        zIndex: 100,
      }}
    >
      <AnimatePresence>
        {visible.map((t, i) => {
          const depth = visible.length - 1 - i; // 0 = front/newest, 1 = behind, 2 = furthest
          return (
            <motion.div
              key={t.toastId}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                transformOrigin: 'bottom center',
                zIndex: MAX_TOASTS - depth,
              }}
              initial={{ y: 16, opacity: 0, scale: 1 }}
              animate={{
                y: -(depth * 8),
                scale: 1 - depth * 0.04,
                opacity: 1 - depth * 0.15,
              }}
              exit={{ y: 16, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ToastItem toast={t} onUndo={onUndo} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter chip  (Backpack BpkSelectableChip)
// ---------------------------------------------------------------------------
function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
      style={{
        backgroundColor: selected ? bpk.accent : bpk.surface,
        color: selected ? '#fff' : bpk.textPrimary,
        fontFamily: selected ? bpk.fontBold : bpk.fontBook,
        fontSize: 14,
        lineHeight: '1.5',
        border: selected ? 'none' : `1px solid ${bpk.line}`,
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// iOS status bar mock
// ---------------------------------------------------------------------------
function StatusBar() {
  return (
    <div className="h-11 relative shrink-0 w-[375px] overflow-hidden" aria-hidden="true">
      <span
        className="absolute left-8 top-[13px] whitespace-nowrap"
        style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 15 }}
      >
        9:41
      </span>
      <div className="absolute right-4 top-[17px] flex items-center gap-[5px]">
        <img alt="" className="h-[11px] w-[18px]" src={ASSETS.cellular} />
        <img alt="" className="h-[11px] w-[16px]" src={ASSETS.wifi} />
        {/* Battery */}
        <div className="relative h-3 w-[22px] rounded-[3px] border border-[#161616] opacity-35">
          <div className="absolute left-[1px] top-[1px] bottom-[1px] w-[75%] rounded-[1.2px] bg-[#161616]" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation bar (large-title iOS style)
// ---------------------------------------------------------------------------
function NavBar({ title }: { title: string }) {
  return (
    <div
      className="relative h-[99px] overflow-hidden shrink-0 w-[375px]"
      style={{ backdropFilter: 'blur(6px)' }}
    >
      <p
        className="absolute left-[16px] right-[16px] bottom-[52px] translate-y-full"
        style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 32, lineHeight: '1.25' }}
      >
        {title}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section header  (Backpack BpkSectionHeader)
// ---------------------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  return (
    <p
      className="w-[327px]"
      style={{ color: bpk.textPrimary, fontFamily: bpk.fontBold, fontSize: 16, lineHeight: '1.5' }}
    >
      {title}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const TRIP_GROUPS: TripGroup[] = [
  {
    id: 'oct-2025',
    heading: 'Trip starting on 19 Oct 2025',
    items: [
      {
        type: 'flight',
        id: 'flight-lhr-bcn',
        title: 'London to Barcelona',
        subtitle: '19 Oct – 3 Nov  •  2 travellers  •  Economy',
        outbound: { depart: '19:50', arrive: '22:45', origin: 'LHR', dest: 'BCN', airline: 'British Airways', direct: true, duration: '1h 55m' },
        inbound:  { depart: '14:30', arrive: '15:45', origin: 'BCN', dest: 'LHR', airline: 'British Airways', direct: true, duration: '2h 15m' },
        badge: '£5 increase on 11 Sep',
        price: '£213',
        totalPrice: '£426 total',
      },
      {
        type: 'hotel',
        id: 'hotel-old-ship',
        name: 'The Old Ship Hotel',
        location: 'Barcelona, Spain',
        taScore: 4.5,
        reviewCount: '1,532 reviews',
        stars: 4,
        image: ASSETS.hotelOldShip,
        dateRange: '19 Oct – 3 Nov',
        occupancy: '2 adults, 1 room, 14 nights',
        price: '£85',
        totalPrice: '£1,190 total',
        prevPrice: '£2,033',
        priceLabel: 'App only deal',
      },
      {
        type: 'hotel',
        id: 'hotel-mercure',
        name: 'Mercure Barcelona',
        location: 'Barcelona, Spain',
        taScore: 4.5,
        reviewCount: '1,532 reviews',
        stars: 4,
        image: ASSETS.hotelMercure,
        dateRange: '19 Oct – 3 Nov',
        occupancy: '2 adults, 1 room, 14 nights',
        price: '£85',
        totalPrice: '£1,190 total',
        prevPrice: '£2,033',
        priceLabel: 'App only deal',
      },
      {
        type: 'car',
        id: 'car-barcelona',
        name: 'Toyota Yaris',
        category: 'or similar mini',
        location: 'Barcelona-El Prat, Spain',
        badges: ['4 passengers', '1 bag', 'Manual', 'Aircon', 'Pick up by shuttle bus'],
        dateRange: '19 Oct – 3 Nov',
        cancellation: 'Free cancellation, 14 days',
        price: '£11',
        totalPrice: '£150 total',
        priceLabel: 'App only deal',
      },
    ],
  },
  {
    id: 'jan-2026',
    heading: 'Trip starting on 12 January 2026',
    items: [
      {
        type: 'hotel',
        id: 'hotel-grand',
        name: 'Grand Hotel des Iles Borromées',
        location: 'Stresa, Italy',
        taScore: 4.5,
        reviewCount: '1,532 reviews',
        stars: 4,
        image: ASSETS.hotelGrand,
        dateRange: '12 Jan – 26 Jan',
        occupancy: '2 adults, 1 room, 14 nights',
        price: '£85',
        totalPrice: '£1,190 total',
        prevPrice: '£2,033',
        priceLabel: 'App only deal',
      },
      {
        type: 'car',
        id: 'car-milan',
        name: 'Toyota Yaris',
        category: 'or similar mini',
        location: 'Milan Malpensa, Italy',
        badges: ['4 passengers', '1 bag', 'Manual', 'Aircon', 'Pick up by shuttle bus'],
        dateRange: '12 Jan – 26 Jan',
        cancellation: 'Free cancellation, 14 days',
        price: '£11',
        totalPrice: '£150 total',
        priceLabel: 'App only deal',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Static data: Searches tab
// ---------------------------------------------------------------------------
const SEARCH_GROUPS: { id: string; heading: string; items: SearchItem[] }[] = [
  {
    id: 'oct-2025-search',
    heading: 'Departing on 19 Oct 2025',
    items: [
      {
        type: 'search',
        id: 'search-lhr-bcn',
        title: 'London to Barcelona',
        subtitle: '19 Oct – 3 Nov  •  2 travellers  •  Economy',
        badge: '£12 drop on 11 Sep',
        badgeType: 'drop',
        price: '£198',
        totalPrice: '£396 total',
      },
    ],
  },
  {
    id: 'apr-2026-search',
    heading: 'Departing on 24 April 2026',
    items: [
      {
        type: 'search',
        id: 'search-lhr-tyo',
        title: 'London to Tokyo',
        subtitle: '24 Apr – 18 May  •  2 travellers  •  Economy',
        badge: '£12 drop on 11 Sep',
        badgeType: 'drop',
        price: '£495',
        totalPrice: '£990 total',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function SavedScreen() {
  const allTripIds   = TRIP_GROUPS.flatMap((g) => g.items.map((i) => i.id));
  const allSearchIds = SEARCH_GROUPS.flatMap((g) => g.items.map((i) => i.id));

  const [activeFilter, setActiveFilter] = useState<'All' | 'Searches'>('All');
  const [saved, setSaved]               = useState<Set<string>>(new Set([...allTripIds, ...allSearchIds]));
  const [priceAlerts, setPriceAlerts]   = useState<Set<string>>(new Set(['flight-lhr-bcn', 'search-lhr-bcn', 'search-lhr-tyo']));
  const [removed, setRemoved]           = useState<Set<string>>(new Set());
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const timers                          = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const togglePriceAlert = (id: string) => setPriceAlerts((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  function getLabel(id: string) {
    for (const g of TRIP_GROUPS) {
      for (const item of g.items) {
        if (item.id !== id) continue;
        if (item.type === 'hotel') return item.name;
        if (item.type === 'car')   return item.name;
        if (item.type === 'flight') return item.title;
      }
    }
    for (const g of SEARCH_GROUPS)
      for (const item of g.items)
        if (item.id === id) return item.title;
    return 'Item';
  }

  function handleUnsave(id: string) {
    const toastId = `${id}-${Date.now()}`;
    setSaved((s)    => { const n = new Set(s); n.delete(id); return n; });
    setRemoved((r)  => { const n = new Set(r); n.add(id);    return n; });
    setToasts((t)   => [...t, { toastId, itemId: id, label: getLabel(id) }]);

    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.toastId !== toastId));
      timers.current.delete(toastId);
    }, 5000);
    timers.current.set(toastId, timer);
  }

  function handleUndo(toastId: string) {
    const toast = toasts.find((t) => t.toastId === toastId);
    if (!toast) return;
    clearTimeout(timers.current.get(toastId));
    timers.current.delete(toastId);
    setRemoved((r) => { const n = new Set(r); n.delete(toast.itemId); return n; });
    setSaved((s)   => { const n = new Set(s); n.add(toast.itemId);    return n; });
    setToasts((t)  => t.filter((x) => x.toastId !== toastId));
  }

  return (
    <div
      className="flex flex-col items-start overflow-hidden relative rounded-[24px] size-full"
      style={{ backgroundColor: bpk.canvas, paddingBottom: 96 }}
    >
      <StatusBar />
      <NavBar title="Saved" />

      <div className="flex flex-col gap-6 items-start pb-6 px-4 w-full shrink-0">
        {/* Filter chips */}
        <div className="flex gap-2 items-center">
          {(['All', 'Searches'] as const).map((f) => (
            <FilterChip key={f} label={f} selected={activeFilter === f} onClick={() => setActiveFilter(f)} />
          ))}
        </div>

        {/* All tab — trip groups */}
        {activeFilter === 'All' && (
          <div className="flex flex-col gap-8 items-start shrink-0">
            {TRIP_GROUPS.map((group) => {
              const visibleItems = group.items.filter((item) => !removed.has(item.id));
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.id} className="flex flex-col gap-2 items-start shrink-0">
                  <SectionHeader title={group.heading} />
                  <div className="flex flex-col gap-2 items-start shrink-0">
                    <AnimatePresence mode="popLayout">
                    {visibleItems.map((item) => {
                      let card: React.ReactNode = null;
                      if (item.type === 'flight') {
                        card = (
                          <FlightCard
                            item={item}
                            saved={saved.has(item.id)}
                            priceAlert={priceAlerts.has(item.id)}
                            onSave={() => handleUnsave(item.id)}
                            onPriceAlert={() => togglePriceAlert(item.id)}
                          />
                        );
                      } else if (item.type === 'hotel') {
                        card = (
                          <HotelCard
                            item={item}
                            saved={saved.has(item.id)}
                            onSave={() => handleUnsave(item.id)}
                          />
                        );
                      } else if (item.type === 'car') {
                        card = (
                          <CarCard
                            item={item}
                            saved={saved.has(item.id)}
                            onSave={() => handleUnsave(item.id)}
                          />
                        );
                      }
                      if (!card) return null;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25, layout: { duration: 0.25 } }}
                        >
                          {card}
                        </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Searches tab */}
        {activeFilter === 'Searches' && (
          <div className="flex flex-col gap-8 items-start shrink-0">
            {SEARCH_GROUPS.map((group) => {
              const visibleItems = group.items.filter((item) => !removed.has(item.id));
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.id} className="flex flex-col gap-2 items-start shrink-0">
                  <SectionHeader title={group.heading} />
                  <div className="flex flex-col gap-2 items-start shrink-0">
                    <AnimatePresence mode="popLayout">
                      {visibleItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25, layout: { duration: 0.25 } }}
                        >
                          <SearchCard
                            item={item}
                            saved={saved.has(item.id)}
                            priceAlert={priceAlerts.has(item.id)}
                            onSave={() => handleUnsave(item.id)}
                            onPriceAlert={() => togglePriceAlert(item.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} onUndo={handleUndo} />
    </div>
  );
}
