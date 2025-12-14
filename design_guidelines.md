# STROT Platform Design Guidelines

## Design Approach
**Selected System**: Apple-like Minimalism with humanitarian warmth  
**Justification**: The platform serves users with varying digital literacy levels, requiring clarity and accessibility while maintaining dignity and trust for vulnerable communities.

## Core Design Principles
1. **Clarity Over Complexity**: Every interaction must be immediately understandable
2. **Dignity-Centered Design**: Respectful presentation of community members and their stories
3. **Trust Through Transparency**: Visual feedback at every step to build confidence
4. **Mobile-First**: Optimized for low-end 4G devices with efficient data usage

## Typography
**Font Stack**: 
- Primary: 'Inter' or 'SF Pro Display' via Google Fonts
- Headings: font-semibold (600 weight)
- Body: font-normal (400 weight)
- Labels: font-medium (500 weight)

**Hierarchy**:
- Page titles: text-3xl (desktop), text-2xl (mobile)
- Section headings: text-xl
- Card titles: text-lg
- Body text: text-base
- Captions/metadata: text-sm
- Labels: text-xs uppercase tracking-wide

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Page margins: px-4 (mobile), px-8 (tablet), px-16 (desktop)
- Vertical rhythm: space-y-6 for content sections

**Container Strategy**:
- Max width: max-w-7xl for dashboards
- Cards: max-w-sm to max-w-md
- Forms: max-w-lg centered
- Full-width sections with inner containers

**Grid Layouts**:
- Donation cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard widgets: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3
- Worker profiles: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Mobile: Always single column for form inputs

## Component Library

### Cards
- Background: white (bg-white)
- Border: 1px solid with soft gray (border border-gray-200)
- Border radius: rounded-xl (12px)
- Shadow: shadow-sm with hover:shadow-md transition
- Padding: p-6
- Interactive cards: cursor-pointer with scale-on-hover (hover:scale-[1.02])

### Buttons
- Primary: Full rounded (rounded-full), medium padding (px-6 py-3)
- Secondary: Outlined with rounded-full, same padding
- Disabled state: opacity-50 cursor-not-allowed
- Icon buttons: Square aspect ratio, rounded-lg, p-3

### Status Badges
- Pending: soft orange background with orange text
- Claimed: soft blue background with blue text
- Delivered/Completed: soft green background with green text
- Rejected: soft red background with red text
- Compact size: text-xs px-3 py-1 rounded-full font-medium

### Navigation
**Desktop**: Sidebar (w-64) with logo at top, navigation items with icons
**Mobile**: Fixed bottom navbar (h-16) with 4-5 core actions, safe area padding

### Forms
- Input fields: rounded-lg border border-gray-300 p-3 with focus ring
- Labels: text-sm font-medium mb-2 block
- Helper text: text-xs text-gray-500 mt-1
- File upload: Dashed border dropzone with drag-and-drop visual feedback
- Form groups: space-y-4

### Image Displays
- Profile photos: Circular (rounded-full) with border
- Donation items: Aspect ratio 4:3, rounded-lg, object-cover
- Proof photos: Full width in modal with zoom capability
- Worker profile photos: Aspect ratio 3:4, rounded-lg with subtle border

### Data Display
- Stats cards: Large number (text-3xl font-bold), small label (text-sm text-gray-500)
- Lists: Divide-y divide-gray-200, py-3 spacing
- Tables: Simple with hover row highlighting, sticky header on scroll

### Modals & Sheets
- Desktop: Center modal with backdrop blur
- Mobile: Bottom sheet slide-up with rounded top corners (rounded-t-3xl)
- Close button: Top-right, accessible tap target (min 44x44px)

### Loading States
- Skeleton loaders: Animate pulse with gray-200 background
- Full-page loading: Centered spinner with platform logo
- Inline loading: Small spinner with text

## Dashboard Layouts

### Community Head Dashboard
- Hero stats bar: 3-4 key metrics in horizontal card row
- Tab navigation: Sticky below stats for Donations, Jobs, Workers, Workshops
- Activity feed: Chronological list with type-specific icons
- Quick actions: Floating action button (bottom-right) for common tasks

### Donor Dashboard
- Donation history: Timeline view with status badges
- Quick donate: Prominent card at top with camera icon
- Impact summary: Visual stats showing total donations delivered

### Business Dashboard
- Active job postings: Card grid with applicant count
- Worker matches: Horizontal scrollable carousel
- Hiring pipeline: Kanban-style columns (Posted → Matched → Confirmed)

## Images
**Hero Images**: Not applicable - this is a dashboard/utility application  
**Donation Item Photos**: User-uploaded, displayed in 4:3 aspect ratio cards  
**Worker Profile Photos**: Professional-style portraits in 3:4 aspect ratio  
**Proof of Delivery**: Full-resolution modal view with timestamp overlay  
**Workshop Photos**: Optional banner images in 16:9 aspect ratio  
**Empty States**: Use simple illustrations (not photos) with encouraging messaging

## Accessibility & Safety
- Minimum touch target: 44x44px for all interactive elements
- Form labels: Always visible, never placeholder-only
- Error states: Clear error messages in red-600 with icons
- Success feedback: Green-600 with checkmark icons
- Phone number masking: Show only last 4 digits (XXXX-XXX-1234)
- High contrast: All text meets WCAG AA standards

## Responsive Breakpoints
- Mobile: 0-640px (base)
- Tablet: 640-1024px (md)
- Desktop: 1024px+ (lg, xl)

## Performance Optimizations
- Lazy load images below fold
- Progressive image loading with blur-up placeholders
- Virtualized lists for large datasets (worker profiles, donation history)
- Optimistic UI updates with rollback on error