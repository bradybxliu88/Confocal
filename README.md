# LabTracker - Modern Lab Management Platform

A unified platform for biology research laboratories to replace Notion, Slack, and WhatsApp for lab management. LabTracker provides comprehensive project tracking, intelligent inventory management with barcode scanning, equipment scheduling, and order management.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview of lab activities, stats, and alerts
- **Project Management**: Track research projects with progress bars, budgets, and team collaboration
- **Inventory Management**: Barcode scanning with AI-powered storage suggestions using Claude API
- **Equipment Scheduler**: Calendar-based booking system with conflict prevention
- **Order Management**: Complete workflow from request → approval → order → receipt
- **Protocol Library**: Version-controlled protocols with categories and tags
- **User Management**: Role-based access control (PI, Postdoc, Grad Student, Undergrad)

### Advanced Features
- **AI-Powered Storage Suggestions**: Automatically recommends optimal storage conditions based on reagent properties
- **Real-time Notifications**: Socket.io integration for live updates
- **Barcode Scanning**: Quick reagent receipt and tracking
- **Low Stock Alerts**: Automatic notifications when inventory is low
- **Expiration Warnings**: Track and alert on expiring reagents
- **Equipment Reminders**: 15-minute advance booking notifications
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for modern, responsive styling
- **Zustand** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for API requests

### Backend
- **Node.js** with Express and TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** authentication with refresh tokens
- **Socket.io** for WebSocket connections
- **Winston** for logging

### AI Integration
- **Anthropic Claude API** for intelligent storage suggestions and project insights

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 15+
- (Optional) Docker and Docker Compose

### Quick Start with Docker

1. Clone the repository and set up environment variables:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your database URL and API keys
```

2. Start with Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# Start server
npm run dev
```

#### Frontend Setup

```bash
cd client
npm install
cp .env.example .env

# Start development server
npm run dev
```

## 🔑 Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| PI/Lab Manager | sarah.chen@biolab.edu | password123 |
| Postdoc/Staff | michael.rodriguez@biolab.edu | password123 |
| Graduate Student | emily.zhang@biolab.edu | password123 |

## 🎯 Key Workflows

### Adding Reagents with AI Suggestions

1. Click "Scan Barcode" or "Add Reagent"
2. Enter reagent details (name, vendor, catalog number)
3. Click "Get AI Suggestions" for intelligent storage recommendations
4. AI suggests optimal location, temperature, handling notes, and shelf life
5. Review and apply suggestions

### Equipment Booking

1. Navigate to Equipment section
2. Select equipment and view schedule
3. Choose time slot (system prevents double-booking)
4. Receive reminder 15 minutes before booking

### Order Workflow

1. **Request**: User creates order with justification
2. **Approval**: PI/Lab Manager reviews and approves
3. **Ordered**: Order placed with vendor
4. **Shipped**: Tracking number added
5. **Received**: Scan barcode to log receipt

## 🏗 Project Structure

```
Confocal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and Socket services
│   │   ├── stores/        # Zustand state stores
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Database and configs
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic (AI integration)
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🚢 Deployment

### Production Build

```bash
# Build frontend
cd client && npm run build

# Build backend
cd server && npm run build
```

### Environment Variables

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong secret for access tokens
- `JWT_REFRESH_SECRET`: Strong secret for refresh tokens
- `ANTHROPIC_API_KEY`: Your Anthropic API key for AI features
- `NODE_ENV`: Set to `production`

---

**LabTracker** - Making lab management intelligent and effortless! 🧬🔬