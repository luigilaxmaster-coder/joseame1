# Profile Module Integration Guide

## Overview
This document outlines the complete end-to-end integration of the profile module with real authentication, database persistence, and API endpoints.

## Architecture

### Frontend
- **useMyProfile Hook** (`/src/hooks/useMyProfile.ts`)
  - Manages profile state with real API calls
  - Handles profile fetching, updating, and avatar uploads
  - Provides loading and error states
  - No TanStack Query dependency (uses native React hooks)

- **Safe JSON Fetch** (`/src/lib/safe-json-fetch.ts`)
  - Utility for safe JSON parsing and error handling
  - Prevents JSON parsing errors
  - Provides consistent error responses
  - Supports FormData for file uploads

- **ProfilePageRefactored** (`/src/components/pages/ProfilePageRefactored.tsx`)
  - Refactored profile page using real data
  - Integrates useMyProfile hook
  - Displays authenticated user data
  - Handles profile editing and avatar uploads

### Backend
- **GET /api/me/profile** (`/src/pages/api/me/profile.ts`)
  - Fetches authenticated user's profile
  - Auto-creates profile if it doesn't exist
  - Returns UserProfiles entity

- **PATCH /api/me/profile** (`/src/pages/api/me/profile.ts`)
  - Updates authenticated user's profile
  - Validates input data
  - Persists changes to database

- **POST /api/me/avatar** (`/src/pages/api/me/avatar.ts`)
  - Uploads and persists user avatar
  - Validates file type and size
  - Updates profile with new avatar URL

### Database
- **userprofiles Collection**
  - Stores user profile data
  - Fields: _id, memberId, firstName, lastName, bio, profilePhoto, updatedAt
  - Indexed by memberId for fast lookups

## Data Flow

### Profile Loading
```
1. User navigates to /profile
2. MemberProtectedRoute checks authentication
3. ProfilePageRefactored mounts
4. useMyProfile hook fetches profile via GET /api/me/profile
5. API validates member ID from request headers
6. Database query finds profile by memberId
7. If not found, auto-creates new profile
8. Profile data displayed in UI
9. Page reload: data persists from database
```

### Profile Editing
```
1. User clicks "Editar Perfil"
2. Edit form displays with current data
3. User modifies fields (firstName, lastName, bio, etc.)
4. User clicks "Guardar"
5. updateProfile() calls PATCH /api/me/profile
6. API validates member ID and input data
7. Database updates profile record
8. UI updates with new data
9. Page reload: changes persist
```

### Avatar Upload
```
1. User clicks camera icon on avatar
2. File input opens
3. User selects image file
4. handleAvatarSelect() validates file
5. Preview displayed
6. User clicks "Confirmar Avatar"
7. uploadAvatar() calls POST /api/me/avatar with FormData
8. API validates file (type, size)
9. File processed and stored
10. Profile updated with new avatar URL
11. UI updates with new avatar
12. Page reload: avatar persists
```

## Key Features

### Real Authentication
- Uses `x-member-id` header from authenticated user
- Validates member ID on every API call
- Prevents unauthorized access

### Automatic Profile Creation
- If user doesn't have a profile, it's auto-created on first access
- Ensures every authenticated user has a profile record
- No manual setup required

### Persistent Data
- All changes saved to database
- Survives page reloads
- No local state or mocks

### Error Handling
- Safe JSON parsing prevents crashes
- Comprehensive error messages
- Graceful fallbacks

### File Upload Validation
- File type validation (JPEG, PNG, GIF, WebP)
- File size validation (max 10MB)
- Preview before upload

## Testing Checklist

### Profile Loading
- [ ] Login with valid credentials
- [ ] Navigate to /profile
- [ ] Profile data loads correctly
- [ ] Reload page - data persists
- [ ] Logout and login again - data still there

