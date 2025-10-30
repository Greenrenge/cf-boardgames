# Role Translation Testing Guide

**Feature**: 004-multi-language  
**User Story**: 3 - Role Names Translation  
**Date**: 2025-10-30  
**Status**: Ready for Testing

## Quick Start

### Prerequisites

1. Development server running: `npm run dev`
2. Browser with dev tools open
3. Test room created with multiple players

### Quick Test (5 minutes)

1. Open app in browser
2. Switch to English language
3. Create a test room
4. Start game and check role names
5. Switch to Thai language (refresh if needed)
6. Verify role names change

## Detailed Testing Checklist

### ✅ 1. Infrastructure Verification

**Files Exist:**

```bash
# Check all role translation files exist
ls -la locales/*/roles.json

# Expected output:
# locales/en/roles.json
# locales/th/roles.json
# locales/zh/roles.json
# locales/hi/roles.json
# locales/es/roles.json
# locales/fr/roles.json
# locales/ar/roles.json
```

**File Content Check:**

```bash
# Verify English translations (should have 382 entries)
cat locales/en/roles.json | grep -c '"'

# Verify Thai translations (should have 382 entries)
cat locales/th/roles.json | grep -c '"'
```

### ✅ 2. Component Integration Testing

#### Test Case 2.1: RoleCard Component

**Steps:**

1. Create a room and start a game
2. Check your assigned role card
3. Verify role name displays in current language
4. Switch language in settings
5. Refresh the page
6. Verify role name updates to new language

**Expected Results:**

- ✅ Role name displays (not Thai if English selected)
- ✅ Role name styling correct (large, bold, centered)
- ✅ Language switching works
- ✅ No console errors
- ✅ Loading state doesn't flicker

**Test Data:**
| Original Thai | English | Slug Key |
|---------------|---------|----------|
| ครู | Teacher | teacher |
| หมอ | Doctor | doctor |
| ลูกค้า | Customer | customer |
| รปภ. | Security Guard | security-guard |
| พยาบาล | Nurse | nurse |

**Console Check:**

```javascript
// Open browser console and check:
// Should NOT see errors like:
// "Failed to load role translations"
// "getRoleName is not a function"
```

#### Test Case 2.2: LocationReference Component

**Steps:**

1. As a non-spy player, view your role card
2. Scroll down to see location reference
3. Check the list of roles for your location
4. Count the roles (should be 7)
5. Verify all 7 roles are translated
6. Switch language and verify updates

**Expected Results:**

- ✅ All 7 roles display in 2-column grid
- ✅ Each role translated to current language
- ✅ Thai roles show if language has placeholders
- ✅ No duplicate roles (unless intentional)
- ✅ Roles match location theme

**Test Locations:**

- Hospital (loc-hospital): Doctor, Nurse, Patient, etc.
- School (loc-school): Teacher, Student, Principal, etc.
- Market (loc-local-market): Vendor, Customer, etc.

#### Test Case 2.3: SpyLocationBrowser Component

**Steps:**

1. Be assigned as Spy role
2. Open "All Locations" browser
3. Click on any location thumbnail
4. View the modal with enlarged image
5. Scroll to "Available Roles" section
6. Verify all roles are translated

**Expected Results:**

- ✅ Roles display in 2-4 column grid
- ✅ Each role in current language
- ✅ Role count shows (7)
- ✅ Roles readable and clear
- ✅ No layout issues

### ✅ 3. Language-Specific Testing

#### Test 3.1: English (en) - Complete Translations

**Test Steps:**

1. Switch to English language
2. Create room and start game
3. Check RoleCard shows English role name
4. Verify LocationReference shows English roles
5. Check SpyLocationBrowser modal roles

**Sample Roles to Verify:**

- Teacher (not "ครู")
- Doctor (not "หมอ")
- Security Guard (not "รปภ.")
- Flight Attendant (not Thai)
- Customer (not Thai)

**Expected:** All 382 roles display in proper English with capitalization.

#### Test 3.2: Thai (th) - Complete Translations

**Test Steps:**

1. Switch to Thai language (or default)
2. Start game and check roles
3. Verify Thai characters display correctly
4. No broken characters or encoding issues

**Sample Roles to Verify:**

- ครู (Teacher)
- หมอ (Doctor)
- ลูกค้า (Customer)
- ตำรวจ (Police Officer)
- พนักงานต้อนรับบนเครื่องบิน (Flight Attendant)

**Expected:** All Thai roles display correctly in native script.

#### Test 3.3: Chinese (zh) - Placeholder Testing

**Test Steps:**

1. Switch to Chinese language
2. Start game
3. Verify roles display (will be Thai placeholders)
4. Check no console errors

**Expected:**

- ✅ Thai text displays (placeholder)
- ✅ No JavaScript errors
- ✅ Layout not broken
- ⚠️ Translation pending (expected behavior)

#### Test 3.4: Hindi (hi) - Placeholder Testing

Same as 3.3 but for Hindi language.

#### Test 3.5: Spanish (es) - Placeholder Testing

Same as 3.3 but for Spanish language.

#### Test 3.6: French (fr) - Placeholder Testing

Same as 3.3 but for French language.

#### Test 3.7: Arabic (ar) - Placeholder + RTL Testing

**Test Steps:**

1. Switch to Arabic language
2. Start game
3. Check RTL layout works
4. Verify role text displays correctly
5. Check no text overflow issues

