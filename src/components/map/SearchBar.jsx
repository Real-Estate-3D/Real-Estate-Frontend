import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onLocationSelect, onTorontoSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);
  const searchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Nominatim (OpenStreetMap)
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&format=json` +
        `&limit=5` +
        `&addressdetails=1`
      );
      
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Wait 300ms after user stops typing
  };

  // Handle suggestion selection
  const handleSelect = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);

    const longitude = parseFloat(suggestion.lon);
    const latitude = parseFloat(suggestion.lat);

    // Check if this is Toronto
    const isToronto = suggestion.display_name.toLowerCase().includes('toronto') ||
                      suggestion.display_name.toLowerCase().includes('ontario');

    // Pass location data to parent
    if (onLocationSelect) {
      onLocationSelect({
        longitude,
        latitude,
        name: suggestion.display_name,
      });
    }

    // If Toronto, trigger WMS layer load
    if (isToronto && onTorontoSelect) {
      console.log('🗺️ Toronto detected - loading WMS layer');
      onTorontoSelect();
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 px-5 py-3.5 min-w-80">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Enter a province or a city"
            className="bg-transparent flex-1 text-gray-800 placeholder-gray-500 focus:outline-none font-medium"
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
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/30 overflow-hidden z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.place_id}-${index}`}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <Search className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/30 px-5 py-4 z-50">
          <p className="text-sm text-gray-500 text-center">
            No locations found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;