# Implementation Plan: Location Images & Player Scaling

**Branch**: `003-location-images-scaling` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-location-images-scaling/spec.md`

## Summary

This feature enhances the Spyfall game with proper location image display and expanded player capacity. Non-spy players will see their assigned location image at 3:2 aspect ratio full width, while spy players can browse all location images in a scrollable grid. The system will support 4-20 players (up from current 10) with configurable spy count (1-3 spies).

**Technical Approach**: Extend existing Next.js frontend with responsive image components and update Cloudflare Workers Durable Objects to handle increased player capacity and multi-spy logic. Images are already hosted on Cloudflare R2, requiring only frontend display enhancements and backend role assignment logic updates.

## Technical Context

**Language/Version**: TypeScript 5 (Next.js 14.2.16 frontend, Cloudflare Workers backend)  
**Primary Dependencies**: React 18.3, Next.js 14, Hono 4.10 (backend API), Tailwind CSS 3.4  
**Storage**: Cloudflare Durable Objects (room/player state), Cloudflare R2 (location images), D1 (locations data)  
**Testing**: Playground-based validation (no test framework configured)  
**Target Platform**: Cloudflare Pages (frontend), Cloudflare Workers (backend Durable Objects)  
**Project Type**: Web application (Next.js frontend + Workers backend)  
**Performance Goals**: 60fps scrolling for spy image browser, <2s image load on 4G, support 20 concurrent players per room  
**Constraints**: Images must maintain 3:2 ratio across all devices (320px-2560px width), lazy loading for 70+ images  
**Scale/Scope**: 70+ location images, 4-20 players per room, 1-3 configurable spies

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Do Less, Get Works**: Feature solves immediate problem (display images, scale players) without speculative features
- [x] **Playground Over Tests**: Plan includes interactive demo in actual game room (P1-P5 user stories validate via manual play)
- [x] **Declarative Style**: Image display uses React components with props, role assignment driven by configuration data
- [x] **Consistent Code Style**: Prettier already configured in package.json with format script
- [x] **Readability First**: Component names clear (LocationImage, SpyLocationBrowser), backend logic extracted to pure functions

_All principles met - no complexity tracking needed._

## Project Structure

### Documentation (this feature)

```text
specs/003-location-images-scaling/
├── plan.md              # This file
├── research.md          # Phase 0: Image optimization, lazy loading patterns
├── data-model.md        # Phase 1: Room config, player capacity, spy config entities
├── quickstart.md        # Phase 1: How to configure and test new features
├── playground/          # Working demos
│   └── story1/          # P1: Non-spy image display demo
│   └── story2/          # P2: Spy image browser demo
│   └── story3/          # P3: Player capacity config demo
├── contracts/           # Phase 1: WebSocket message contracts for new features
│   ├── websocket.md     # Updated message types for capacity/spy config
│   └── http-api.md      # Room config endpoints
└── checklists/
    └── requirements.md  # Quality validation (already complete)
```

### Source Code (repository root)

```text
# Web Application Structure (Next.js + Cloudflare Workers)

# Frontend (Next.js on Cloudflare Pages)
app/
├── (game)/
│   └── room/
│       └── [code]/
│           └── page.tsx           # MODIFY: Add image display and config UI
components/
├── game/
│   ├── LocationImage.tsx          # NEW: 3:2 ratio image component
│   ├── SpyLocationBrowser.tsx     # NEW: Scrollable location grid for spy
│   ├── RoleCard.tsx               # MODIFY: Integrate LocationImage
│   └── GameTimer.tsx              # (existing, no changes)
├── room/
│   ├── Lobby.tsx                  # MODIFY: Add player capacity and spy count controls
│   ├── PlayerList.tsx             # MODIFY: Show current/max capacity
│   └── CreateRoom.tsx             # MODIFY: Add configuration options
└── ui/
    └── (existing UI components)

# Backend (Cloudflare Workers Durable Objects)
workers/src/
├── durable-objects/
│   └── GameRoom.ts                # MODIFY: Increase max players, multi-spy logic
├── models/
│   ├── Room.ts                    # MODIFY: Add maxPlayers, spyCount fields
│   ├── Player.ts                  # (existing, minimal changes)
│   └── GameState.ts               # MODIFY: Multi-spy role assignment
└── index.ts                       # (existing API routes, minimal changes)

# Shared Types
lib/
└── types.ts                       # MODIFY: Add RoomConfig, SpyConfig types

# Data
data/
└── locations.json                 # (existing, already has imageUrl for 70+ locations)
```

**Structure Decision**: Using existing web application structure (Next.js frontend + Workers backend). No new directories needed - all changes are modifications or new files within existing structure. Image assets already hosted on Cloudflare R2 (referenced in locations.json), so no asset migration required.

## Complexity Tracking

No violations - all constitution principles met. Feature uses simple, declarative patterns with existing architecture.
