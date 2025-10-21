# Convergent Backend API

A Node.js/Express backend API for the Convergent HealthTech platform with MongoDB integration.

## Features

- **MongoDB Integration**: Uses Mongoose ODM for database operations
- **Player Management**: Full CRUD operations for player profiles and insights
- **Trainer Management**: Full CRUD operations for trainer profiles and player assignments
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Helmet for security headers, rate limiting, CORS protection
- **Error Handling**: Global error handling with detailed error responses
- **Logging**: Morgan for HTTP request logging
- **Health Checks**: Built-in health check endpoints
- **Docker Support**: Ready for containerization

## API Endpoints

### Players

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players` | Get all players (with filtering & pagination) |
| GET | `/api/players/:id` | Get single player by ID |
| POST | `/api/players` | Create new player |
| PUT | `/api/players/:id` | Update player |
| DELETE | `/api/players/:id` | Delete player |
| PUT | `/api/players/:id/insights` | Update player insights |
| POST | `/api/players/:id/trends` | Add trend to player |
| POST | `/api/players/:id/comparisons` | Add comparison to player |

### Trainers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trainers` | Get all trainers (with filtering & pagination) |
| GET | `/api/trainers/:id` | Get single trainer by ID |
| POST | `/api/trainers` | Create new trainer |
| PUT | `/api/trainers/:id` | Update trainer |
| DELETE | `/api/trainers/:id` | Delete trainer |
| GET | `/api/trainers/:id/players` | Get trainer's players |
| POST | `/api/trainers/:id/players` | Add player to trainer |
| DELETE | `/api/trainers/:id/players/:playerId` | Remove player from trainer |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/` | API documentation and available routes |

## Data Models

### Player Schema

```javascript
{
  Username: String (required, unique, 3-30 chars),
  Password: String (required, min 6 chars, hashed),
  fName: String (required, max 50 chars),
  Lname: String (required, max 50 chars),
  Age: Number (required, 1-120),
  Bodyweight_in_pounds: Number (required, 1-1000),
  Height_in_inches: Number (required, 1-120),
  SexAtBirth: String (required, enum: ['Male', 'Female', 'Other']),
  Insights: {
    Trends: [{
      Category: String,
      Name: String,
      State: String,
      isHigherBetter: Boolean,
      valueRange: Number,
      Unit: String,
      trendStartTime: String,
      trendEndTime: String,
      Data: [{
        StartDateTime: String,
        endDateTime: String,
        Value: Number,
        percentChangeFromPrevious: Number
      }]
    }],
    Comparisons: [{
      Category: String,
      Name: String,
      Value: String,
      Unit: String,
      isHigherBetter: Boolean,
      startDateTime: String,
      endDateTime: String,
      Data: [{
        Type: String,
        Value: String
      }],
      Percentile: Number,
      Difference: String,
      percentageDifference: String,
      State: String,
      Properties: Object
    }]
  }
}
```

### Trainer Schema

```javascript
{
  User: String (required, unique, 3-30 chars),
  Password: String (required, min 6 chars, hashed),
  fName: String (required, max 50 chars),
  lname: String (required, max 50 chars),
  Players: [ObjectId] (references to Player documents)
}
```

## Query Parameters

### Players Endpoint (`GET /api/players`)

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name and username
- `sex`: Filter by sex at birth
- `minAge`: Minimum age filter
- `maxAge`: Maximum age filter

### Trainers Endpoint (`GET /api/trainers`)

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name and username

## Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Docker (optional)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or start your local MongoDB service
   ```

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Docker Setup

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build the server image:**
   ```bash
   docker build -t convergent-server .
   docker run -p 3001:3001 convergent-server
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/convergent_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // Only for list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation for all inputs
- **Password Hashing**: bcrypt with salt rounds
- **Error Handling**: No sensitive data in error responses

## Development

### Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (when implemented)

### Project Structure

```
server/
├── controllers/          # Route controllers
│   ├── playerController.js
│   └── trainerController.js
├── middleware/           # Custom middleware
│   └── validation.js
├── models/              # Mongoose models
│   ├── Player.js
│   └── Trainer.js
├── routes/              # Express routes
│   ├── playerRoutes.js
│   └── trainerRoutes.js
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies and scripts
├── server.js           # Main application file
└── README.md           # This file
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Get all players
curl http://localhost:3001/api/players

# Create a player
curl -X POST http://localhost:3001/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "testplayer",
    "Password": "password123",
    "fName": "John",
    "Lname": "Doe",
    "Age": 25,
    "Bodyweight_in_pounds": 180,
    "Height_in_inches": 72,
    "SexAtBirth": "Male"
  }'
```

### Using Postman

Import the API endpoints into Postman and test the full CRUD operations.

## Contributing

1. Follow the existing code style
2. Add validation for new endpoints
3. Include error handling
4. Update documentation
5. Test your changes

## License

ISC
