/**
 * Widget type definitions for NEXUS platform
 * Each widget type has specific configuration options
 */

export type WidgetType =
  | "ai-companion"
  | "community-feed"
  | "community-list"
  | "calendar"
  | "notes"
  | "connections"
  | "events"
  | "profile-card"
  | "quick-actions"
  | "stats";

export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

export interface BaseWidgetConfig {
  title?: string;
  refreshInterval?: number; // in seconds
}

export interface AiCompanionWidgetConfig extends BaseWidgetConfig {
  showAvatar: boolean;
  voiceEnabled: boolean;
  position: "floating" | "embedded";
}

export interface CommunityFeedWidgetConfig extends BaseWidgetConfig {
  communityId: number;
  postLimit: number;
  showImages: boolean;
}

export interface CommunityListWidgetConfig extends BaseWidgetConfig {
  filter: "all" | "joined" | "recommended";
  limit: number;
}

export interface CalendarWidgetConfig extends BaseWidgetConfig {
  view: "month" | "week" | "day";
  showEvents: boolean;
}

export interface NotesWidgetConfig extends BaseWidgetConfig {
  noteId?: number;
  editable: boolean;
}

export interface ConnectionsWidgetConfig extends BaseWidgetConfig {
  view: "grid" | "list";
  limit: number;
}

export interface EventsWidgetConfig extends BaseWidgetConfig {
  communityId?: number;
  timeRange: "upcoming" | "past" | "all";
  limit: number;
}

export interface ProfileCardWidgetConfig extends BaseWidgetConfig {
  userId?: number; // if not set, shows current user
  showBio: boolean;
  showStats: boolean;
}

export interface QuickActionsWidgetConfig extends BaseWidgetConfig {
  actions: Array<{
    label: string;
    icon: string;
    action: string;
  }>;
}

export interface StatsWidgetConfig extends BaseWidgetConfig {
  metrics: Array<"communities" | "connections" | "posts" | "events">;
}

export type WidgetConfig =
  | AiCompanionWidgetConfig
  | CommunityFeedWidgetConfig
  | CommunityListWidgetConfig
  | CalendarWidgetConfig
  | NotesWidgetConfig
  | ConnectionsWidgetConfig
  | EventsWidgetConfig
  | ProfileCardWidgetConfig
  | QuickActionsWidgetConfig
  | StatsWidgetConfig;

/**
 * Widget metadata for the widget library
 */
export interface WidgetMetadata {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  category: "ai" | "social" | "productivity" | "content";
}

export const WIDGET_CATALOG: WidgetMetadata[] = [
  {
    type: "ai-companion",
    name: "AI Companion",
    description: "Your personal AI assistant NEX",
    icon: "bot",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    category: "ai",
  },
  {
    type: "community-feed",
    name: "Community Feed",
    description: "Latest posts from a community",
    icon: "rss",
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    category: "social",
  },
  {
    type: "community-list",
    name: "Communities",
    description: "Browse and discover communities",
    icon: "users",
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    category: "social",
  },
  {
    type: "calendar",
    name: "Calendar",
    description: "View events and schedule",
    icon: "calendar",
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    category: "productivity",
  },
  {
    type: "notes",
    name: "Notes",
    description: "Quick notes and ideas",
    icon: "sticky-note",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    category: "productivity",
  },
  {
    type: "connections",
    name: "Connections",
    description: "Your network of connections",
    icon: "link",
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    category: "social",
  },
  {
    type: "events",
    name: "Events",
    description: "Upcoming events",
    icon: "calendar-days",
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    category: "content",
  },
  {
    type: "profile-card",
    name: "Profile Card",
    description: "User profile summary",
    icon: "user",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    category: "social",
  },
  {
    type: "quick-actions",
    name: "Quick Actions",
    description: "Frequently used actions",
    icon: "zap",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 2 },
    category: "productivity",
  },
  {
    type: "stats",
    name: "Stats",
    description: "Your activity statistics",
    icon: "bar-chart",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 1 },
    category: "content",
  },
];