### Profile Editing
- [ ] Click "Editar Perfil"
- [ ] Edit firstName, lastName, bio
- [ ] Click "Guardar"
- [ ] Data updates in UI
- [ ] Reload page - changes persist
- [ ] Edit again - previous changes are there

### Avatar Upload
- [ ] Click camera icon
- [ ] Select image file
- [ ] Preview displays
- [ ] Click "Confirmar Avatar"
- [ ] Avatar updates in UI
- [ ] Reload page - avatar persists
- [ ] Upload different avatar - replaces previous

### Error Handling
- [ ] Try uploading invalid file type - error message
- [ ] Try uploading file > 10MB - error message
- [ ] Network error - graceful error handling
- [ ] Invalid JSON response - safe parsing

### Joseador-Specific Fields
- [ ] Edit phoneNumber, cityZone, mainCategory, etc.
- [ ] Changes persist after reload
- [ ] Fields only show for joseador role

## API Response Examples

### GET /api/me/profile (Success)
```json
{
  "_id": "uuid-123",
  "memberId": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "bio": "Professional service provider",
  "profilePhoto": "https://...",
  "updatedAt": "2024-07-06T12:00:00Z"
}
```

### PATCH /api/me/profile (Success)
```json
{
  "_id": "uuid-123",
  "memberId": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "bio": "Updated bio",
  "profilePhoto": "https://...",
  "updatedAt": "2024-07-06T12:30:00Z"
}
```

### POST /api/me/avatar (Success)
```json
{
  "success": true,
  "url": "data:image/jpeg;base64,...",
  "profile": {
    "_id": "uuid-123",
    "memberId": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "bio": "Professional service provider",
    "profilePhoto": "data:image/jpeg;base64,...",
    "updatedAt": "2024-07-06T12:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": "Failed to update profile",
  "details": "Profile not found"
}
```

## Troubleshooting

### Profile not loading
- Check browser console for errors
- Verify user is authenticated (check member ID)
- Check API endpoint is accessible
- Verify database connection

### Changes not persisting
- Check API response status (should be 200/201)
- Verify database write permissions
- Check for JSON parsing errors
- Verify member ID is being sent correctly

### Avatar not uploading
- Check file type (must be JPEG, PNG, GIF, or WebP)
- Check file size (must be < 10MB)
- Check API response for errors
- Verify FormData is being sent correctly

### JSON parsing errors
- Check API response Content-Type header
- Verify response is valid JSON
- Check for HTML error pages in response
- Use browser DevTools Network tab to inspect response

## Future Improvements

1. **Cloud Storage Integration**
   - Replace base64 data URLs with cloud storage (AWS S3, Cloudinary, etc.)
   - Improves performance and scalability

2. **Image Optimization**
   - Compress images before upload
   - Generate thumbnails
   - Serve optimized sizes

3. **Profile Validation**
   - Add field-level validation
   - Implement profile completeness scoring
   - Suggest missing fields

4. **Audit Trail**
   - Log all profile changes
   - Track who made changes and when
   - Provide change history

5. **Real-time Updates**
   - WebSocket integration for live updates
   - Notify other users of profile changes
   - Real-time collaboration features

## Files Modified

- `/src/hooks/useMyProfile.ts` - New hook for profile management
- `/src/lib/safe-json-fetch.ts` - New utility for safe JSON fetching
- `/src/pages/api/me/profile.ts` - New API endpoint for profile
- `/src/pages/api/me/avatar.ts` - New API endpoint for avatar
- `/src/components/pages/ProfilePageRefactored.tsx` - Refactored profile page
- `/src/components/Router.tsx` - Updated to use refactored profile page

## Notes

- All profile data is tied to authenticated user's email (memberId)
- Profile auto-creation ensures no errors on first access
- Safe JSON fetch prevents parsing errors from breaking the app
- Avatar uploads use base64 encoding (can be replaced with cloud storage)
- All changes are immediately persisted to database
- No local state or mocks - everything is real data
