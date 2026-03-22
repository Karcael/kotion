# Kotion

A self-hosted Notion alternative built with Next.js. Write, organize, and collaborate on your notes without relying on third-party services.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## Features

### Editor
- **Block-based editor** powered by Tiptap with slash commands (`/`)
- **Rich text formatting** — bold, italic, underline, strikethrough, code, highlight, links
- **Block types** — headings, bullet lists, numbered lists, task lists, code blocks, quotes, tables, images, dividers
- **Multi-column layouts** — split content into 2, 3, or 4 columns (responsive on mobile)
- **Drag & drop** — reorder blocks with grab handles
- **Floating toolbar** — formatting options appear on text selection
- **Table editing** — add/remove rows and columns with a floating toolbar
- **Image upload** — drag & drop or URL, for both inline images and page covers/icons
- **Syntax highlighting** — code blocks with language detection
- **Auto-save** — changes are saved automatically with debounce

### Organization
- **Page hierarchy** — unlimited nesting with tree navigation in the sidebar
- **Page icons** — emoji or custom image icons
- **Cover images** — full-width header images
- **Favorites** — pin frequently used pages
- **Trash & restore** — soft delete with recovery
- **Search** — find pages instantly with `Ctrl+K` / `Cmd+K`

### Collaboration
- **Share via email** — invite people with Editor or Viewer roles
- **Invitation system** — accept/decline with in-app notifications
- **Access control** — Owner, Editor, Viewer permissions with parent-chain inheritance
- **Live sync** — see collaborator changes without page refresh (polling-based)

### Design
- **Dark & light mode** — system-aware with manual toggle
- **Responsive** — works on desktop, tablet, and mobile
- **Notion-inspired UI** — clean, minimal design with smooth animations

### Security
- **JWT authentication** — HTTP-only cookies, 7-day expiry
- **Password hashing** — bcrypt with salt rounds
- **File validation** — type and size checks on uploads
- **Path traversal protection** — secure file serving
- **Owner-only actions** — delete, archive, and publish restricted to page owners

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| Editor | Tiptap 3.20 |
| Database | PostgreSQL 17 + Prisma 7 |
| Styling | Tailwind CSS 4 |
| Auth | JWT (jose + bcryptjs) |
| State | Zustand |
| Deployment | Docker |

## Quick Start

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/kotion.git
cd kotion

# Configure environment
cp .env.example .env
# Edit .env — change JWT_SECRET for production!

# Start
docker-compose up -d --build

# Access at http://localhost:3000
```

### Local Development

**Prerequisites:** Node.js 22+, PostgreSQL 17+

```bash
# Install dependencies
npm install

# Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma db push

# Start development server
npm run dev

# Access at http://localhost:3000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kotion:kotion@localhost:5432/kotion` |
| `JWT_SECRET` | Secret key for JWT signing | Must change in production |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | `http://localhost:3000` |
| `APP_PORT` | External port for Docker | `3000` |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & register pages
│   ├── (main)/documents/    # Main app with editor
│   └── api/
│       ├── auth/            # Authentication endpoints
│       ├── documents/       # CRUD + collaborators
│       ├── invitations/     # Sharing system
│       ├── search/          # Full-text search
│       ├── upload/          # File uploads
│       └── files/           # File serving
├── components/
│   ├── editor/              # Tiptap editor + extensions
│   ├── sidebar/             # Navigation tree
│   └── ...                  # UI components
├── hooks/                   # Custom React hooks
├── lib/                     # Auth, Prisma, utilities
└── stores/                  # Zustand state stores
```

## Docker Architecture

```
docker-compose up -d --build

  ┌─────────────────────────────────────┐
  │  postgres (PostgreSQL 17)           │
  │  Volume: postgres-data              │
  └──────────────┬──────────────────────┘
                 │
  ┌──────────────┴──────────────────────┐
  │  app (Next.js standalone)           │
  │  Port: ${APP_PORT:-3000}            │
  │  Volume: uploads                    │
  │                                     │
  │  On startup:                        │
  │  1. prisma db push (auto-migrate)   │
  │  2. node server.js                  │
  └─────────────────────────────────────┘
```

Connect with **Cloudflare Tunnel**, Nginx, or Traefik to expose via HTTPS.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT
