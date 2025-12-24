// File: src/components/map/SearchBar.jsx

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, X, MapPin, Building2, Loader2, Landmark } from 'lucide-react';
import { useParcelSearch } from '../../hooks/useParcelSearch';
import { useMunicipalitySearch } from '../../hooks/useMunicipalitySearch';
import { NOMINATIM_SEARCH_URL } from '../../utils/runtimeConfig';

// Memoized search result item to prevent re-renders
const PlaceResultItem = memo(({ suggestion, onSelect }) => (
  <button
    onClick={() => onSelect(suggestion)}
    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-start gap-2.5">
      <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {suggestion.display_name.split(',')[0]}
        </div>
        <div className="text-xs text-gray-400 truncate mt-0.5">
          {suggestion.display_name}
        </div>
      </div>
    </div>
  </button>
));

PlaceResultItem.displayName = 'PlaceResultItem';

// Memoized parcel result item
const ParcelResultItem = memo(({ parcel, onSelect }) => (
  <button
    onClick={() => onSelect(parcel)}
    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors group"
  >
    <div className="flex items-start gap-2.5">
      <Building2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
          {parcel.displayName}
        </div>
        {parcel.pin && (
          <div className="text-xs text-gray-500 truncate mt-0.5">
            PIN: {parcel.pin}
          </div>
        )}
        {parcel.municipality && (
          <div className="text-xs text-gray-400 truncate">
            {parcel.municipality}
          </div>
        )}
      </div>
    </div>
  </button>
));

ParcelResultItem.displayName = 'ParcelResultItem';

