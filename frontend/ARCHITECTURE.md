# MGX Frontend Architecture

## Functional Architecture Overview

```
<DashboardLayout>
  ├── GlobalNav  (route tabs, kebab, etc.)
  ├── WorkspaceHead
  │     ├── TeamRibbon      ← context switch (who "owns" the current tab)
  │     └── QuotaBar        ← bind to /quota endpoint, updates every 30s
  └── FlexRow (h-100%)
        ├── TaskSidebar
        │     ├── TaskBrief ← markdown rendered
        │     ├── QuotaNotice (optional)
        │     └── TaskFooter ← Continue / Remix
        ├── AppCanvas (flex‑1)
        │     ├── route / viewer → <SandboxViewport/>
        │     ├── route / editor → <SplitPane FileTree|Editor>
        │     └── empty → <EmptyState/>
        └── UtilityRail (vertical icon bar)
              ├── Screen   – toggles AppCanvas -> Sandbox viewport
              ├── Files    – opens FileTree in left pane
              ├── Console  – opens log overlay
              ├── Notes    – opens markdown pad
              └── Storage  – S3 browser
```

## State Flow

### Team Context
- `TeamRibbon` sets `activeMemberId` in context
- `AppCanvas` asks the sandbox service for that member's "computer"
- Each team member has their own isolated workspace

### Quota Management
- `QuotaBar` subscribes to `/api/quota` SSE and updates bar + triggers `QuotaNotice`
- Updates every 30 seconds automatically
- Shows daily/monthly usage with visual progress indicator
- Triggers quota exceeded notice when limits are reached

### Task Actions
- `Continue` posts `POST /api/chat/:id/unpause` and closes the notice
- `Remix` posts `/remix` which forks the chat and opens it in a new tab
- Both buttons are disabled when quota is exceeded

### Navigation & Routing
- UtilityRail buttons push local routes (`/viewer`, `/files`, `/console`, …)
- The rail listens to `useLocation()` and sets `data-active` for visual feedback
- Each route corresponds to a different AppCanvas view mode

## Component Responsibilities

### DashboardLayout
- **Purpose**: Main layout shell that provides structure
- **Props**: `children` (React Router routes)
- **State**: None (pure layout component)
- **Styling**: Uses gradient backgrounds for depth

### WorkspaceHead
- **Purpose**: Shows team context and quota status
- **Components**: TeamRibbon + QuotaBar
- **State**: Quota data from API
- **Updates**: Every 30 seconds via SSE

### TaskSidebar
- **Purpose**: Shows current task and action buttons
- **Content**: Markdown-rendered task description
- **Actions**: Continue/Remix buttons
- **State**: Task data, quota exceeded status

### AppCanvas
- **Purpose**: Main workspace area
- **Modes**: Empty state, Sandbox viewport, Split-pane editor
- **Routing**: Controlled by React Router
- **State**: Current view mode, file tree, editor content

### UtilityRail
- **Purpose**: Tool navigation and context switching
- **Tools**: Terminal, Planner, App Viewer, Editor, Files
- **State**: Active tool, hover states
- **Visual**: Active state with glow effect

## Visual Design System

### Gradients
- **Header**: `bg-header-grad` - Subtle vertical fade from mgx-800 to mgx-900
- **Body**: `bg-body-grad` - Main background gradient from mgx-900 to mgx-700
- **Panel**: `bg-panel-grad` - Sidebar gradient from mgx-800 to mgx-900

### Colors
- **Primary**: `#2271ff` (blue) for active states and CTAs
- **Warning**: `#facc15` (yellow) for quota exceeded states
- **MGX Palette**: 900 (#0d1117), 800 (#111621), 700 (#161b22)

### Interactive States
- **Hover**: Darken background, lighten text
- **Active**: Primary color background with glow effect
- **Disabled**: Reduced opacity and contrast
- **Focus**: Ring outline for accessibility

## API Integration Points

### Quota Endpoint
```typescript
// GET /api/quota
interface QuotaResponse {
  daily: { used: number; max: number };
  monthly: { used: number; max: number };
  refreshAt: string;
}
```

### Chat Actions
```typescript
// POST /api/chat/:id/unpause
// POST /api/chat/remix
interface ChatAction {
  chatId: string;
  action: 'unpause' | 'remix';
}
```

### Sandbox Service
```typescript
// GET /api/sandbox/:memberId
interface SandboxState {
  memberId: string;
  status: 'starting' | 'ready' | 'error';
  viewport?: string;
}
```

## Performance Considerations

### Memoization
- TeamRibbon members list is memoized
- QuotaBar updates are throttled to 30s
- Button components use React.memo for stable renders

### Lazy Loading
- AppCanvas views are code-split by route
- File tree loads on demand
- Editor components load when needed

### State Management
- Local state for UI interactions
- Context for team member selection
- SSE for real-time quota updates

## Accessibility Features

### Keyboard Navigation
- Focus rings on all interactive elements
- Tab order follows visual layout
- Escape key closes modals/overlays

### Screen Reader Support
- Proper ARIA labels on all buttons
- Semantic HTML structure
- Status announcements for quota changes

### Color Contrast
- All text meets WCAG AA standards
- Disabled states maintain readability
- High contrast mode support

## Testing Strategy

### Visual Regression
- Storybook stories for all gradient components
- Chromatic for visual baseline tracking
- Responsive breakpoint testing

### Component Testing
- Unit tests for state management
- Integration tests for API calls
- E2E tests for user workflows

### Performance Testing
- Bundle size monitoring
- Lighthouse CI for performance scores
- Memory leak detection

## Future Enhancements

### Planned Features
- Real-time collaboration indicators
- Advanced file tree with search
- Custom theme support
- Offline mode with sync

### Technical Debt
- Migrate to React Query for data fetching
- Add error boundaries for better UX
- Implement proper loading states
- Add comprehensive logging 