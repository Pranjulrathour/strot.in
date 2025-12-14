import { useState, useCallback, useRef } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

/**
 * Attempts reverse geocoding using BigDataCloud's free API (no API key required, CORS-friendly).
 * Falls back to coordinate string if geocoding fails.
 */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Use BigDataCloud's free reverse geocoding API - it's CORS-friendly and doesn't require API key
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Build address from available parts
    const parts: string[] = [];
    if (data.locality) parts.push(data.locality);
    else if (data.city) parts.push(data.city);
    
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
    if (data.countryName) parts.push(data.countryName);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    // Fallback to full description if available
    if (data.localityInfo?.administrative) {
      const adminParts = data.localityInfo.administrative
        .filter((a: any) => a.name)
        .map((a: any) => a.name)
        .slice(0, 3);
      if (adminParts.length > 0) {
        return adminParts.join(", ");
      }
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    // Silently fail - coordinates are still valid
    console.warn("Reverse geocoding failed (non-critical):", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/**
 * Attempts to get location with a multi-strategy approach:
 * 1. First try high accuracy (GPS) with shorter timeout
 * 2. If that fails, try low accuracy (network/WiFi) with longer timeout
 * 3. Use cached position if available and fresh enough
 */
async function getPositionWithFallback(): Promise<GeolocationPosition> {
  const highAccuracyOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // 15 seconds for GPS
    maximumAge: 30000, // Accept 30-second old cache
  };

  const lowAccuracyOptions: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 30000, // 30 seconds for network location
    maximumAge: 120000, // Accept 2-minute old cache
  };

  // Try high accuracy first
  try {
    return await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, highAccuracyOptions);
    });
  } catch (highAccuracyError: any) {
    console.warn("High accuracy location failed, trying low accuracy:", highAccuracyError.message);

    // If permission denied, don't retry - it won't help
    if (highAccuracyError.code === 1) {
      throw highAccuracyError;
    }

    // Try low accuracy as fallback
    return await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, lowAccuracyOptions);
    });
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: null,
    isLoading: false,
    error: null,
  });

  // Track if a request is in progress to prevent duplicate calls
  const isRequestingRef = useRef(false);

  const getCurrentLocation = useCallback(async (): Promise<GeolocationResult | null> => {
    // Prevent duplicate concurrent requests
    if (isRequestingRef.current) {
      console.log("Location request already in progress");
      return null;
    }

    // Geolocation only works in secure contexts (HTTPS) or localhost.
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setState((prev) => ({
        ...prev,
        error: "Location requires HTTPS (or localhost). Please open the site on https:// or http://localhost.",
        isLoading: false,
      }));
      return null;
    }

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }));
      return null;
    }

    isRequestingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getPositionWithFallback();
      const { latitude, longitude } = position.coords;

      // Immediately show coordinates while we fetch the address
      setState({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        isLoading: false,
        error: null,
      });

      // Fetch human-readable address in background (non-blocking)
      reverseGeocode(latitude, longitude).then((address) => {
        setState((prev) => {
          // Only update if coordinates still match (user didn't clear)
          if (prev.latitude === latitude && prev.longitude === longitude) {
            return { ...prev, address };
          }
          return prev;
        });
      });

      isRequestingRef.current = false;
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    } catch (error: any) {
      isRequestingRef.current = false;

      let errorMessage = "Failed to get location";

      if (error.code === 1) {
        errorMessage =
          "Location permission denied. Please allow location access in your browser settings and try again.";
      } else if (error.code === 2) {
        errorMessage =
          "Location unavailable. Please ensure GPS/Location Services are enabled on your device.";
      } else if (error.code === 3) {
        errorMessage =
          "Location request timed out. Please ensure you have a clear view of the sky (for GPS) or are connected to WiFi, then try again.";
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      address: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
  };
}
