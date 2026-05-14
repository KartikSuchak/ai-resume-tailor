# AI Resume Tailoring Assistant

AI Resume Tailoring Assistant is a modern AI-powered SaaS web application that helps users optimize and customize their resumes according to specific job descriptions. The platform analyzes job requirements and assists users in generating tailored resume versions that better align with recruiter expectations and ATS (Applicant Tracking System) requirements.

The project is being developed as a full-stack AI-integrated application using React, TypeScript, Firebase, and modern web technologies.

---

## Features

### Authentication
- Secure Firebase Authentication
- User signup and login
- Protected dashboard routes
- Persistent login sessions

### Resume Tailoring
- Upload or paste resume content
- Paste target job descriptions
- AI-assisted resume optimization
- Keyword-aware tailoring workflow
- Multiple resume version management

### Dashboard
- Personalized user dashboard
- Saved resume versions
- Resume history tracking
- Planned application tracking system

### Modern UI
- Responsive SaaS-style interface
- Dark-themed modern design
- Built with Tailwind CSS
- Clean and scalable component architecture

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend & Services
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

### AI Integration
- OpenAI API (planned integration)

### Development Tools
- Git & GitHub
- VS Code

---

## Project Goals

The primary goal of this project is to create a practical AI-enabled productivity tool that helps users improve the relevance and quality of their resumes for different job applications.

The project also focuses on:
- scalable frontend architecture,
- modern authentication workflows,
- AI-assisted user experiences,
- real-world SaaS development practices,
- and production-style project organization.

---

## Folder Structure

```text
src
├── components
├── pages
├── firebase
├── routes
├── hooks
├── context
├── assets
└── utils
```

---

## Environment Variables

Create a `.env` file in the project root and configure Firebase environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/KartikSuchak/ai-resume-tailor.git
```

### Navigate to Project

```bash
cd ai-resume-tailor
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will run locally on:

```text
http://localhost:5173
```

---

## Current Development Status

The project is currently under active development.

### Completed
- React + TypeScript setup
- Tailwind CSS integration
- Firebase integration
- GitHub repository setup
- Environment variable configuration

### In Progress
- Firebase Authentication
- Dashboard UI
- Resume management system
- AI integration workflow

### Planned Features
- OpenAI-powered resume tailoring
- Resume version comparison
- ATS keyword scoring
- Resume export options
- Application tracking
- Cloud deployment

---

## Author

Kartik Suchak

GitHub:
https://github.com/KartikSuchak
