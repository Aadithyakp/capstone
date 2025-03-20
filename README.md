# GymPal - Fitness Management System

## Project Overview
GymPal is a comprehensive fitness management system that connects gym owners, instructors, and members. It provides features for gym management, class scheduling, member enrollment, and profile management.

## Technology Stack
- **Frontend**: React.js with CSS Modules
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Security**: bcrypt for password hashing, reCAPTCHA for form protection

## Project Structure

```
Sprint 1/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions and API calls
│   │   ├── assets/          # Static assets (images, icons)
│   │   └── App.jsx          # Main application component
│   └── package.json         # Frontend dependencies
│
└── backend/                  # Node.js backend application
    ├── models/              # MongoDB schemas
    ├── routes/              # API routes
    ├── middleware/          # Custom middleware
    └── server.js            # Server entry point
```

## Core Features

### 1. Authentication System
- **Registration Flow**:
  ```javascript
  // 1. User submits registration form
  // 2. Frontend validates data and uploads profile picture to Cloudinary
  // 3. Backend verifies reCAPTCHA
  // 4. Password is hashed using bcrypt
  // 5. User data is saved to MongoDB
  // 6. JWT token is generated and returned
  ```

- **Login Flow**:
  ```javascript
  // 1. User submits credentials
  // 2. Backend verifies username/email and password
  // 3. JWT token is generated and returned
  // 4. Token is stored in localStorage
  ```

### 2. User Roles and Permissions
- **Member**: Can browse gyms, enroll in classes, view profile
- **Gym Owner**: Can manage gym details, create/edit classes
- **Admin**: Full system access
- **Instructor**: Can manage assigned classes

### 3. Member Dashboard
- **Components**:
  - Profile section with user details
  - Membership status display
  - Gym search functionality
  - Class enrollment system
  - Booking history

- **Data Flow**:
  ```javascript
  // 1. Initial Load
  useEffect(() => {
    // Fetch user profile and gym data simultaneously
    const [userProfile, gyms] = await Promise.all([
      getUserProfile(),
      getAllGyms()
    ]);
  });

  // 2. Search Implementation
  const filteredGyms = useMemo(() => {
    // Filter gyms based on search query
    return gyms.filter(gym => 
      gym.name.toLowerCase().includes(query)
    );
  }, [gyms, query]);

  // 3. Class Enrollment
  const handleEnroll = async (gymId, classId) => {
    // Verify membership status
    // Check class availability
    // Process enrollment
    // Update UI
  };
  ```

### 4. Gym Owner Dashboard
- **Features**:
  - Gym profile management
  - Class schedule management
  - Member statistics
  - Instructor assignment

- **Class Management Flow**:
  ```javascript
  // 1. Create/Edit Class
  const handleClassSubmit = async (classData) => {
    // Validate time slots
    // Check instructor availability
    // Update database
    // Refresh schedule
  };
  ```

### 5. API Structure

#### Authentication Routes
```javascript
POST /api/auth/register    // User registration
POST /api/auth/login       // User login
GET  /api/auth/verify      // Token verification
```

#### User Routes
```javascript
GET    /api/users/profile          // Get user profile
PUT    /api/users/profile          // Update profile
PUT    /api/users/status           // Update membership
DELETE /api/users/account          // Delete account
```

#### Gym Routes
```javascript
POST   /api/gyms                   // Create gym
GET    /api/gyms                   // List all gyms
GET    /api/gyms/:id              // Get gym details
PUT    /api/gyms/:id              // Update gym
DELETE /api/gyms/:id              // Delete gym
```

#### Class Routes
```javascript
POST   /api/gyms/:id/classes      // Create class
GET    /api/gyms/:id/classes      // List classes
PUT    /api/gyms/:id/classes/:cid // Update class
DELETE /api/gyms/:id/classes/:cid // Delete class
```

### 6. Database Schema

#### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  full_name: String,
  role: String,
  status: String,
  profile_picture: String,
  plan: String,
  remaining_bookings: Number
}
```

#### Gym Schema
```javascript
{
  name: String,
  description: String,
  owner: ObjectId,
  address: {
    street: String,
    city: String,
    state: String
  },
  classes: [ClassSchema]
}
```

#### Class Schema
```javascript
{
  name: String,
  instructor: ObjectId,
  schedule: {
    day: String,
    time: String
  },
  capacity: Number,
  enrolled: [ObjectId]
}
```

## Performance Optimizations

### 1. Frontend Optimizations
- Memoized components and callbacks
- Efficient state management
- Optimized re-renders
- Image lazy loading

### 2. Backend Optimizations
- Request caching
- API response optimization
- Efficient database queries
- Rate limiting

### 3. Security Measures
- JWT authentication
- Password hashing
- reCAPTCHA integration
- Input validation
- XSS protection

## Error Handling
- Custom error classes
- Consistent error responses
- Graceful degradation
- User-friendly error messages

## Future Enhancements
1. Real-time notifications
2. Payment integration
3. Advanced analytics
4. Mobile application
5. Class attendance tracking

## Running the Project

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env

# Start the application
npm run dev
```

### Environment Variables
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_key
```

## Testing
- Unit tests for components
- Integration tests for API
- End-to-end testing
- Performance testing

## Deployment
- Frontend deployed on Vercel/Netlify
- Backend deployed on Heroku
- MongoDB Atlas for database
- Cloudinary for image storage

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
