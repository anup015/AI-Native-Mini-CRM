# Xeno SDE Internship Assignment - Project Context

## Assignment Overview

This project is an AI-Native Mini CRM for marketing teams.

The CRM helps brands:

* Manage customer and order data
* Create audience segments
* Generate AI-powered campaigns
* Send campaigns through simulated channels
* Track campaign performance and engagement

This is a Marketing CRM, NOT a Sales CRM.

Key workflow:

1. Import customers and orders
2. Create audience segments
3. Generate campaign content using AI
4. Launch campaign
5. Simulate delivery through separate channel service
6. Receive webhook events
7. Update analytics dashboard
8. Generate AI insights

---

## Tech Stack

Frontend + Backend:

* Next.js 15 App Router
* TypeScript
* TailwindCSS
* shadcn/ui
* Prisma ORM
* PostgreSQL (Neon)
* NextAuth/Auth.js
* React Query
* Framer Motion
* Recharts

AI:

* Gemini API

Deployment:

* Frontend + API -> Vercel

Separate Service:

* Node.js + Express
* Channel delivery simulator
* Deploy on Render/Railway

---

## Architecture Decisions

We intentionally chose Next.js fullstack architecture instead of separate frontend/backend repositories to:

* Ship faster
* Simplify deployment
* Reduce complexity
* Focus on product quality

Only the channel delivery simulator is implemented as a separate service because the assignment explicitly requires a callback-driven communication lifecycle.

---

## Current Progress

Completed:

### Section 1

Project setup

* Next.js app
* Tailwind
* shadcn/ui
* Prisma setup
* Environment configuration
* Folder structure

### Section 2

Database design

* Prisma schema
* Customer model
* Order model
* Campaign model
* Analytics model
* Relationships
* Indexes

### Section 3

Mock data generation

* Customer seed script
* Order seed script
* Realistic ecommerce data
* Segmentation-ready dataset

### Section 4

Authentication

* NextAuth/Auth.js
* Login page
* Signup page
* Session management
* Protected routes

---

## Coding Standards

Follow these principles:

* Use TypeScript everywhere
* Keep components reusable
* Prefer server components when possible
* Use server actions for mutations
* Use route handlers for APIs
* Use Prisma for database access
* Avoid unnecessary abstractions
* Avoid overengineering
* Build startup-quality code

---

## UI Direction

Inspiration:

* Linear
* Vercel
* Notion AI
* Attio

Requirements:

* Premium SaaS appearance
* Dark mode
* Smooth animations
* Glassmorphism cards
* Responsive layout

Avoid generic admin dashboard designs.

---

## Remaining Sections

### Section 5

Customer Management Dashboard

Features:

* Customer table
* Search
* Filters
* Pagination
* Customer details page
* Order history
* Analytics cards

### Section 6

AI Audience Segmentation

Most important feature.

Flow:
Natural language ->
Gemini ->
Structured filters ->
Prisma query ->
Audience results

### Section 7

Campaign Creation Flow

Flow:
Audience ->
AI content ->
Preview ->
Launch

### Section 8

Channel Service

Separate Express service.

Flow:
CRM ->
Channel Service ->
Webhook callbacks ->
CRM Analytics

### Section 9

Analytics Dashboard

Metrics:

* Sent
* Delivered
* Opened
* Clicked
* Converted

### Section 10

AI Copilot

Chat-based CRM assistant.

### Section 11

UI Polish

Premium SaaS experience.

### Section 12

README and Architecture Documentation

---

## Immediate Task

Continue from Section 5.

Build the Customer Management Dashboard using the existing Prisma schema and authentication system.

Before generating code:

1. Inspect the existing project structure.
2. Reuse existing components.
3. Follow current patterns.
4. Do not rewrite completed modules.
5. Generate production-quality code.
