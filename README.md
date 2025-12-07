# SYNTRA

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Apple_Health-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Apple Health"/>
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/RayhanXD/HealthTech-Accessability)
</div>

<p align="center">
  <strong>Bring Synergy to Training</strong><br/>
  A health platform that translates raw Apple Health data into actionable insights for athletic performance, optimizing communication between athletes and coaches.
</p>

---

## Overview

**60% of coaches feel they receive insufficient information about their athletes' health.** Syntra bridges this gap by providing a dual-dashboard system that transforms wearable health data into meaningful, actionable insights.

Syntra integrates with Apple Health via the Sahha SDK to collect physiological metrics from athletes' wearables, processes this data through our analytics engine, and delivers personalized performance insights to both athletes and coaches through dedicated dashboards.

---

## Technical Architecture

### System Design

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Apple Watch   │────▶│   Apple Health   │────▶│   Sahha SDK     │
│   (Wearables)   │     │   (HealthKit)    │     │   (Data Layer)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Native   │◀───▶│   Node.js API    │◀───▶│    MongoDB      │
│  Mobile Client  │     │   (Express)      │     │   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│ Athlete Dashboard│     │ Coach Dashboard  │
│  (Insights UI)  │     │  (Team Overview) │
└─────────────────┘     └──────────────────┘
```

### Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Mobile App | React Native | Cross-platform athlete interface |
| Health Integration | Sahha SDK + Apple HealthKit | Wearable data collection |
| API Server | Node.js + Express | RESTful backend services |
| Database | MongoDB | Player/trainer data persistence |
| Caching | Redis | Session management & performance |
| Containerization | Docker | Deployment & scaling |

---

## Data Architecture

### Health Metrics Collected

Syntra collects and analyzes the following physiological indicators:

| Metric Category | Data Points | Significance |
|-----------------|-------------|--------------|
| **Cardiovascular** | Heart Rate, HRV (ms), Resting HR | Autonomic nervous system health, recovery status |
| **Respiratory** | Blood Oxygen (SpO2) | Oxygen delivery efficiency |
| **Activity** | VO2 Max (mL/kg/min), Stride Length | Aerobic capacity, biomechanical efficiency |
| **Recovery** | Sleep Duration, Sleep Quality | Recovery and readiness indicators |
| **Thermoregulation** | Body Temperature | Baseline health monitoring |

### Database Schema Design

We use MongoDB with Mongoose ODM for flexible, document-based storage optimized for health time-series data.

**Player Model** — Stores athlete profiles with embedded insights:

```javascript
{
  Username: String,           // Unique identifier (3-30 chars)
  Password: String,           // bcrypt hashed (12 salt rounds)
  fName: String,              // First name
  Lname: String,              // Last name
  Age: Number,                // Age validation (1-120)
  Bodyweight_in_pounds: Number,
  Height_in_inches: Number,
  SexAtBirth: Enum,           // ['Male', 'Female', 'Other']
  Insights: {
    Trends: [{                // Time-series health trends
      Category: String,
      Name: String,
      State: String,          // Current status indicator
      isHigherBetter: Boolean,
      valueRange: Number,
      Unit: String,
      Data: [{
        StartDateTime: String,
        Value: Number,
        percentChangeFromPrevious: Number
      }]
    }],
    Comparisons: [{           // Peer/baseline comparisons
      Category: String,
      Percentile: Number,     // Population percentile
      State: String,
      Difference: String
    }]
  }
}
```

**Trainer Model** — Stores coach profiles with player relationships:

```javascript
{
  User: String,               // Unique identifier
  Password: String,           // bcrypt hashed
  fName: String,
  lname: String,
  Players: [ObjectId]         // References to Player documents
}
```

### Data Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Embedded Insights** | Health trends are stored within player documents to optimize read performance for dashboard queries |
| **Reference-based Relationships** | Trainer-Player relationships use ObjectId references to support many-to-many mappings |
| **Time-series in Arrays** | Trend data stored as arrays within documents for atomic updates and temporal queries |
| **Flexible Schema** | MongoDB's schema flexibility accommodates evolving health metric requirements |

---

## Algorithm Implementation

### Trend Analysis Engine

The trend analysis system processes raw health data to identify meaningful patterns:

```javascript
// Trend State Classification Algorithm
function classifyTrendState(data, isHigherBetter) {
  const recentValues = data.slice(-7);  // Last 7 data points
  const avgChange = calculateAverageChange(recentValues);
  
  if (isHigherBetter) {
    if (avgChange > 5) return 'IMPROVING';
    if (avgChange < -5) return 'DECLINING';
    return 'STABLE';
  } else {
    if (avgChange < -5) return 'IMPROVING';
    if (avgChange > 5) return 'DECLINING';
    return 'STABLE';
  }
}

