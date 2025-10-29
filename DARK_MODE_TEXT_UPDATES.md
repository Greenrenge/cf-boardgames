# Dark Mode Text Color Updates

This document tracks all the text color updates needed for proper dark mode readability.

## Completed Updates

### ✅ Homepage (`app/page.tsx`)

- All text colors have dark mode variants

### ✅ Lobby Component (Partial - `components/room/Lobby.tsx`)

- Title and room code: `dark:text-gray-100`
- Room code background: `dark:bg-slate-700`
- Copy button: `dark:text-gray-400` hover `dark:hover:text-gray-100`

## Needed Updates

### Components to Update:

1. **Lobby.tsx** - Continue adding dark mode to:
   - All `text-gray-600` → add `dark:text-gray-400`
   - All `text-gray-700` → add `dark:text-gray-300`
   - All `text-gray-900` → add `dark:text-gray-100`
   - All `text-gray-500` → add `dark:text-gray-400`
   - Border colors: `border-gray-200` → add `dark:border-slate-700`
   - Background colors: `bg-gray-100` → add `dark:bg-slate-700`

2. **LocationReference.tsx**
3. **ResultsScreen.tsx**
4. **GameTimer.tsx**
5. **ChatPanel.tsx**
6. **VotingInterface.tsx**
7. **RoleCard.tsx**
8. **SpyGuess.tsx**
9. **PlayerList.tsx**
10. **CreateRoom.tsx**
11. **JoinRoom.tsx**

## Color Mapping Guide

Light Mode → Dark Mode:

- `text-gray-900` → `dark:text-gray-100`
- `text-gray-800` → `dark:text-gray-200`
- `text-gray-700` → `dark:text-gray-300`
- `text-gray-600` → `dark:text-gray-400`
- `text-gray-500` → `dark:text-gray-400`
- `text-blue-600` → `dark:text-blue-400`
- `text-indigo-600` → `dark:text-indigo-400`
- `text-red-600` → `dark:text-red-400`
- `text-green-600` → `dark:text-green-400`
- `text-orange-600` → `dark:text-orange-400`
- `bg-gray-100` → `dark:bg-slate-700`
- `bg-gray-50` → `dark:bg-slate-800`
- `border-gray-200` → `dark:border-slate-700`
- `border-gray-300` → `dark:border-slate-600`