**Expected:**

- ✅ Page layout RTL
- ✅ Role cards aligned correctly
- ✅ Thai placeholders readable
- ✅ No text cutoff

### ✅ 4. Edge Case Testing

#### Test 4.1: Missing Role Translation

**Simulate:**

1. Edit `locales/en/roles.json`
2. Remove one role entry (e.g., "teacher")
3. Start game with that role
4. Check fallback behavior

**Expected:**

- ✅ Falls back to Thai translation
- ✅ No crash or blank display
- ✅ Console warning (optional)

#### Test 4.2: Invalid Role Data

**Test:**

1. Assign role with typo/invalid Thai name
2. Check component doesn't crash

**Expected:**

- ✅ Displays slug key or original text
- ✅ No JavaScript error
- ✅ Game still playable

#### Test 4.3: Fast Language Switching

**Test:**

1. Start game
2. Rapidly switch languages 5 times
3. Check for memory leaks or issues

**Expected:**

- ✅ Translations update correctly
- ✅ No console errors
- ✅ No performance degradation
- ✅ No duplicate loading

#### Test 4.4: Simultaneous Players Different Languages

**Test:**

1. Open app in 2 browsers
2. Browser 1: English
3. Browser 2: Thai
4. Join same room
5. Verify each sees roles in their language

**Expected:**

- ✅ Each player sees own language
- ✅ No interference between players
- ✅ Game logic unaffected

### ✅ 5. Performance Testing

#### Test 5.1: Initial Load Time

**Measure:**

```javascript
// In browser console:
performance.getEntriesByType('resource').filter((r) => r.name.includes('roles.json'));
```

**Expected:**

- ✅ roles.json loads in < 100ms
- ✅ File size ~15KB
- ✅ No blocking during load

#### Test 5.2: Translation Hook Performance

**Test:**

1. Use React DevTools Profiler
2. Switch languages
3. Check re-render count

**Expected:**

- ✅ Only affected components re-render
- ✅ < 16ms per update
- ✅ No unnecessary re-renders

#### Test 5.3: Memory Usage

**Test:**

1. Play 5 games switching languages
2. Check memory in DevTools
3. Look for memory leaks

**Expected:**

- ✅ Memory stable over time
- ✅ No unbounded growth
- ✅ Translations properly garbage collected

### ✅ 6. Dark Mode Testing

**Test:**

1. Enable dark mode
2. Start game and check role displays
3. Verify text contrast/readability
4. Check all 3 components (RoleCard, LocationReference, Browser)

**Expected:**

- ✅ Role text readable in dark mode
- ✅ Proper contrast ratios
- ✅ No white text on white background
- ✅ Colors match design system

### ✅ 7. Mobile Responsiveness

**Test:**

1. Open on mobile device or emulator
2. Portrait and landscape orientations
3. Check role displays

**Expected:**

- ✅ Text size appropriate
- ✅ No horizontal scroll
- ✅ Tap targets >= 44x44px
- ✅ Role grids stack properly

### ✅ 8. Accessibility Testing

**Test with Screen Reader:**

1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate to role displays
3. Verify announced correctly

**Expected:**

- ✅ Role names announced in correct language
- ✅ Grid structure understandable
- ✅ Semantic HTML used

## Known Issues

### Issue 1: Placeholder Translations

**Status:** Expected  
**Impact:** 5 languages (ZH, HI, ES, FR, AR) show Thai text  
**Resolution:** Pending translation service  
**Workaround:** Users can still play, Thai serves as fallback

### Issue 2: 211 English Roles Using Fallback

**Status:** Minor  
**Impact:** Some English roles use slug-to-title conversion  
**Resolution:** Update thai-to-english-roles.js mapping  
**Workaround:** Fallback produces readable names

## Bug Reporting Template

If you find issues, report using this format:

```
**Bug Title:** [Brief description]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Language: [EN/TH/ZH/HI/ES/FR/AR]
- Device: [Desktop/Mobile]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
[Copy/paste any errors]
```

## Testing Completion Criteria

All tests pass when:

- ✅ No JavaScript errors in console
- ✅ English roles display correctly (382/382)
- ✅ Thai roles display correctly (382/382)
- ✅ Placeholder languages work (show Thai)
- ✅ All 3 components (RoleCard, LocationReference, Browser) work
- ✅ Language switching updates roles
- ✅ Dark mode works
- ✅ Mobile responsive
- ✅ No performance issues
- ✅ No accessibility blockers

## Next Steps After Testing

1. **If tests pass:** Mark User Story 3 as complete ✅
2. **If issues found:** Log bugs and fix before proceeding
3. **Translation service:** Arrange for ZH/HI/ES/FR/AR translations
4. **Move to User Story 4:** Complete UI translations

## Testing Tools

### Recommended Browser Extensions

- React Developer Tools
- Redux DevTools (if using)
- Lighthouse (for performance)
- axe DevTools (for accessibility)

### Useful Commands

```bash
# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Build for production (test tree-shaking)
npm run build

# Analyze bundle size
npm run analyze
```

## Contact

**Feature Lead:** GitHub Copilot  
**Testing:** User  
**Questions:** Review USER_STORY_3_COMPLETION.md

---

**Last Updated:** 2025-10-30  
**Version:** 1.0  
**Status:** Ready for Testing ✅
