# User Story 1 Playground: API as Single Source of Truth

## Purpose

Demonstrate that location data is successfully fetched from the API with all translations, eliminating the need for separate translation files.

## What This Demonstrates

✅ API endpoint returns location data with embedded translations  
✅ Location names available in all 7 languages (en, th, zh, hi, es, fr, ar)  
✅ Role names available in all 7 languages  
✅ 24-hour caching works correctly  
✅ Skeleton loading UI displays during fetch  
✅ Error handling works when API fails  
✅ Old translation files are no longer used

## How to Test

### 1. Start the Development Server

```bash
cd /Users/greenrenge/personal/cf-boardgames/cf-boardgames
npm run dev
```

### 2. Test API Endpoint Directly

```bash
# Test API endpoint
curl http://localhost:3000/api/locations | jq '.locations[0]'

# Expected response structure:
# {
#   "version": "1.0.0",
#   "timestamp": "2025-10-30T...",
#   "locations": [
#     {
#       "id": "loc-hospital",
#       "names": {
#         "en": "Hospital",
#         "th": "โรงพยาบาล",
#         "zh": "医院",
#         ...
#       },
#       "roles": [
#         {
#           "id": "loc-hospital-role-1",
#           "names": {
#             "en": "Doctor",
#             "th": "หมอ",
#             ...
#           }
#         }
#       ]
#     }
#   ]
# }
```

### 3. Test in Browser

1. Open application: `http://localhost:3000`
2. Open DevTools → Network tab
3. Navigate to a page that loads locations
4. Verify:
   - GET request to `/api/locations` is made
   - Response includes `version`, `timestamp`, and `locations` array
   - Each location has `names` object with all 7 languages
   - Each role has `names` object with all 7 languages

### 4. Test Caching

1. Load locations once (should see API request)
2. Refresh the page
3. Check Network tab - should use cached data (no new API request for 24 hours)
4. Open DevTools → Application → localStorage
5. Find key: `api-cache:locations`
6. Verify cached data structure

### 5. Test Cache Expiration

```javascript
// In browser console:
// Clear cache manually
localStorage.removeItem('api-cache:locations');

// Reload page - should trigger new API request
location.reload();
```

### 6. Test Language Switching

1. Switch application language to each supported locale
2. Verify location and role names display correctly in each language
3. Languages to test: English, Thai, Chinese, Hindi, Spanish, French, Arabic

### 7. Test Error Handling

```javascript
// In browser console:
// Simulate API failure (block network requests in DevTools)

// Expected behavior:
// - If cache exists and < 24 hours old: Use cached data
// - If cache expired or missing: Show error message
// - User sees friendly error, app doesn't crash
```

## Success Criteria

- [x] API endpoint `/api/locations` returns valid JSON with version and timestamp
- [x] Each location includes names in all 7 languages
- [x] Each role includes names in all 7 languages
- [x] API response is cached in localStorage with 24-hour expiration
- [x] Skeleton UI displays during initial load
- [x] Error UI displays when API fails and no cache available
- [x] Switching languages shows correct translations (no fallback to English)
- [x] Old translation files in `locales/{lang}/locations.json` and `locales/{lang}/roles.json` can be deleted without breaking the app

## Files Involved

- `workers/src/locations/handler.ts` - API endpoint handler
- `workers/src/locations/data.ts` - Location data source
- `lib/api/locationsApi.ts` - API client with caching
- `lib/api/apiCache.ts` - Cache utility
- `lib/types.ts` - Type definitions
- `data/migration/locations-api-ready.json` - Migrated data

## Next Steps

After validating this playground:

1. Integration with existing components (Phase 3 remaining tasks)
2. Merge logic for localStorage overrides (Phase 4)
3. Customization UI (Phase 5)
