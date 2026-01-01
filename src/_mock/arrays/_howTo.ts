import { IHowToGuide } from '../../@types/howTo';

// ----------------------------------------------------------------------

export const _howToGuides: IHowToGuide[] = [
  {
    id: '1',
    title: 'Getting Started with PlatePrep',
    description: 'Learn the basics of navigating and using PlatePrep to manage your restaurant operations effectively.',
    category: 'Getting Started',
    content: `
      <h2>Welcome to PlatePrep</h2>
      <p>PlatePrep is a comprehensive restaurant management system designed to streamline your operations. This guide will help you get started.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>Recipe Management</li>
        <li>Task Scheduling</li>
        <li>Wine Inventory Tracking</li>
        <li>User Management</li>
        <li>Restaurant Location Management</li>
      </ul>
      
      <h3>First Steps</h3>
      <ol>
        <li>Complete your profile setup</li>
        <li>Add your restaurant locations</li>
        <li>Create your first recipe</li>
        <li>Invite team members</li>
      </ol>
    `,
    cover: '/assets/images/covers/cover_1.jpg',
    author: {
      name: 'PlatePrep Team',
      avatarUrl: '/assets/images/avatars/avatar_1.jpg',
    },
    createdAt: new Date('2024-01-15'),
    view: 1250,
    helpful: 89,
    tags: ['basics', 'getting-started', 'tutorial'],
    featured: true,
    popular: true,
  },
  {
    id: '2',
    title: 'How to Create and Manage Recipes',
    description: 'Step-by-step guide to creating, editing, and organizing your recipes in PlatePrep.',
    category: 'Recipes Management',
    content: `
      <h2>Creating Recipes</h2>
      <p>Recipes are the foundation of your menu. Learn how to create comprehensive recipes with all the details you need.</p>
      
      <h3>Adding a New Recipe</h3>
      <ol>
        <li>Navigate to Recipes from the sidebar</li>
        <li>Click "New Recipe" button</li>
        <li>Fill in the basic information (name, cuisine type, description)</li>
        <li>Add ingredients and quantities</li>
        <li>Add preparation steps</li>
        <li>Upload images and videos</li>
        <li>Set food cost and pricing</li>
        <li>Save and publish</li>
      </ol>
      
      <h3>Editing Recipes</h3>
      <p>You can edit recipes directly from the detail page using inline editing, or navigate to the edit page for comprehensive changes.</p>
      
      <h3>Recipe Status</h3>
      <ul>
        <li><strong>Draft:</strong> Work in progress, not visible to all users</li>
        <li><strong>Public:</strong> Published and visible to all authorized users</li>
        <li><strong>Archived:</strong> Hidden but kept for reference</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_2.jpg',
    author: {
      name: 'Chef Expert',
      avatarUrl: '/assets/images/avatars/avatar_2.jpg',
    },
    createdAt: new Date('2024-01-20'),
    view: 980,
    helpful: 76,
    tags: ['recipes', 'cooking', 'menu'],
    featured: true,
  },
  {
    id: '3',
    title: 'Managing Tasks and Assignments',
    description: 'Learn how to create tasks, assign them to staff members, and track their completion.',
    category: 'Tasks & Scheduling',
    content: `
      <h2>Task Management</h2>
      <p>Tasks help you organize and track work assignments across your restaurant team.</p>
      
      <h3>Creating a Task</h3>
      <ol>
        <li>Go to Tasks from the sidebar</li>
        <li>Click "New Task"</li>
        <li>Select task type (Predefined or Custom)</li>
        <li>Choose the dish (if applicable)</li>
        <li>Assign to a staff member</li>
        <li>Set priority level</li>
        <li>Set due date and time</li>
        <li>Add description and attachments</li>
      </ol>
      
      <h3>Task Status</h3>
      <ul>
        <li><strong>Assigned:</strong> Task is assigned but not started</li>
        <li><strong>In Progress:</strong> Task is being worked on</li>
        <li><strong>Completed:</strong> Task is finished</li>
        <li><strong>Cancelled:</strong> Task was cancelled</li>
      </ul>
      
      <h3>Priority Levels</h3>
      <ul>
        <li><strong>High:</strong> Urgent tasks requiring immediate attention</li>
        <li><strong>Medium:</strong> Important but not urgent</li>
        <li><strong>Low:</strong> Can be completed when time permits</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_3.jpg',
    author: {
      name: 'Operations Manager',
      avatarUrl: '/assets/images/avatars/avatar_3.jpg',
    },
    createdAt: new Date('2024-01-25'),
    view: 750,
    helpful: 62,
    tags: ['tasks', 'scheduling', 'management'],
  },
  {
    id: '4',
    title: 'Wine Inventory Management',
    description: 'Complete guide to managing your wine inventory, tracking stock levels, and setting up alerts.',
    category: 'Wine Inventory',
    content: `
      <h2>Wine Inventory Overview</h2>
      <p>Manage your wine collection efficiently with PlatePrep's inventory system.</p>
      
      <h3>Adding Wine to Inventory</h3>
      <ol>
        <li>Navigate to Wine Inventory</li>
        <li>Click "New Wine"</li>
        <li>Enter wine details (name, producer, vintage, type)</li>
        <li>Set inventory levels for different bottle sizes</li>
        <li>Configure stock thresholds</li>
        <li>Add purchase price and supplier information</li>
        <li>Assign to restaurant location</li>
      </ol>
      
      <h3>Stock Status</h3>
      <ul>
        <li><strong>In Stock:</strong> Stock is above minimum threshold</li>
        <li><strong>Low Stock:</strong> Stock is at or below minimum threshold</li>
        <li><strong>Out of Stock:</strong> No stock available</li>
      </ul>
      
      <h3>Bottle Sizes</h3>
      <p>Track inventory across multiple bottle sizes:</p>
      <ul>
        <li>Split/Piccolo (187.5ml)</li>
        <li>Demi/Half (375ml)</li>
        <li>Standard (750ml)</li>
        <li>Magnum (1.5L)</li>
        <li>Jeroboam (3L)</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_4.jpg',
    author: {
      name: 'Sommelier Pro',
      avatarUrl: '/assets/images/avatars/avatar_4.jpg',
    },
    createdAt: new Date('2024-02-01'),
    view: 650,
    helpful: 54,
    tags: ['wine', 'inventory', 'beverages'],
  },
  {
    id: '5',
    title: 'Setting Up Restaurant Locations',
    description: 'Learn how to add and manage multiple restaurant locations, branches, and their settings.',
    category: 'Restaurant Locations',
    content: `
      <h2>Restaurant Locations</h2>
      <p>Manage multiple restaurant locations from a single dashboard.</p>
      
      <h3>Adding a Location</h3>
      <ol>
        <li>Go to Restaurant Location</li>
        <li>Click "New Location"</li>
        <li>Enter location details (name, address, phone)</li>
        <li>Add social media links</li>
        <li>Save the location</li>
      </ol>
      
      <h3>Location Management</h3>
      <p>Each location can have:</p>
      <ul>
        <li>Unique contact information</li>
        <li>Social media profiles</li>
        <li>Associated users and staff</li>
        <li>Dedicated recipes and inventory</li>
        <li>Location-specific tasks</li>
      </ul>
      
      <h3>Viewing Location Details</h3>
      <p>Click on any location to view:</p>
      <ul>
        <li>Users assigned to the location</li>
        <li>Recipes associated with the location</li>
        <li>Wine inventory for the location</li>
        <li>Tasks for the location</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_5.jpg',
    author: {
      name: 'Admin User',
      avatarUrl: '/assets/images/avatars/avatar_5.jpg',
    },
    createdAt: new Date('2024-02-05'),
    view: 520,
    helpful: 43,
    tags: ['locations', 'branches', 'setup'],
  },
  {
    id: '6',
    title: 'User Management and Permissions',
    description: 'Guide to adding users, assigning roles, and managing permissions in your restaurant system.',
    category: 'User Management',
    content: `
      <h2>User Management</h2>
      <p>Control who has access to your PlatePrep system and what they can do.</p>
      
      <h3>Adding Users</h3>
      <ol>
        <li>Navigate to Users</li>
        <li>Click "New User"</li>
        <li>Enter user information (name, email, phone)</li>
        <li>Assign user role</li>
        <li>Select restaurant location</li>
        <li>Upload profile image</li>
        <li>Set permissions</li>
      </ol>
      
      <h3>User Roles</h3>
      <ul>
        <li><strong>Admin:</strong> Full access to all features</li>
        <li><strong>Manager:</strong> Can manage recipes, tasks, and inventory</li>
        <li><strong>Staff:</strong> Limited access, can view and complete assigned tasks</li>
      </ul>
      
      <h3>Permissions</h3>
      <p>Fine-tune access with granular permissions:</p>
      <ul>
        <li>View, Create, Edit, Delete permissions per module</li>
        <li>One-off permissions for specific users</li>
        <li>Role-based default permissions</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_6.jpg',
    author: {
      name: 'System Admin',
      avatarUrl: '/assets/images/avatars/avatar_6.jpg',
    },
    createdAt: new Date('2024-02-10'),
    view: 890,
    helpful: 71,
    tags: ['users', 'permissions', 'security'],
    popular: true,
  },
  {
    id: '7',
    title: 'Configuring System Settings',
    description: 'Learn how to customize your PlatePrep settings, preferences, and system configuration.',
    category: 'Settings & Configuration',
    content: `
      <h2>System Settings</h2>
      <p>Customize PlatePrep to match your restaurant's needs.</p>
      
      <h3>General Settings</h3>
      <ul>
        <li>Account information</li>
        <li>Profile management</li>
        <li>Notification preferences</li>
        <li>Social media links</li>
        <li>Password changes</li>
      </ul>
      
      <h3>Billing Settings</h3>
      <p>Manage your subscription and payment methods:</p>
      <ul>
        <li>View current plan</li>
        <li>Update payment methods</li>
        <li>View billing history</li>
        <li>Manage subscription</li>
      </ul>
      
      <h3>Notification Settings</h3>
      <p>Control how and when you receive notifications:</p>
      <ul>
        <li>Email notifications</li>
        <li>In-app notifications</li>
        <li>Task reminders</li>
        <li>System alerts</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_7.jpg',
    author: {
      name: 'Support Team',
      avatarUrl: '/assets/images/avatars/avatar_7.jpg',
    },
    createdAt: new Date('2024-02-15'),
    view: 680,
    helpful: 58,
    tags: ['settings', 'configuration', 'preferences'],
  },
  {
    id: '8',
    title: 'Troubleshooting Common Issues',
    description: 'Solutions to common problems and frequently asked questions about using PlatePrep.',
    category: 'Troubleshooting',
    content: `
      <h2>Common Issues and Solutions</h2>
      <p>Find quick solutions to common problems.</p>
      
      <h3>Login Issues</h3>
      <ul>
        <li><strong>Forgot Password:</strong> Use the "Forgot Password" link on the login page</li>
        <li><strong>Account Locked:</strong> Contact your system administrator</li>
        <li><strong>Wrong Credentials:</strong> Double-check your email and password</li>
      </ul>
      
      <h3>Recipe Issues</h3>
      <ul>
        <li><strong>Images not uploading:</strong> Check file size and format (JPG, PNG)</li>
        <li><strong>Video not playing:</strong> Ensure YouTube URL is correct</li>
        <li><strong>Can't edit recipe:</strong> Check your permissions</li>
      </ul>
      
      <h3>Task Issues</h3>
      <ul>
        <li><strong>Tasks not showing:</strong> Check filters and status tabs</li>
        <li><strong>Can't assign task:</strong> Verify user has appropriate role</li>
        <li><strong>Task status not updating:</strong> Refresh the page</li>
      </ul>
      
      <h3>Getting Help</h3>
      <p>If you need additional assistance:</p>
      <ul>
        <li>Check other guides in this section</li>
        <li>Contact support through the Settings page</li>
        <li>Email support@plateprep.com</li>
      </ul>
    `,
    cover: '/assets/images/covers/cover_8.jpg',
    author: {
      name: 'Support Team',
      avatarUrl: '/assets/images/avatars/avatar_8.jpg',
    },
    createdAt: new Date('2024-02-20'),
    view: 1120,
    helpful: 95,
    tags: ['troubleshooting', 'help', 'faq'],
    featured: true,
    popular: true,
  },
];

