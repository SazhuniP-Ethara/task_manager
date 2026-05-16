const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    const createdUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password123',
        role: 'Admin',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@demo.com',
        password: 'password123',
        role: 'Member',
      },
      {
        name: 'Mike Chen',
        email: 'mike@demo.com',
        password: 'password123',
        role: 'Member',
      },
      {
        name: 'Emily Davis',
        email: 'emily@demo.com',
        password: 'password123',
        role: 'Member',
      },
    ]);

    const admin = createdUsers[0]._id;
    const sarah = createdUsers[1]._id;
    const mike = createdUsers[2]._id;
    const emily = createdUsers[3]._id;

    const d = (offset) => new Date(new Date().setDate(new Date().getDate() + offset));

    const sampleProjects = await Project.create([
      {
        title: 'Website Redesign',
        description: 'Complete overhaul of the corporate website with modern UI/UX, responsive design, and improved performance metrics.',
        dueDate: d(30),
        status: 'Active',
        members: [admin, sarah, mike],
        createdBy: admin,
      },
      {
        title: 'Mobile App v2.0',
        description: 'Build the next version of our iOS and Android app with offline support, push notifications, and dark mode.',
        dueDate: d(60),
        status: 'Active',
        members: [admin, emily, mike],
        createdBy: admin,
      },
      {
        title: 'Marketing Campaign Q3',
        description: 'Plan and execute the Q3 digital marketing campaign across social media, email, and paid ads.',
        dueDate: d(-5),
        status: 'Completed',
        members: [admin, sarah],
        createdBy: admin,
      },
      {
        title: 'API Integration Hub',
        description: 'Develop a centralized API gateway to connect all third-party services including payment, analytics, and CRM.',
        dueDate: d(45),
        status: 'Active',
        members: [admin, mike, emily],
        createdBy: admin,
      },
      {
        title: 'Customer Portal',
        description: 'Build a self-service customer portal for account management, billing, and support ticket tracking.',
        dueDate: d(20),
        status: 'On Hold',
        members: [admin, sarah, emily],
        createdBy: admin,
      },
    ]);

    const [webRedesign, mobileApp, marketing, apiHub, customerPortal] = sampleProjects;

    await Task.create([
      // Website Redesign tasks
      {
        title: 'Design Homepage Mockups',
        description: 'Create high-fidelity Figma mockups for the new homepage layout with hero section and feature cards.',
        priority: 'High',
        status: 'In Progress',
        dueDate: d(5),
        assignedMember: sarah,
        project: webRedesign._id,
        createdBy: admin,
      },
      {
        title: 'Implement Navigation Bar',
        description: 'Build the responsive top navigation with dropdown menus, search bar, and mobile hamburger menu.',
        priority: 'High',
        status: 'Completed',
        dueDate: d(-2),
        assignedMember: mike,
        project: webRedesign._id,
        createdBy: admin,
      },
      {
        title: 'Set Up CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging environment.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: d(10),
        assignedMember: mike,
        project: webRedesign._id,
        createdBy: admin,
      },
      {
        title: 'Write Landing Page Copy',
        description: 'Draft compelling copy for the landing page including headlines, CTAs, and feature descriptions.',
        priority: 'Low',
        status: 'Pending',
        dueDate: d(15),
        assignedMember: sarah,
        project: webRedesign._id,
        createdBy: admin,
      },

      // Mobile App tasks
      {
        title: 'Implement Push Notifications',
        description: 'Integrate Firebase Cloud Messaging for real-time push notifications on both iOS and Android.',
        priority: 'High',
        status: 'In Progress',
        dueDate: d(12),
        assignedMember: emily,
        project: mobileApp._id,
        createdBy: admin,
      },
      {
        title: 'Build Offline Mode',
        description: 'Implement local SQLite caching so users can access key features without an internet connection.',
        priority: 'High',
        status: 'Pending',
        dueDate: d(25),
        assignedMember: mike,
        project: mobileApp._id,
        createdBy: admin,
      },
      {
        title: 'Dark Mode Theme',
        description: 'Design and implement a dark mode toggle with system preference detection.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: d(-3),
        assignedMember: emily,
        project: mobileApp._id,
        createdBy: admin,
      },

      // Marketing Campaign tasks
      {
        title: 'Social Media Content Calendar',
        description: 'Create a 3-month content calendar for Instagram, Twitter, and LinkedIn with post templates.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: d(-10),
        assignedMember: sarah,
        project: marketing._id,
        createdBy: admin,
      },
      {
        title: 'Email Newsletter Design',
        description: 'Design responsive HTML email templates for the weekly product newsletter.',
        priority: 'Low',
        status: 'Completed',
        dueDate: d(-8),
        assignedMember: sarah,
        project: marketing._id,
        createdBy: admin,
      },

      // API Integration Hub tasks
      {
        title: 'Stripe Payment Integration',
        description: 'Connect Stripe API for subscription billing, one-time payments, and invoice generation.',
        priority: 'High',
        status: 'In Progress',
        dueDate: d(8),
        assignedMember: mike,
        project: apiHub._id,
        createdBy: admin,
      },
      {
        title: 'Google Analytics Setup',
        description: 'Implement GA4 tracking with custom events, conversion goals, and dashboard reporting.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: d(20),
        assignedMember: emily,
        project: apiHub._id,
        createdBy: admin,
      },
      {
        title: 'CRM API Connector',
        description: 'Build a connector module for Salesforce CRM to sync contacts, deals, and activity logs.',
        priority: 'Low',
        status: 'Pending',
        dueDate: d(35),
        assignedMember: mike,
        project: apiHub._id,
        createdBy: admin,
      },

      // Customer Portal tasks
      {
        title: 'User Account Dashboard',
        description: 'Build the main account dashboard with profile info, subscription status, and usage metrics.',
        priority: 'High',
        status: 'Pending',
        dueDate: d(14),
        assignedMember: emily,
        project: customerPortal._id,
        createdBy: admin,
      },
      {
        title: 'Support Ticket System',
        description: 'Implement a ticketing system where customers can create, track, and respond to support requests.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: d(18),
        assignedMember: sarah,
        project: customerPortal._id,
        createdBy: admin,
      },
    ]);

    console.log('========================================');
    console.log('  Demo Data Imported Successfully!');
    console.log('========================================');
    console.log('');
    console.log('  Demo Accounts:');
    console.log('  ─────────────────────────────────');
    console.log('  Admin:  admin@demo.com / password123');
    console.log('  Member: sarah@demo.com / password123');
    console.log('  Member: mike@demo.com  / password123');
    console.log('  Member: emily@demo.com / password123');
    console.log('');
    console.log('  5 Projects & 14 Tasks created.');
    console.log('========================================');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
