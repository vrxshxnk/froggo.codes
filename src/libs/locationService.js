let cachedLocation = null;
let locationPromise = null;

export const locationService = {
  async detectUserLocation() {
    // Return cached result if available
    if (cachedLocation !== null) {
      return cachedLocation;
    }

    // Return ongoing promise if location detection is in progress
    if (locationPromise) {
      return locationPromise;
    }

    // Start new location detection
    locationPromise = this._performLocationDetection();
    const result = await locationPromise;
    
    // Clear promise and cache result
    locationPromise = null;
    cachedLocation = result;
    
    return result;
  },

  async _performLocationDetection() {
    const methods = [
      // Method 1: Cloudflare (most reliable)
      async () => {
        const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
          timeout: 3000
        });
        const text = await response.text();
        const lines = text.split('\n');
        const locationLine = lines.find(line => line.startsWith('loc='));
        if (locationLine) {
          const countryCode = locationLine.split('=')[1];
          return countryCode === 'IN';
        }
        throw new Error('Cloudflare location not found');
      },

      // Method 2: JavaScript Intl API (browser-based)
      async () => {
        if (typeof window !== 'undefined' && window.Intl) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          // Indian timezones
          const indianTimezones = [
            'Asia/Kolkata', 'Asia/Calcutta'
          ];
          return indianTimezones.includes(timezone);
        }
        throw new Error('Intl API not available');
      },

      // Method 3: IP Geolocation (fallback)
      async () => {
        const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
          timeout: 5000
        });
        const data = await response.json();
        if (data.countryCode) {
          return data.countryCode === 'IN';
        }
        throw new Error('IP-API failed');
      }
    ];

    // Try each method in sequence
    for (const method of methods) {
      try {
        console.log('Trying location detection method...');
        const result = await method();
        console.log('Location detection successful:', result ? 'India' : 'International');
        return result;
      } catch (error) {
        console.warn('Location detection method failed:', error.message);
        continue;
      }
    }

    // All methods failed, default to Indian pricing (safer for business)
    console.warn('All location detection methods failed, defaulting to Indian pricing');
    return true;
  },

  // Clear cache (useful for testing)
  clearCache() {
    cachedLocation = null;
    locationPromise = null;
  }
};