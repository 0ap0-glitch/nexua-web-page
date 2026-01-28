# NEXUS Project TODO

## Phase 1: Database Schema & Core Models
- [x] Design and implement pages table (user pages with visibility controls)
- [x] Design and implement widgets table (widget instances with positions and configs)
- [x] Design and implement communities table (interest-based communities)
- [x] Design and implement community_members table (membership with roles)
- [x] Design and implement posts table (community posts and feeds)
- [x] Design and implement connections table (user connections without clout metrics)
- [x] Design and implement ai_companions table (customizable AI avatars)
- [x] Design and implement feature_flags table (server-side evolution system)
- [x] Design and implement events table (community events)
- [x] Push database schema with migrations

## Phase 2: User Authentication & Profile System
- [x] Extend user profile with bio, avatar, preferences
- [x] Create user profile management procedures
- [ ] Build user profile page UI
- [ ] Implement profile editing functionality
- [ ] Add role-based access control helpers

## Phase 3: Widget System & Page Management
- [ ] Create widget type definitions and configurations
- [ ] Implement page CRUD procedures (create, read, update, delete)
- [ ] Implement widget CRUD procedures
- [ ] Build page management UI (create, edit, delete pages)
- [ ] Build widget grid layout system with drag-and-drop
- [ ] Create widget library/catalog UI
- [ ] Implement widget rendering engine
- [ ] Add visibility controls for pages

## Phase 4: AI Companion System
- [ ] Design AI companion avatar types and voice modes
- [ ] Create AI companion configuration procedures
- [ ] Implement AI chat/interaction backend with LLM integration
- [ ] Build AI companion widget UI
- [ ] Create avatar customization interface
- [ ] Implement contextual onboarding system
- [ ] Add voice mode controls (speak/guide/mute)

## Phase 5: Community Architecture
- [ ] Create community CRUD procedures
- [ ] Implement community membership management
- [ ] Build community discovery system (AI-powered)
- [ ] Create forum/discussion thread system
- [ ] Implement post creation and feed display
- [ ] Add community visibility controls
- [ ] Build community management UI
- [ ] Create community browse/search interface

## Phase 6: Social Features (Clout-Free)
- [ ] Implement connection request system
- [ ] Create AI-powered user discovery (compatibility-based)
- [ ] Build private messaging system
- [ ] Implement activity feeds (without public metrics)
- [ ] Add content interaction system (private reactions)
- [ ] Create user discovery UI

## Phase 7: Events & Live Features
- [ ] Design events table and procedures
- [ ] Implement event CRUD operations
- [ ] Build event calendar widget
- [ ] Create event detail pages
- [ ] Add RSVP system

## Phase 8: Feature Flag System
- [ ] Create feature flag management procedures
- [ ] Build admin feature flag control panel
- [ ] Implement feature flag evaluation logic
- [ ] Add user-level feature preferences
- [ ] Create A/B testing framework

## Phase 9: Frontend Design & Polish
- [ ] Choose design language and color palette
- [ ] Create global theme and typography system
- [ ] Design landing page
- [ ] Build authentication flow UI
- [ ] Polish all component styling
- [ ] Add animations and micro-interactions
- [ ] Implement responsive design for all pages

## Phase 10: Testing & Deployment
- [ ] Write unit tests for all procedures
- [ ] Test widget system thoroughly
- [ ] Test AI companion interactions
- [ ] Test community features
- [ ] Configure GitHub integration
- [ ] Create deployment checkpoint
- [ ] Deploy to production

## Phase 11: Enhanced Community Features (Discussion Threads & Custom Spaces)
- [x] Design threaded discussion system (replies, nested comments)
- [x] Implement discussion thread CRUD operations)
- [x] Build thread reply system with depth limits
- [x] Add reaction system for posts and replies
- [x] Create community space customization (custom widgets per community)
- [x] Implement community widget templates
- [ ] Build community space editor UI
- [ ] Add community roles and permissions (who can add widgets, moderate)
- [x] Create discussion thread UI with collapsible replies
- [ ] Implement real-time updates for discussions
- [ ] Add notification system for thread replies
- [ ] Build community templates (fan club, workshop, professional network, study group)
- [x] Create community discovery with category filters
- [ ] Add pinned posts and announcements widget
- [ ] Implement community polls widget
- [ ] Create member spotlight widget
- [ ] Add community resources/links widget
- [ ] Build workshop/event scheduling within communities
- [ ] Implement fan interaction features (Q&A, AMAs)
- [ ] Add content drops system for creators


## Phase 12: Vercel Serverless Conversion

- [ ] Set up external database (PlanetScale or Neon)
- [ ] Convert Express server to Vercel serverless API routes
- [ ] Update tRPC adapter for serverless functions
- [ ] Configure environment variables for Vercel
- [ ] Update build scripts for Vercel deployment
- [ ] Configure vercel.json properly
- [ ] Test serverless functions locally
- [ ] Deploy and verify on Vercel
- [ ] Update authentication flow for serverless
- [ ] Verify database connections work in serverless environment


## Phase 13: Vercel Deployment (No AI)

- [x] Remove AI companion table and references
- [x] Remove AI companion widget type
- [x] Remove AI companion routes from backend
- [x] Remove AI companion UI components
- [x] Configure Neon PostgreSQL connection
- [x] Update database schema for PostgreSQL
- [ ] Create Vercel API routes structure
- [ ] Configure vercel.json for serverless
- [ ] Set up environment variables in Vercel
- [ ] Push to GitHub
- [ ] Verify Vercel deployment
