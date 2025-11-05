# Concussion Recovery Tracker

<div align="center">
  <img src="https://via.placeholder.com/200x100/0066cc/ffffff?text=Concussion+Recovery" alt="Concussion Recovery Tracker Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/RayhanXD/HealthTech-Accessability)
  [![Coverage](https://img.shields.io/badge/coverage-85%25-green)](https://github.com/RayhanXD/HealthTech-Accessability)
</div>

## 🏥 About

The Concussion Recovery Tracker is an innovative healthtech solution developed by Texas Convergent students at the University of Texas at Austin. Our mission is to help high school athletes safely recover from concussions by providing objective, continuous monitoring through wearable device integration.

### 🎯 Mission Statement
To prevent re-injury in high school athletes by leveraging existing wearable technology to provide coaches and physical trainers with objective recovery data, enabling safe return-to-play decisions and personalized recovery timelines.

### 🚨 The Problem
High school athletes recovering from concussions often misjudge their recovery, pushing themselves back into play too soon and risking re-injury. Coaches lack objective, continuous data to monitor progress outside of constant physical trainer visits. There is a critical need for a simple, wearable-integrated system that tracks recovery metrics and translates them into actionable insights for safe return-to-play decisions.

## ✨ Features

### 📱 Wearable Integration
- **🍎 Apple HealthKit Integration**: Seamless data collection from Apple Watch and compatible wearables
- **📊 Cross-Device Compatibility**: Works with most mainstream wearables synced with Apple Health
- **🔄 Real-Time Data Sync**: Continuous physiological and behavioral metrics collection

### 🧠 Concussion Recovery Metrics
- **💓 Resting Heart Rate Monitoring**: Tracks elevated RHR indicating poor autonomic recovery
- **📈 Heart Rate Variability Analysis**: Monitors HRV linked to nervous system function
- **⚡ Heart Rate Recovery Tracking**: Measures recovery speed post-exercise (1-2 minute drop in BPM)
- **😴 Sleep Quality Assessment**: 
  - Total sleep duration tracking
  - Sleep stage distribution analysis
  - Sleep consistency monitoring
- **🏃 Activity Level Monitoring**:
  - Active energy burned tracking
  - Exercise minutes monitoring
  - Step count and distance analysis

### 🎯 Smart Insights & Alerts
- **🚦 Recovery Status Indicators**: Color-coded system (green/yellow/red) for recovery progress
- **⚠️ Risk Assessment**: Automated alerts for concerning metric combinations
- **📋 Return-to-Play Recommendations**: Data-driven guidance for safe activity progression
- **📅 Recovery Timeline Estimation**: Personalized predictions for return to full activity

### 👥 Multi-User Dashboard
- **👨‍⚕️ Coach Dashboard**: Comprehensive athlete recovery overview
- **🏥 Physical Trainer Interface**: Detailed medical metrics and recommendations
- **👤 Athlete Portal**: Personal recovery progress and activity suggestions
- **📊 Team Analytics**: Aggregate team recovery data and trends

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **Git**
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/texas-convergent/healthtech-platform.git
   cd healthtech-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/convergent_db
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   
   # API Keys
   TWILIO_ACCOUNT_SID=your-twilio-sid
   SENDGRID_API_KEY=your-sendgrid-key
   
   # Environment
   NODE_ENV=development
   PORT=3000
   ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Tech Stack

### Frontend
- **React.js** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript development
- **Next.js** - React framework for production-grade applications
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization library
- **React Query** - Data fetching and state management

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management system
- **Prisma** - Next-generation ORM for Node.js
- **Redis** - In-memory data structure store for caching
- **Socket.io** - Real-time bidirectional event-based communication
- **Apple HealthKit API** - Secure access to wearable health data
- **JWT Authentication** - Secure user authentication and authorization

### DevOps & Infrastructure
- **Docker** - Containerization platform
- **AWS** - Cloud infrastructure services
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Web server and reverse proxy
- **Let's Encrypt** - SSL certificate management

### Security & Compliance
- **Auth0** - Identity and access management
- **Helmet.js** - Security middleware for Express
- **bcrypt** - Password hashing
- **Rate limiting** - API protection
- **OWASP** - Security best practices
- **HIPAA Compliance** - Healthcare data protection standards
- **Apple HealthKit Security** - Secure health data access protocols

## 📁 Project Structure

```
concussion-recovery-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── dashboard/  # Coach and trainer dashboards
│   │   │   ├── athlete/    # Athlete-specific components
│   │   │   └── charts/     # Data visualization components
│   │   ├── pages/          # Application pages
│   │   │   ├── coach/      # Coach dashboard pages
│   │   │   ├── trainer/    # Physical trainer interface
│   │   │   └── athlete/    # Athlete portal pages
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useHealthData.js # HealthKit data integration
│   │   ├── utils/          # Utility functions
│   │   │   └── healthMetrics.js # Concussion recovery calculations
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles and themes
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   │   ├── healthData.js # HealthKit data processing
│   │   │   └── recovery.js  # Recovery tracking logic
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   │   ├── Athlete.js  # Athlete data model
│   │   │   └── RecoveryMetrics.js # Recovery tracking model
│   │   ├── routes/         # API routes
│   │   │   ├── healthkit/  # Apple HealthKit integration
│   │   │   └── recovery/   # Recovery tracking endpoints
│   │   ├── services/       # Business logic services
│   │   │   ├── healthKitService.js # HealthKit API integration
│   │   │   └── recoveryAnalysis.js # Recovery insights generation
│   │   └── utils/          # Server utilities
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:client   # Start frontend only
npm run dev:server   # Start backend only

# Building
npm run build        # Build for production
npm run build:client # Build frontend
npm run build:server # Build backend

# Testing
npm run test         # Run all tests
npm run test:client  # Run frontend tests
npm run test:server  # Run backend tests
npm run test:e2e     # Run end-to-end tests

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Git Workflow

We follow the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model:

1. **Feature branches**: `feature/feature-name`
2. **Bug fixes**: `bugfix/bug-description`
3. **Releases**: `release/version-number`
4. **Hotfixes**: `hotfix/critical-fix`

### Code Style

- We use **ESLint** and **Prettier** for code formatting
- Follow **TypeScript** best practices
- Use **conventional commits** for commit messages
- Maintain **test coverage** above 80%

## 🧪 Testing

Our testing strategy includes:

- **Unit Tests**: Jest and React Testing Library
- **Integration Tests**: Supertest for API testing
- **End-to-End Tests**: Cypress for user workflow testing
- **Performance Tests**: Lighthouse CI for performance monitoring

```bash
# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # Generate coverage report
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy using Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Or deploy to cloud platforms**
   - **Vercel** (Frontend)
   - **Heroku** (Backend)
   - **AWS EC2/ECS** (Full stack)
   - **DigitalOcean** (Droplets)

### Environment Variables

Ensure all production environment variables are properly configured:
- Database connection strings
- API keys and secrets
- Authentication providers
- Third-party service configurations

## 📚 API Documentation

Our API follows RESTful principles and includes comprehensive documentation.

### Base URL
```
Production: https://api.convergent.health
Development: http://localhost:3001/api
```

### Authentication
All API requests require authentication via JWT tokens:
```bash
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User authentication (coach/trainer/athlete) |
| GET | `/athletes` | Retrieve athlete list |
| POST | `/athletes` | Register new athlete |
| GET | `/athletes/:id` | Get athlete details and recovery status |
| PUT | `/athletes/:id` | Update athlete information |
| GET | `/healthkit/data/:athleteId` | Retrieve HealthKit data for athlete |
| POST | `/healthkit/sync` | Sync wearable data with Apple HealthKit |
| GET | `/recovery/status/:athleteId` | Get current recovery status and recommendations |
| GET | `/recovery/timeline/:athleteId` | Get estimated return-to-play timeline |
| GET | `/dashboard/coach` | Coach dashboard with team overview |
| GET | `/dashboard/trainer` | Physical trainer interface with detailed metrics |
| GET | `/dashboard/athlete/:id` | Athlete personal recovery portal |

For complete API documentation, visit: [API Docs](https://docs.convergent.health)

## 🤝 Contributing

We welcome contributions from the Texas Convergent community! Here's how to get started:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for your changes
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Ensure all tests pass
- Update documentation as needed
- Follow our coding standards
- Write meaningful commit messages

### Issue Reporting

Found a bug or have a feature request? Please check our [issue tracker](https://github.com/texas-convergent/healthtech-platform/issues) and create a new issue if needed.

## 👥 Team

### Core Team
- **Project Lead**: [Name] - [@github-username](https://github.com/username)
- **Technical Lead**: [Name] - [@github-username](https://github.com/username)
- **Frontend Lead**: [Name] - [@github-username](https://github.com/username)
- **Backend Lead**: [Name] - [@github-username](https://github.com/username)
- **UI/UX Designer**: [Name] - [@github-username](https://github.com/username)

### Contributors
Thanks to all our amazing contributors! 🙏

<a href="https://github.com/texas-convergent/healthtech-platform/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=texas-convergent/healthtech-platform" />
</a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://concussion-recovery-tracker.com](https://concussion-recovery-tracker.com)
- **Documentation**: [https://docs.concussion-recovery-tracker.com](https://docs.concussion-recovery-tracker.com)
- **Texas Convergent**: [https://texasconvergent.org](https://texasconvergent.org)
- **University of Texas at Austin**: [https://utexas.edu](https://utexas.edu)
- **Apple HealthKit Documentation**: [https://developer.apple.com/documentation/healthkit](https://developer.apple.com/documentation/healthkit)

## 📞 Support

Need help or have questions?

- **Email**: support@concussion-recovery-tracker.com
- **Slack**: [#concussion-tracker-support](https://texasconvergent.slack.com/channels/concussion-tracker-support)
- **Office Hours**: Tuesdays 6-8 PM CST (Virtual)
- **Issues**: [GitHub Issues](https://github.com/RayhanXD/HealthTech-Accessability/issues)

## 🙏 Acknowledgments

- **Texas Convergent** - For providing the platform and community
- **University of Texas at Austin** - For institutional support
- **High School Athletic Programs** - For domain expertise and real-world testing
- **Apple HealthKit Team** - For providing secure health data access
- **Sports Medicine Professionals** - For concussion recovery guidance and validation
- **Open Source Community** - For the amazing tools and libraries

## 📊 Example Recovery Insights

### 🟡 Yellow Status Alert
```
Athlete: Sarah Johnson (Soccer)
Issue: Heart Rate Recovery after light jogging is 15% slower than baseline
Recommendation: Reduce training intensity, focus on light aerobic activity
Timeline: Estimated 3-5 days before returning to moderate activity
```

### 🔴 Red Status Alert
```
Athlete: Mike Chen (Football)
Issues: 
- Sleep disruptions (3 consecutive nights <6 hours)
- Increased resting heart rate (+12 BPM from baseline)
- Negative mood logs from athlete
Recommendation: Immediate rest, consult with medical professional
Timeline: Hold from all high-intensity activity until metrics improve
```

---

<div align="center">
  <p><strong>Built with ❤️ by Texas Convergent</strong></p>
  <p><em>Protecting Athletes Through Smart Recovery Monitoring</em></p>
</div>
