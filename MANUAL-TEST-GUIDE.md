# Manual Testing Guide - 403 Fix

## Quick Testing Steps

### 1. Prerequisites
- Login as a therapist user in the app
- Have developer console open (for web) or debugging enabled (for mobile)

### 2. Test Availability Loading
1. **Navigate**: Settings → Therapist Availability
2. **Expected**: Screen loads without errors
3. **Check logs**: Look for these success patterns:
   ```
   📅 Starting getTherapistAvailability...
   🔍 Using validated therapist profile ID: X
   ✅ Retrieved therapist availability successfully
   ```

### 3. Test Availability Saving
1. **Make changes**: Add/remove time slots or update video link
2. **Save**: Tap save button
3. **Expected**: Changes save without errors
4. **Check logs**: Look for:
   ```
   📝 Starting updateTherapistAvailability...
   ✅ Updated therapist availability successfully
   ```

### 4. If You See 403 Errors
This is **EXPECTED** in the logs now - look for the fallback recovery:
```
❌ Error fetching therapist availability: 403
🔄 403 error detected, trying fallback validation...
✅ Fallback availability fetch successful
```

### 5. Success Indicators
- ✅ Availability screen loads
- ✅ Can view existing availability
- ✅ Can save changes
- ✅ No user-facing error messages
- ✅ Console shows successful operations (possibly via fallback)

### 6. Failure Indicators (Need further investigation)
- ❌ Screen shows error message to user
- ❌ Cannot load availability at all
- ❌ Console shows repeated 403s with no fallback success
- ❌ Console shows: "❌ Fallback validation also failed"

### 7. If Issues Persist
1. **Copy console logs** (especially error details)
2. **Note user details**: user ID, user type, profile ID
3. **Check backend**: May need backend permission investigation
4. **Temporary workaround**: Use the debug helper script to identify correct profile ID

---

**Quick Test Result Expected**: Therapist availability screen works normally, even if console shows some 403 errors being automatically recovered via fallback mechanisms.
