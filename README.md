# Project Library

<div align="center">

**A comprehensive web-based Project Library platform for AI/ML school projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.24-green)](https://www.fastify.io/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 Overview

Project Library is an open-source platform designed to empower students with hands-on AI and Machine Learning projects. It provides structured learning paths, progress tracking, group collaboration, and a comprehensive project management system for educational institutions.

The platform is built with modern web technologies and follows best practices for scalability, maintainability, and user experience.

## ✨ Features

### 🎓 **Project Management**
- **Browse & Discover**: Explore projects by class level, difficulty, subjects, and tags
- **Structured Learning**: Step-by-step project guides with checklists and resources
- **Multiple Formats**: Support for YAML and JSON project uploads
- **Batch Upload**: Efficient bulk project import system
- **Rich Metadata**: Projects include prerequisites, tools, duration, and guidance levels

### 👥 **User Management**
- **Phone-based Authentication**: Secure login using phone numbers (E.164 format)
- **User Profiles**: Manage personal information, school, and class details
- **Dashboard**: Track all enrollments and progress in one place
- **Activity Tracking**: Monitor learning activities and session data

### 📚 **Enrollment System**
- **Individual Enrollments**: Students can enroll in projects independently
- **Group Enrollments**: Support for 2-member teams with shared progress
- **Flexible Team Management**: Add team members after enrollment
- **Progress Synchronization**: Automatic progress syncing for group enrollments

### 📊 **Learning Experience**
- **Step-by-Step Navigation**: Clear project structure with ordered steps
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Checklist System**: Task-based learning with completion checklists
- **Resource Library**: Embedded videos, articles, datasets, and code resources
- **Submission System**: Support for file, link, and text submissions

### 🔐 **Admin Features**
- **Project Upload**: Admin panel for managing project library
- **User Management**: View and manage user accounts
- **Analytics**: Track enrollment statistics and user activity
- **Messaging System**: Send announcements and direct messages to users

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in theme switching
- **Accessible Components**: Built with Radix UI for accessibility
- **Beautiful Animations**: Smooth transitions and visual feedback

## 🏗️ Architecture

The project follows a modern full-stack architecture:

```
┌─────────────────┐
│   Next.js 15    │  Frontend (React 18, TypeScript, Tailwind CSS)
│   Port: 5000    │
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│   Fastify 4     │  Backend API (TypeScript, Prisma ORM)
│   Port: 3000    │
└────────┬────────┘
         │
┌────────▼────────┐
│   SQLite/       │  Database (Prisma ORM)
│   PostgreSQL    │
└─────────────────┘
```

### Technology Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation

**Backend:**
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [SQLite](https://www.sqlite.org/) / [PostgreSQL](https://www.postgresql.org/) - Database
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Zod](https://zod.dev/) - Runtime validation
- [JWT](https://jwt.io/) - Authentication tokens
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **SQLite** (included) or **PostgreSQL** v12+ (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/project-library.git
   cd project-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   PORT=3000
   NODE_ENV=development
   STORAGE_PATH="./storage"
   FRONTEND_URL="http://localhost:5000"
   JWT_SECRET="your-secret-key-here"
   ADMIN_KEY="your-admin-key-here"
   ```

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_NAME="Project Library"
   NEXT_PUBLIC_APP_DESCRIPTION="A comprehensive web-based Project Library platform for AI/ML school projects"
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   npm run seed:admin  # Optional: Create admin user
   ```

5. **Start development servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   ```

   Or run separately:
   ```bash
   # Backend (http://localhost:3000)
   npm run dev:backend

   # Frontend (http://localhost:5000)
   npm run dev:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 📚 Documentation

Comprehensive documentation is available in the repository:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[API.md](./docs/API.md)** - Complete API reference documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[UPLOAD_GUIDE.md](./UPLOAD_GUIDE.md)** - Guide for uploading projects (YAML/JSON)
- **[GROUP_ENROLLMENT_IMPLEMENTATION.md](./GROUP_ENROLLMENT_IMPLEMENTATION.md)** - Group enrollment feature documentation

## 🛠️ Development

### Available Scripts

**Root Level:**
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
npm run type-check       # Type check both projects
npm run lint             # Lint frontend code
npm run db:setup         # Setup database (generate + migrate)
npm run db:studio        # Open Prisma Studio
npm run clean            # Clean all node_modules and build files
```

**Backend (`cd backend`):**
```bash
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # Type check without emitting
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio GUI
npm run seed:admin       # Seed admin user
npm run seed             # Seed sample data
```

**Frontend (`cd frontend`):**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Type check without emitting
```

### Database Management

**Using SQLite (Development):**
```bash
cd backend
npm run db:generate
npm run db:migrate
```

**Using PostgreSQL (Production):**
1. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/project_library"
   ```
2. Run migrations:
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

**Prisma Studio (Database GUI):**
```bash
cd backend
npm run db:studio
```

### Project Structure

```
project-library/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Express/Fastify middlewares
│   │   ├── lib/            # Utilities and helpers
│   │   └── scripts/        # Database scripts
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── dev.db          # SQLite database (dev)
│   ├── storage/            # File storage
│   └── dist/               # Compiled output
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/            # Utilities and API client
│   ├── public/             # Static assets
│   └── .next/              # Next.js build output
│
├── docs/                   # Documentation
├── docker-compose.yml      # Docker configuration
└── package.json            # Root workspace config
```

## 🧪 Testing

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Admin Authentication**
   - Use admin credentials to access admin panel
   - Test project upload functionality

3. **User Flow**
   - Register a new user
   - Browse projects
   - Enroll in a project
   - Complete steps and track progress
   - Submit project work

### Database Testing

Use Prisma Studio to inspect and modify data:
```bash
cd backend
npm run db:studio
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
docker-compose up -d
```

## 🔒 Security

- **Password Hashing**: Uses bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Zod schemas for all API inputs
- **CORS Protection**: Configurable CORS policies
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Environment Variables**: Sensitive data stored in `.env` files

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [AI4Kerala](https://www.ai4kerala.org/) initiative
- Inspired by the need for structured AI/ML education in Kerala
- Community-driven development

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/project-library/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/project-library/discussions)
- **Email**: support@ai4kerala.org

## 🗺️ Roadmap

- [ ] Enhanced analytics dashboard
- [ ] Real-time collaboration features
- [ ] Mobile app (React Native)
- [ ] Integration with learning management systems
- [ ] Multi-language support
- [ ] Advanced project recommendations
- [ ] Peer review system
- [ ] Certificate generation

---

<div align="center">

**Made with ❤️ for Kerala's AI Education**

[Website](https://www.ai4kerala.org/) • [Documentation](./docs/) • [Contributing](./CONTRIBUTING.md) • [License](./LICENSE)

</div>
