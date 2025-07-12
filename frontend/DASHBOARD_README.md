# Dashboard Layout with DaisyUI

This project now includes a comprehensive dashboard layout built with DaisyUI components. The layout provides a modern, responsive sidebar navigation with a clean design.

## Components Created

### 1. DashboardLayout.vue
A reusable layout component that provides:
- **Responsive Sidebar**: Collapsible on mobile, always visible on desktop
- **Top Navigation Bar**: With hamburger menu for mobile and user dropdown
- **Navigation Menu**: With icons, badges, and active states
- **Quick Actions**: Common actions in the sidebar
- **User Profile Dropdown**: With logout functionality

### 2. DashboardPage.vue
A sample dashboard page showcasing:
- **Stats Cards**: Using DaisyUI's `stat` component
- **Activity Feed**: Recent activities with icons
- **Progress Bars**: Project progress tracking
- **Team Members**: User avatars and status
- **Quick Actions**: Common dashboard actions
- **File Management**: Recent files section

## How to Use

### Basic Usage
```vue
<script setup>
import DashboardLayout from '@/components/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout>
    <!-- Your page content here -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">Your Content</h2>
        <p>This is your page content wrapped in the dashboard layout.</p>
      </div>
    </div>
  </DashboardLayout>
</template>
```

### Navigation Configuration
The sidebar navigation is configured in the `DashboardLayout.vue` component:

```javascript
const navigationItems = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    badge: null
  },
  {
    name: 'Chat',
    icon: '💬',
    path: '/chat',
    badge: null
  },
  // Add more navigation items here
]
```

### DaisyUI Components Used

1. **Layout Components**:
   - `drawer` - Main layout structure
   - `navbar` - Top navigation bar
   - `menu` - Sidebar navigation menu

2. **Content Components**:
   - `card` - Content containers
   - `stat` - Statistics display
   - `progress` - Progress bars
   - `badge` - Status indicators
   - `avatar` - User profile pictures
   - `btn` - Buttons and actions

3. **Interactive Components**:
   - `dropdown` - User profile dropdown
   - `divider` - Visual separators

## Features

### Responsive Design
- **Desktop**: Sidebar always visible, full-width content
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Adaptive layout that works on all screen sizes

### Navigation Features
- **Active States**: Current page is highlighted
- **Badges**: Show notifications or status
- **Icons**: Visual navigation with emoji icons
- **Quick Actions**: Common tasks in the sidebar

### User Experience
- **Smooth Transitions**: CSS transitions for interactions
- **Consistent Spacing**: Using DaisyUI's spacing system
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Customization

### Themes
The layout uses DaisyUI's theming system. You can change themes by modifying the `tailwind.config.js`:

```javascript
daisyui: {
  themes: ["light", "dark", "corporate"], // Add more themes
},
```

### Colors
All colors use DaisyUI's semantic color classes:
- `primary` - Main brand color
- `success` - Positive actions
- `warning` - Caution states
- `error` - Error states
- `base-100` - Background colors
- `base-content` - Text colors

### Adding New Pages
1. Create your page component
2. Wrap it with `DashboardLayout`
3. Add the route to `router/index.ts`
4. Add navigation item to `DashboardLayout.vue`

## Example Routes
```javascript
{
  path: '/your-page',
  name: 'yourPage',
  component: () => import('../views/YourPage.vue'),
  meta: {
    requiresAuth: true,
    title: 'Your Page Title'
  }
}
```

## Best Practices

1. **Use DaisyUI Components**: Leverage the built-in components for consistency
2. **Responsive Design**: Always test on mobile and desktop
3. **Accessibility**: Use proper semantic HTML and ARIA labels
4. **Performance**: Use lazy loading for route components
5. **Consistency**: Follow the established design patterns

## Available Routes
- `/dashboard` - Main dashboard page (requires auth)
- `/chat` - Chat functionality
- `/friends` - Friends management
- `/settings` - User settings
- `/profile` - User profile

The dashboard layout provides a solid foundation for building modern web applications with a professional look and feel. 