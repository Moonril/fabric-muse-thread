# Thread Weaver

Progetti

# Project Tracker — Lovable Prompt

## Overview

Build a responsive (mobile-first) web app (called Thread) for tracking design/creative projects — each project pairs a reference image with a fabric/material image, plus optional extra reference images. Style inspiration: Trello / Huntr — clean cards, generous whitespace, neutral colors, calm and organized.

## Tech Stack

- React + Vite

- Tailwind CSS

- Supabase (Auth, Database, Storage)

## Design System

- **Color palette:** neutral (grays/off-whites, one muted accent color for primary actions/status)

- **Dark/Light mode:** toggle, persisted per user, respects system preference by default

- **Language:** English / Italian toggle (i18n), persisted per user

- **Typography:** clean sans-serif, clear hierarchy

- **Layout:** mobile-first, fully responsive (stacked cards on mobile → horizontal long cards on tablet/desktop)

## Auth

- Email + password sign up / sign in

- Supabase Auth session handling, protected routes (redirect to login if unauthenticated)

- Landing page (public) → Login/Signup page → Home page (authenticated)

### Landing Page

- Simple, minimal marketing-style intro to the app

- CTA buttons: "Log in" / "Sign up"

### Login / Signup Page

- Tabs or toggle between Login and Signup

- Email + password fields, "Continue with Google" button

- Form validation with clear inline error messages

- Loading state on submit button while authenticating

- Error feedback for failed login/signup (e.g. wrong password, email already in use)

## Data Model (Supabase)

**profiles**

- id (uuid, references auth.users)

- display_name

- created_at

**projects**

- id (uuid)

- user_id (uuid, references auth.users)

- title (text, required)

- description (text, optional)

- reference_image_url (text)

- fabric_image_url (text)

- status (enum: `active`, `completed`)

- created_at

- updated_at

**project_images** (up to 5 additional reference images per project)

- id (uuid)

- project_id (uuid, references projects)

- image_url (text)

- sort_order (int)

Use Supabase Storage buckets for image uploads (e.g. `project-images`), with Row Level Security so users can only access their own projects and images.

## Pages & Flows

### Home Page (authenticated)

- Shows all existing projects as **long vertical cards** (Trello/Huntr style), stacked horizontally in a list

- Each card shows: reference image thumbnail, title, short description preview, status badge (active/completed)

- Filter/tab by status: All / Active / Completed

- "+ New Project" button, prominent, always accessible (e.g. top of list or floating action button on mobile)

- Clicking a card navigates to the Project Detail page

### New Project Flow

- Form/modal to create a project: title (required), description (optional), reference image upload, fabric image upload, up to 5 additional reference images (optional)

- Loading state while uploading images / saving

- Success feedback on creation (e.g. toast: "Project added") and redirect to the new project's detail page

- Error feedback if upload/save fails, with retry option

### Project Detail Page

- Full view of all project info: title, description, reference image, fabric image, and the additional reference images (gallery, up to 5)

- Status control: mark as **Active** or **Completed**

- **Edit** mode: update title, description, images, status

- **Delete** project (with confirmation dialog before destructive action)

- Loading state while fetching project data

- Success feedback on save/update, delete, and status change

- Error feedback if any action fails

## Feedback States (apply app-wide)

- **Loading states:** skeleton loaders for project list and detail page, spinner on buttons during async actions (save, upload, delete, auth)

- **Empty states:** friendly empty state on Home page when no projects exist yet, with a CTA to create the first one

- **Error messages:** clear, human-readable inline or toast errors for failed auth, upload, save, or delete actions

- **Success messages:** toast confirmations for key actions — project added, project updated, project deleted, status changed

## Settings / Header

- Persistent header/nav with: app logo/name, dark/light mode toggle, language toggle (EN/IT), user menu (profile, log out)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bdd50423-4684-40a4-8a5f-cf0572177fdd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