// Memoized municipality result item
const MunicipalityResultItem = memo(({ municipality, onSelect }) => (
  <button
    onClick={() => onSelect(municipality)}
    className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors group"
  >
    <div className="flex items-start gap-2.5">
      <Landmark className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate group-hover:text-purple-600">
          {municipality.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            municipality.type === 'UpperTier' 
              ? 'bg-orange-100 text-orange-700' 
              : municipality.type === 'LowerTier'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {municipality.type}
          </span>
          {municipality.region && (
            <span className="text-xs text-gray-400 truncate">
              {municipality.region}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
));

MunicipalityResultItem.displayName = 'MunicipalityResultItem';

// Section header component
const SectionHeader = memo(({ icon: Icon, title, count, color }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</span>
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
      {count}
    </span>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

const SearchBar = memo(({ onLocationSelect, onParcelSelect, onMunicipalitySelect }) => {
  const [query, setQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const debounceTimer = useRef(null);
  const searchRef = useRef(null);
  
  // Parcel search hook
  const { 
    results: parcelResults, 
    isLoading: isLoadingParcels, 
    searchParcels, 
    clearResults: clearParcelResults 
  } = useParcelSearch();

  // Municipality search hook
  const {
    results: municipalityResults,
    isLoading: isLoadingMunicipalities,
    searchMunicipalities,
    clearResults: clearMunicipalityResults
  } = useMunicipalitySearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch place suggestions from Nominatim
  const fetchPlaceSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setPlaceSuggestions([]);
      return;
    }

    setIsLoadingPlaces(true);
    try {
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&format=json` +
        `&limit=5` +
        `&addressdetails=1`
      );
      
      const data = await response.json();
      setPlaceSuggestions(data);
    } catch (error) {
      console.error('Geocoding error:', error);
      setPlaceSuggestions([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // Debounced search - triggers all searches in parallel
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value || value.length < 2) {
      setPlaceSuggestions([]);
      clearParcelResults();
      clearMunicipalityResults();
      setShowDropdown(false);
      return;
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      // Search all three in parallel
      Promise.all([
        fetchPlaceSuggestions(value),
        searchParcels(value),
        searchMunicipalities(value)
      ]).then(() => {
        setShowDropdown(true);
      });
    }, 350);
  }, [fetchPlaceSuggestions, searchParcels, searchMunicipalities, clearParcelResults, clearMunicipalityResults]);

  // Handle place selection
  const handlePlaceSelect = useCallback((suggestion) => {
    setQuery(suggestion.display_name.split(',')[0]);
    setShowDropdown(false);
    setPlaceSuggestions([]);

    const longitude = parseFloat(suggestion.lon);
    const latitude = parseFloat(suggestion.lat);

    if (onLocationSelect) {
      onLocationSelect({
        longitude,
        latitude,
        name: suggestion.display_name,
      });
    }
  }, [onLocationSelect]);

  // Handle parcel selection - zooms to parcel boundary
  const handleParcelSelect = useCallback((parcel) => {
    setQuery(parcel.displayName);
    setShowDropdown(false);
    clearParcelResults();

    if (onParcelSelect) {
      onParcelSelect(parcel);
    } else if (onLocationSelect && parcel.bbox) {
      // Fallback: zoom to center of bbox
      const [minX, minY, maxX, maxY] = parcel.bbox;
      const centerLon = (minX + maxX) / 2;
      const centerLat = (minY + maxY) / 2;
      
      onLocationSelect({
        longitude: centerLon,
        latitude: centerLat,
        name: parcel.displayName,
        bbox: parcel.bbox,
        geometry: parcel.geometry,
        properties: parcel.properties,
        isParcel: true
      });
    }
  }, [onLocationSelect, onParcelSelect, clearParcelResults]);

  // Handle municipality selection - drills down to municipality
  const handleMunicipalitySelect = useCallback((municipality) => {
    setQuery(municipality.name);
    setShowDropdown(false);
    clearMunicipalityResults();

    if (onMunicipalitySelect) {
      onMunicipalitySelect(municipality);
    } else if (onLocationSelect && municipality.centroid) {
      // Fallback: fly to centroid
      onLocationSelect({
        longitude: municipality.centroid.longitude,
        latitude: municipality.centroid.latitude,
        name: municipality.name,
        bbox: municipality.bbox,
        geometry: municipality.geometry,
        properties: municipality.properties,
        isMunicipality: true,
        type: municipality.type
      });
    }
  }, [onLocationSelect, onMunicipalitySelect, clearMunicipalityResults]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setPlaceSuggestions([]);
    clearParcelResults();
    clearMunicipalityResults();
    setShowDropdown(false);
  }, [clearParcelResults, clearMunicipalityResults]);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (query.length >= 2 && (placeSuggestions.length > 0 || parcelResults.length > 0 || municipalityResults.length > 0)) {
      setShowDropdown(true);
    }
  }, [query, placeSuggestions.length, parcelResults.length, municipalityResults.length]);

  const isLoading = isLoadingPlaces || isLoadingParcels || isLoadingMunicipalities;
  const hasResults = placeSuggestions.length > 0 || parcelResults.length > 0 || municipalityResults.length > 0;
  const hasNoResults = query.length >= 2 && !isLoading && !hasResults;

  return (
    <div ref={searchRef} className="relative pointer-events-auto">
      {/* Search Input */}
      <div className="bg-white rounded-xl shadow-md px-4 py-2.5 min-w-80">
        <div className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Search parcels, municipalities, addresses..."
            className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Dropdown - Single scrollable list with sections */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto">
            
            {/* Loading state */}
            {isLoading && !hasResults && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Searching...</span>
              </div>
            )}

            {/* Parcels Section */}
            {parcelResults.length > 0 && (
              <div>
                <SectionHeader 
                  icon={Building2} 
                  title="Parcels" 
                  count={parcelResults.length}
                  color="text-emerald-500"
                />
                {parcelResults.map((parcel) => (
                  <ParcelResultItem 
                    key={parcel.id} 
                    parcel={parcel} 
                    onSelect={handleParcelSelect} 
                  />
                ))}
              </div>
            )}

            {/* Municipalities Section */}
            {municipalityResults.length > 0 && (
              <div>
                <SectionHeader 
                  icon={Landmark} 
                  title="Municipalities" 
                  count={municipalityResults.length}
                  color="text-purple-500"
                />
                {municipalityResults.map((municipality) => (
                  <MunicipalityResultItem 
                    key={municipality.id} 
                    municipality={municipality} 
                    onSelect={handleMunicipalitySelect} 
                  />
                ))}
              </div>
            )}

            {/* Places Section */}
            {placeSuggestions.length > 0 && (
              <div>
                <SectionHeader 
                  icon={MapPin} 
                  title="Places" 
                  count={placeSuggestions.length}
                  color="text-blue-500"
                />
                {placeSuggestions.map((suggestion, index) => (
                  <PlaceResultItem 
                    key={`${suggestion.place_id}-${index}`} 
                    suggestion={suggestion} 
                    onSelect={handlePlaceSelect} 
                  />
                ))}
              </div>
            )}

            {/* No results state */}
            {hasNoResults && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Quick tip - only show when there are results */}
          {hasResults && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                💡 Search by address, PIN, municipality name, or location
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;