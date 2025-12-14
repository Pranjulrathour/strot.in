import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, Navigation, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LocationData {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationPickerProps {
  value?: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (lat: number | null, lng: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showMapLink?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export function LocationPicker({
  value = "",
  onChange,
  onCoordinatesChange,
  placeholder = "Enter location or use auto-detect",
  className,
  disabled = false,
  showMapLink = true,
  latitude,
  longitude,
}: LocationPickerProps) {
  const { toast } = useToast();
  const {
    address,
    latitude: geoLat,
    longitude: geoLng,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation,
  } = useGeolocation();

  const [localLat, setLocalLat] = useState<number | null>(latitude ?? null);
  const [localLng, setLocalLng] = useState<number | null>(longitude ?? null);

  useEffect(() => {
    if (address && geoLat && geoLng) {
      onChange(address);
      setLocalLat(geoLat);
      setLocalLng(geoLng);
      onCoordinatesChange?.(geoLat, geoLng);
      toast({
        title: "Location detected",
        description: address,
      });
    }
  }, [address, geoLat, geoLng]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Location error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleAutoDetect = async () => {
    await getCurrentLocation();
  };

  const handleClear = () => {
    onChange("");
    setLocalLat(null);
    setLocalLng(null);
    onCoordinatesChange?.(null, null);
    clearLocation();
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (localLat || localLng) {
      setLocalLat(null);
      setLocalLng(null);
      onCoordinatesChange?.(null, null);
    }
  };

  const hasCoordinates = localLat !== null && localLng !== null;
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${localLat},${localLng}`
    : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={handleManualChange}
            placeholder={placeholder}
            className="pl-9 pr-8"
            disabled={disabled || isLoading}
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAutoDetect}
          disabled={disabled || isLoading}
          className={cn(
            "shrink-0 transition-all",
            isLoading && "animate-pulse bg-primary/10"
          )}
          title="Auto-detect my location"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {hasCoordinates && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            GPS: {localLat?.toFixed(4)}, {localLng?.toFixed(4)}
          </span>
          {showMapLink && googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View on Map
            </a>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Detecting your location...
        </p>
      )}
    </div>
  );
}

export function LocationDisplay({
  address,
  latitude,
  longitude,
  className,
  showFullAddress = true,
}: {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
  showFullAddress?: boolean;
}) {
  const hasCoordinates = latitude !== null && longitude !== null && latitude !== undefined && longitude !== undefined;
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  if (!address && !hasCoordinates) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className={cn("text-muted-foreground", !showFullAddress && "truncate max-w-[200px]")}>
        {address || "Location set"}
      </span>
      {hasCoordinates && googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline shrink-0"
          title="Open in Google Maps"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
