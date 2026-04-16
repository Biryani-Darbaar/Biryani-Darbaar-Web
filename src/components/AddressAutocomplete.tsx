/**
 * AddressAutocomplete
 *
 * Provides address search with autocomplete using the free OpenStreetMap
 * Nominatim API (no API key required). Calculates distance from the
 * restaurant and returns the appropriate delivery fee tier.
 *
 * Delivery fee tiers:
 *   0–5 km   → $10
 *   5–10 km  → $15
 *   10–15 km → $20
 *   15–20 km → $25
 *   20+ km   → $30
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

// ─── Restaurant location ──────────────────────────────────────────────────────
// Update these coordinates to match the actual restaurant location
/**
 * ⚠️ IMPORTANT: These coordinates are PLACEHOLDER VALUES!
 * Delivery fees will be INCORRECT until you update with real restaurant location.
 *
 * To find your restaurant's coordinates:
 * 1. Search on Google Maps: https://maps.google.com
 * 2. Right-click your restaurant → Copy coordinates
 * 3. Replace lat/lng values below
 * 4. Test with a known customer address to verify fees
 */
export const RESTAURANT_COORDS = {
  lat: -34.858247, // ⚠️ UPDATE THIS: Current location is Adelaide CBD (placeholder)
  lng: 138.5444049, // ⚠️ UPDATE THIS: Current location is Adelaide CBD (placeholder)
  name: "Biryani Darbaar",
};

// ─── Delivery distance limit ──────────────────────────────────────────────────
export const MAX_DELIVERY_KM = 25;

// ─── Delivery fee tiers ───────────────────────────────────────────────────────
export const DELIVERY_TIERS: { maxKm: number; fee: number }[] = [
  { maxKm: 5, fee: 10 },
  { maxKm: 10, fee: 15 },
  { maxKm: 15, fee: 20 },
  { maxKm: 20, fee: 25 },
  { maxKm: 25, fee: 30 },
];

/**
 * Calculate delivery fee based on distance in km.
 */
export const getDeliveryFee = (distanceKm: number): number => {
  const tier = DELIVERY_TIERS.find((t) => distanceKm <= t.maxKm);
  return tier?.fee ?? 30;
};

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
export const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Nominatim types ──────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface AddressResult {
  /** Full formatted address string */
  fullAddress: string;
  /** House/unit + street */
  streetLine: string;
  suburb: string;
  city: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  distanceKm: number;
  deliveryFee: number;
  /** true when distance exceeds MAX_DELIVERY_KM */
  isOutOfRange: boolean;
}

interface AddressAutocompleteProps {
  /** House / unit number input value */
  houseNo: string;
  onHouseNoChange: (value: string) => void;
  /** Address search input value */
  addressQuery: string;
  onAddressQueryChange: (value: string) => void;
  /** Called when user selects a result */
  onAddressSelect: (result: AddressResult) => void;
  /** Currently selected address (to show confirmed state) */
  selectedAddress: AddressResult | null;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  houseNo,
  onHouseNoChange,
  addressQuery,
  onAddressQueryChange,
  onAddressSelect,
  selectedAddress,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced Nominatim search (300 ms)
  const search = useCallback(async (query: string) => {
    if (query.trim().length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "6",
        countrycodes: "au", // restrict to Australia
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            // Nominatim policy requires a User-Agent
            "Accept-Language": "en-AU",
          },
        },
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("[Nominatim] Search error:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onAddressQueryChange(value);
    // Clear selection when user starts typing again
    if (selectedAddress)
      onAddressSelect({ ...selectedAddress, fullAddress: value });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address ?? {};
    const streetLine = [addr.house_number, addr.road].filter(Boolean).join(" ");
    const suburb = addr.suburb ?? "";
    const city = addr.city ?? addr.suburb ?? "";
    const state = addr.state ?? "";
    const postcode = addr.postcode ?? "";
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const distanceKm = haversineKm(
      RESTAURANT_COORDS.lat,
      RESTAURANT_COORDS.lng,
      lat,
      lng,
    );
    const isOutOfRange = distanceKm > MAX_DELIVERY_KM;
    const deliveryFee = isOutOfRange ? 0 : getDeliveryFee(distanceKm);

    const addressResult: AddressResult = {
      fullAddress: result.display_name,
      streetLine: streetLine || result.display_name.split(",")[0],
      suburb,
      city,
      state,
      postcode,
      lat,
      lng,
      distanceKm,
      deliveryFee,
      isOutOfRange,
    };

    onAddressSelect(addressResult);
    onAddressQueryChange(
      streetLine || result.display_name.split(",").slice(0, 2).join(",").trim(),
    );
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const INPUT_CLASS =
    "w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60";

  return (
    <div className="space-y-3">
      {/* House / Unit number */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          House / Unit No.
        </label>
        <input
          type="text"
          value={houseNo}
          onChange={(e) => onHouseNoChange(e.target.value)}
          placeholder="e.g. Unit 4, Level 2"
          className={INPUT_CLASS}
          disabled={disabled}
        />
      </div>

      {/* Address search */}
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Street Address *
        </label>
        <div className="relative">
          <input
            type="text"
            value={addressQuery}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Start typing your street address…"
            className={`${INPUT_CLASS} pr-10`}
            disabled={disabled}
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((result) => (
              <li
                key={result.place_id}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur before selection
                  handleSelect(result);
                }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-0"
              >
                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-700 leading-snug">
                  {result.display_name}
                </span>
              </li>
            ))}
            <li className="px-4 py-2 text-xs text-neutral-400 text-right bg-neutral-50">
              Powered by OpenStreetMap
            </li>
          </ul>
        )}
      </div>

      {/* Distance + fee badge */}
      {selectedAddress && (
        selectedAddress.isOutOfRange ? (
          <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {selectedAddress.distanceKm.toFixed(1)} km — outside delivery zone
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                We currently deliver within {MAX_DELIVERY_KM} km. Please select a closer location.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-green-700">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {selectedAddress.distanceKm.toFixed(1)} km from restaurant
                </p>
                <p className="text-xs text-green-600">{RESTAURANT_COORDS.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-700">
                Delivery: ${selectedAddress.deliveryFee.toFixed(2)}
              </p>
              <p className="text-xs text-green-600">
                {selectedAddress.distanceKm <= 5
                  ? "0–5 km zone"
                  : selectedAddress.distanceKm <= 10
                    ? "5–10 km zone"
                    : selectedAddress.distanceKm <= 15
                      ? "10–15 km zone"
                      : selectedAddress.distanceKm <= 20
                        ? "15–20 km zone"
                        : "20–25 km zone"}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AddressAutocomplete;
