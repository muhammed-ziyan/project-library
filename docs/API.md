# API Documentation

Complete API reference for the Project Library backend.

**Base URL**: `http://localhost:3000` (development)

All API responses follow a consistent format. Error responses use the [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details format.

## 🔐 Authentication

### Admin Authentication

Admin routes require the `x-admin-key` header:

```http
x-admin-key: your-admin-key-here
```

### User Authentication

User routes require a JWT token in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

Tokens are obtained from `/auth/login` or `/auth/register` endpoints.

## 📋 Table of Contents

- [Health Check](#health-check)
- [Projects](#projects)
- [Enrollments](#enrollments)
- [Authentication](#authentication-endpoints)
- [Submissions](#submissions)
- [Steps](#steps)
- [Admin](#admin)
- [Messages](#messages)
- [Activity](#activity)

---

## Health Check

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Projects

### GET /projects

List all projects with optional filtering.

**Query Parameters:**
- `classMin` (number, optional): Minimum class level
- `classMax` (number, optional): Maximum class level
- `level` (string, optional): Difficulty level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
- `guidance` (string, optional): Guidance level (`FULLY_GUIDED`, `SEMI_GUIDED`, `UNGUIDED`)
- `subject` (string, optional): Subject name
- `tag` (string, optional): Tag name
- `search` (string, optional): Search in title and description
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Example Request:**
```http
GET /projects?level=BEGINNER&classMin=8&classMax=12&page=1&limit=10
```

**Response:**
```json
{
  "projects": [
    {
      "id": "clx123...",
      "slug": "image-classifier",
      "title": "Image Classifier",
      "shortDesc": "Build an image classifier using ML",
      "longDesc": "Detailed description...",
      "classMin": 8,
      "classMax": 12,
      "level": "BEGINNER",
      "guidance": "FULLY_GUIDED",
      "subjects": ["Computer Science"],
      "tags": ["Machine Learning", "Python"],
      "tools": ["Python", "TensorFlow"],
      "durationHrs": 4,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /projects/:slug

Get a single project by slug.

**Path Parameters:**
- `slug` (string, required): Project slug

**Example Request:**
```http
GET /projects/image-classifier
```

**Response:**
```json
{
  "id": "clx123...",
  "slug": "image-classifier",
  "title": "Image Classifier",
  "shortDesc": "Build an image classifier using ML",
  "longDesc": "Detailed description...",
  "classMin": 8,
  "classMax": 12,
  "level": "BEGINNER",
  "guidance": "FULLY_GUIDED",
  "subjects": ["Computer Science"],
  "tags": ["Machine Learning", "Python"],
  "tools": ["Python", "TensorFlow"],
  "prerequisites": ["Basic Python"],
  "durationHrs": 4,
  "steps": [
    {
      "id": "step1",
      "order": 1,
      "title": "Setup Environment",
      "description": "Install required packages",
      "checklist": [
        {
          "id": "check1",
          "order": 1,
          "text": "Install Python 3.8+"
        }
      ],
      "resources": [
        {
          "id": "res1",
          "title": "Python Installation Guide",
          "url": "https://example.com",
          "type": "article"
        }
      ]
    }
  ],
  "submission": {
    "type": "FILE",
    "instruction": "Upload your trained model",
    "allowedTypes": ["zip", "pdf"]
  },
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Error Response (404):**
```json
{
  "type": "https://docs/errors/not-found",
  "title": "Project Not Found",
  "status": 404,
  "detail": "Project with slug 'invalid-slug' does not exist"
}
```

### POST /projects/import

Import a project from a JSON file (Admin only).

**Headers:**
```http
x-admin-key: your-admin-key
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (file, required): JSON file containing project data

**Example Request:**
```bash
curl -X POST http://localhost:3000/projects/import \
  -H "x-admin-key: your-admin-key" \
  -F "file=@project.json"
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "clx123...",
    "slug": "image-classifier",
    "title": "Image Classifier"
  }
}
```

**Error Response (400):**
```json
{
  "type": "https://docs/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "The project data does not meet the required format",
  "errors": [
    {
      "path": "title",
      "message": "String must contain at least 3 character(s)",
      "code": "too_small"
    }
  ]
}
```

### POST /projects/import-json

Import a project from JSON body (Admin only).

**Headers:**
```http
x-admin-key: your-admin-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "slug": "image-classifier",
  "title": "Image Classifier",
  "shortDesc": "Build an image classifier",
  "longDesc": "Detailed description...",
  "classRange": { "min": 8, "max": 12 },
  "level": "BEGINNER",
  "guidance": "FULLY_GUIDED",
  "subjects": ["Computer Science"],
  "tags": ["ML", "Python"],
  "tools": ["Python"],
  "steps": [...]
}
```

### POST /projects/import-batch

Import multiple projects from a batch file (Admin only).

**Headers:**
```http
x-admin-key: your-admin-key
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (file, required): YAML or JSON file containing array of projects

**Response:**
```json
{
  "success": true,
  "results": {
    "successful": [
      { "slug": "project-1", "title": "Project 1" },
      { "slug": "project-2", "title": "Project 2" }
    ],
    "failed": [
      {
        "slug": "project-3",
        "error": "Validation failed",
        "details": [...]
      }
    ],
    "total": 3
  },
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  }
}
```

---

## Enrollments

### POST /enrollments

Create a new enrollment.

**Request Body:**
```json
{
  "projectId": "clx123...",
  "email": "student@example.com",
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "school": "Example School",
  "classNum": 10
}
```

**Response:**
```json
{
  "enrollmentId": "enroll123...",
  "projectSlug": "image-classifier",
  "message": "Enrollment created successfully"
}
```

### GET /enrollments/:id

Get enrollment details.

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Response:**
```json
{
  "id": "enroll123...",
  "projectId": "clx123...",
  "email": "student@example.com",
  "name": "John Doe",
  "school": "Example School",
  "classNum": 10,
  "createdAt": "2024-01-15T10:00:00Z",
  "lastActivityAt": "2024-01-15T11:00:00Z",
  "timeSpentMinutes": 120,
  "project": {
    "id": "clx123...",
    "slug": "image-classifier",
    "title": "Image Classifier",
    "steps": [...]
  },
  "progress": [
    {
      "stepId": "step1",
      "checklistId": "check1",
      "completed": true,
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "group": {
    "id": "group123...",
    "teamLeaderId": "user123...",
    "secondMemberName": "Jane Doe",
    "secondMemberEmail": "jane@example.com"
  }
}
```

### POST /enrollments/:id/group-member

Add a group member to an enrollment (User authenticated).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+1234567891",
  "school": "Example School",
  "classNum": 10
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    "id": "group123...",
    "teamLeaderId": "user123...",
    "secondMemberName": "Jane Doe"
  },
  "enrollment": {
    "id": "enroll123...",
    "groupId": "group123..."
  }
}
```

### POST /enrollments/:id/unassign

Unassign user from enrollment (User authenticated).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Response:**
```json
{
  "success": true,
  "message": "Enrollment unassigned successfully"
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "enrollmentId": "enroll123...",
  "phoneNumber": "+1234567890",
  "password": "securepassword",
  "name": "John Doe",
  "school": "Example School",
  "classNum": 10
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123...",
    "phoneNumber": "+1234567890",
    "email": "student@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "type": "https://docs/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invalid phone number format. Please use international format (e.g., +1234567890)"
}
```

### POST /auth/login

Login with phone number and password.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123...",
    "phoneNumber": "+1234567890",
    "email": "student@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "type": "https://docs/errors/auth",
  "title": "Authentication Failed",
  "status": 401,
  "detail": "Invalid phone number or password"
}
```

### GET /auth/me

Get current user profile (User authenticated).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "user123...",
  "phoneNumber": "+1234567890",
  "email": "student@example.com",
  "name": "John Doe",
  "school": "Example School",
  "classNum": 10,
  "enrollments": [
    {
      "id": "enroll123...",
      "projectId": "clx123...",
      "project": {
        "slug": "image-classifier",
        "title": "Image Classifier"
      },
      "group": {
        "id": "group123...",
        "secondMemberName": "Jane Doe"
      }
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## Submissions

### POST /enrollments/:id/submissions

Create a submission for an enrollment.

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Request Body (multipart/form-data):**
- For FILE type: `file` (file, required)
- For LINK type: `url` (string, required)
- For TEXT type: `text` (string, required)

**Example Request (FILE):**
```bash
curl -X POST http://localhost:3000/enrollments/enroll123/submissions \
  -F "file=@submission.zip"
```

**Example Request (LINK):**
```bash
curl -X POST http://localhost:3000/enrollments/enroll123/submissions \
  -F "url=https://example.com/project"
```

**Example Request (TEXT):**
```bash
curl -X POST http://localhost:3000/enrollments/enroll123/submissions \
  -F "text=Project description and findings..."
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub123...",
    "enrollmentId": "enroll123...",
    "urlOrText": "https://example.com/submission.zip",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### GET /enrollments/:id/submissions

Get submissions for an enrollment.

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Response:**
```json
{
  "submissions": [
    {
      "id": "sub123...",
      "enrollmentId": "enroll123...",
      "urlOrText": "https://example.com/submission.zip",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

## Steps

### PATCH /enrollments/:id/steps/:stepId/checklist/:checklistId

Update checklist item completion status.

**Path Parameters:**
- `id` (string, required): Enrollment ID
- `stepId` (string, required): Step ID
- `checklistId` (string, required): Checklist item ID

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "id": "progress123...",
    "enrollmentId": "enroll123...",
    "stepId": "step1",
    "checklistId": "check1",
    "completed": true,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### PATCH /enrollments/:id/steps/:stepId

Update step completion status.

**Path Parameters:**
- `id` (string, required): Enrollment ID
- `stepId` (string, required): Step ID

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Step completion updated"
}
```

---

## Admin

### POST /admin/login

Admin login.

**Request Body:**
```json
{
  "username": "admin",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "admin-jwt-token...",
  "admin": {
    "id": "admin123...",
    "username": "admin"
  }
}
```

### GET /admin/users

List all users (Admin authenticated).

**Headers:**
```http
x-admin-key: your-admin-key
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search in name, email, phone

**Response:**
```json
{
  "users": [
    {
      "id": "user123...",
      "phoneNumber": "+1234567890",
      "email": "student@example.com",
      "name": "John Doe",
      "school": "Example School",
      "classNum": 10,
      "enrollmentsCount": 3,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /admin/analytics

Get analytics data (Admin authenticated).

**Headers:**
```http
x-admin-key: your-admin-key
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalEnrollments": 300,
  "totalProjects": 25,
  "activeEnrollments": 200,
  "completedEnrollments": 100,
  "enrollmentsByLevel": {
    "BEGINNER": 150,
    "INTERMEDIATE": 100,
    "ADVANCED": 50
  }
}
```

---

## Messages

### GET /messages

Get messages for current user (User authenticated).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `type` (string, optional): Filter by type (`ANNOUNCEMENT`, `DIRECT`, `SYSTEM`)
- `unreadOnly` (boolean, optional): Only unread messages

**Response:**
```json
{
  "messages": [
    {
      "id": "msg123...",
      "type": "ANNOUNCEMENT",
      "title": "New Projects Available",
      "content": "Check out our new AI projects...",
      "read": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### PATCH /messages/:id/read

Mark message as read (User authenticated).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (string, required): Message ID

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

## Activity

### GET /enrollments/:id/activity

Get activity log for an enrollment.

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Query Parameters:**
- `type` (string, optional): Filter by activity type
- `limit` (number, optional): Number of activities to return

**Response:**
```json
{
  "activities": [
    {
      "id": "act123...",
      "enrollmentId": "enroll123...",
      "activityType": "PAGE_VIEW",
      "metadata": {
        "page": "enrollment_detail"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Error Responses

All error responses follow the RFC 7807 Problem Details format:

```json
{
  "type": "https://docs/errors/{error-type}",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed error message",
  "errors": [
    {
      "path": "fieldName",
      "message": "Field-specific error message",
      "code": "error_code"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

## CORS

CORS is configured to allow requests from the frontend origin. In development, this is typically `http://localhost:5000`.

---

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)