// Percent Change Calculation
function calculatePercentChange(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
```

### Comparison Percentile Calculation

Athletes are compared against population baselines using percentile ranking:

```javascript
// Percentile Ranking Algorithm
function calculatePercentile(value, populationData, isHigherBetter) {
  const sorted = populationData.sort((a, b) => a - b);
  const rank = sorted.filter(v => v < value).length;
  const percentile = (rank / sorted.length) * 100;
  
  return isHigherBetter ? percentile : (100 - percentile);
}
```

### Mood Index Composite Score

Syntra calculates a composite "Mood Index" from multiple physiological signals:

```
Mood Index = (HRV_score × 0.30) + 
             (Sleep_score × 0.25) + 
             (Activity_score × 0.20) + 
             (Recovery_score × 0.25)

Where each component score is normalized to 0-100 scale
based on individual baseline and population percentiles.
```

---

## API Design

### RESTful Endpoints

All endpoints follow REST conventions with consistent response formatting:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { },
  "pagination": { "page": 1, "limit": 10, "total": 50 }
}
```

### Player Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/players` | List all players (paginated, filterable) |
| `GET` | `/api/players/:id` | Get player with insights |
| `POST` | `/api/players` | Create new player |
| `PUT` | `/api/players/:id` | Update player profile |
| `DELETE` | `/api/players/:id` | Remove player |
| `PUT` | `/api/players/:id/insights` | Update health insights |
| `POST` | `/api/players/:id/trends` | Add new trend data |
| `POST` | `/api/players/:id/comparisons` | Add comparison data |

### Trainer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trainers` | List all trainers |
| `GET` | `/api/trainers/:id` | Get trainer with populated players |
| `POST` | `/api/trainers` | Create new trainer |
| `PUT` | `/api/trainers/:id` | Update trainer profile |
| `DELETE` | `/api/trainers/:id` | Remove trainer |
| `GET` | `/api/trainers/:id/players` | Get trainer's assigned athletes |
| `POST` | `/api/trainers/:id/players` | Assign player to trainer |
| `DELETE` | `/api/trainers/:id/players/:playerId` | Unassign player |

### Query Parameters

```bash
# Filtering & Pagination
GET /api/players?page=1&limit=10&search=john&sex=Male&minAge=18&maxAge=30

# Trainer search
GET /api/trainers?search=smith&page=1&limit=20
```

---

## Security Implementation

### Authentication & Authorization

| Layer | Implementation |
|-------|----------------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **API Protection** | Rate limiting (100 req/15 min per IP) |
| **Headers** | Helmet.js security headers |
| **Input Validation** | express-validator middleware |
| **CORS** | Configurable origin whitelist |

### Password Security

```javascript
// Pre-save middleware for password hashing
playerSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});
```

### Request Validation

All inputs are validated before processing:

```javascript
const playerValidation = {
  create: [
    body('Username').isLength({ min: 3, max: 30 }).trim(),
    body('Password').isLength({ min: 6 }),
    body('Age').isInt({ min: 1, max: 120 }),
    body('SexAtBirth').isIn(['Male', 'Female', 'Other'])
  ]
};
```

### Health Data Privacy

- No raw HealthKit data stored server-side
- Processed insights only transmitted after aggregation
- User consent required for data sharing with coaches
- Athletes control what metrics coaches can view

---

## Scalability Design

### Horizontal Scaling Architecture

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │    (Nginx)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   API Server  │   │   API Server  │   │   API Server  │
│   Instance 1  │   │   Instance 2  │   │   Instance n  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  MongoDB      │   │    Redis      │   │   MongoDB     │
│  Primary      │   │   Cluster     │   │   Replicas    │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Docker Containerization

```yaml
# Production-ready multi-container setup
services:
  mongodb:
    image: mongo:7.0
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      
  server:
    build: ./server
    depends_on:
      mongodb: { condition: service_healthy }
      redis: { condition: service_healthy }
    restart: unless-stopped
    
  client:
    build: ./client
    depends_on: [server]
```

### Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Database Indexing** | Compound indexes on Username, Name fields |
| **Connection Pooling** | Mongoose connection pooling |
| **Response Caching** | Redis for session and frequent queries |
| **Gzip Compression** | Nginx-level response compression |
| **Query Pagination** | Cursor-based pagination for large datasets |

---

## User-Centered Design

### Dual Dashboard System

**Athlete Dashboard** — Personal health insights:
- Real-time physiological metrics visualization
- Historical trend analysis with charts
- Personalized recovery recommendations
- Sleep quality and activity breakdowns

**Coach Dashboard** — Team health overview:
- Aggregate team performance metrics
- At-risk athlete identification
- Comparative analytics across roster
- Automated health status alerts

### Key User Needs Addressed

| User Pain Point | Syntra Solution |
|-----------------|-----------------|
| Athletes say "I'm fine" when they're not | Objective physiological data removes subjectivity |
| Coaches lack visibility between sessions | Continuous monitoring via wearables |
| Information overload from raw data | AI-summarized actionable insights |
| Privacy concerns with health data | Athlete-controlled data sharing |

---

## Project Structure

```
syntra/
├── client/                    # React Native mobile application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # App screens (Dashboard, Settings)
│   │   ├── hooks/             # Custom React hooks
│   │   └── services/          # API integration layer
│   ├── Dockerfile             # Client containerization
│   └── nginx.conf             # Production web server config
│
├── server/                    # Node.js backend API
│   ├── controllers/           # Request handlers
│   │   ├── playerController.js
│   │   └── trainerController.js
│   ├── models/                # Mongoose schemas
│   │   ├── Player.js          # Athlete data model
│   │   └── Trainer.js         # Coach data model
│   ├── routes/                # Express route definitions
│   ├── middleware/            # Validation & auth middleware
│   ├── server.js              # Application entry point
│   └── Dockerfile             # Server containerization
│
├── docker-compose.yml         # Multi-container orchestration
└── README.md                  # This file
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Docker & Docker Compose (recommended)

### Development Setup

```bash
# Clone repository
git clone https://github.com/RayhanXD/HealthTech-Accessability.git
cd HealthTech-Accessability

# Install and run the mobile client
cd client
npm install
npm run ios          # Start iOS simulator

# In a separate terminal, start the backend server
cd server
npm install
npm run dev          # Start development server with nodemon

# Or run the full stack with Docker (backend + database)
docker-compose up --build
```

### Environment Variables

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/syntra_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
```

### Verify Installation

```bash
# Health check
curl http://localhost:3001/health

# Expected response
{
  "success": true,
  "message": "Server is healthy",
  "database": "connected"
}
```

---

## Team

| Name | Role |
|------|------|
| Rayhan Mohammad | Tech |
| Namay Saini | Tech |
| Sandul Manage | Tech |
| Shriyaa Balaji | Tech |
| Praseedha Maddipatla | Product |
| Kavya Mandalapu | Product |
| Anjana Vankayalapati | Design |

---

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Standard** | $25/month | Single team, <10 athletes |
| **Premium** | $50/month | Single team, 10-30 athletes |
| **Organization** | $400/month | Multiple teams, <10 coaches |

### Market Opportunity

- **TAM**: 800,000 trainers/coaches worldwide
- **SAM**: 250,000 trainers/coaches in the US
- **SOM**: 25,000 high school coaches in Texas

---

## Roadmap

- [x] Core API with player/trainer management
- [x] MongoDB integration with Mongoose ODM
- [x] Docker containerization
- [x] Dual dashboard system
- [ ] Automated health alerts
- [ ] Customizable threshold settings
- [ ] AI-powered insights and recommendations
- [ ] Android wearable support

---

## Acknowledgments

- **Texas Convergent** — For the platform and mentorship
- **University of Texas at Austin** — Institutional support
- **Sahha SDK** — Health data integration
- **Apple HealthKit** — Wearable data access

---

<div align="center">
  <p><strong>Built with 💜 by Texas Convergent</strong></p>
  <p><em>Bringing Synergy to Training</em></p>
</div>
