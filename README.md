# Backend API Documentation

This document provides an overview of the backend API endpoints and their usage.

## Authentication API

### Register a new user

- **URL**: `/v1/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "ComplexPassword123!"
  }
  ```
- **Response**: User object and authentication tokens

### Login with email and password

- **URL**: `/v1/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "ComplexPassword123!"
  }
  ```
- **Response**: User object and authentication tokens

### Register with Clerk

- **URL**: `/v1/auth/clerk/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "clerk_jwt_token",
    "userData": {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```
- **Response**: User object and authentication tokens

### Login with Clerk

- **URL**: `/v1/auth/clerk/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "clerk_jwt_token"
  }
  ```
- **Response**: User object and authentication tokens

### Get current session

- **URL**: `/v1/auth/session`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: User session information

### Logout

- **URL**: `/v1/auth/logout`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token_value"
  }
  ```
- **Response**: 204 No Content

### Refresh tokens

- **URL**: `/v1/auth/refresh-tokens`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token_value"
  }
  ```
- **Response**: New access and refresh tokens

## Contracts API

### Create a contract

- **URL**: `/v1/contracts`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "title": "Contract Title",
    "content": "Contract content...",
    "parties": ["user1@example.com", "user2@example.com"],
    "status": "draft"
  }
  ```
- **Response**: Created contract object

### Get all contracts

- **URL**: `/v1/contracts`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `limit`: Number of items per page (default: 10)
  - `page`: Page number (default: 1)
  - `status`: Filter by status
  - `title`: Search by title
  - `sortBy`: Sort field and direction (e.g., `createdAt:desc`)
- **Response**: Paginated list of contracts

### Get a contract by ID

- **URL**: `/v1/contracts/:id`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Contract object

### Update a contract

- **URL**: `/v1/contracts/:id`
- **Method**: `PATCH`
- **Headers**: Authorization: Bearer {token}
- **Body**: Contract fields to update
- **Response**: Updated contract object

### Delete a contract

- **URL**: `/v1/contracts/:id`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: 204 No Content

### Create a contract version

- **URL**: `/v1/contracts/:id/versions`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "Updated contract content...",
    "comments": "Updated terms for section 3"
  }
  ```
- **Response**: Created contract version object

### Get all versions of a contract

- **URL**: `/v1/contracts/:id/versions`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: List of contract versions

## User API

### Get current user

- **URL**: `/v1/users/me`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: User profile information

### Update current user

- **URL**: `/v1/users/me`
- **Method**: `PATCH`
- **Headers**: Authorization: Bearer {token}
- **Body**: User fields to update
- **Response**: Updated user object

## Error Handling

All API endpoints use consistent error responses with the following format:

```json
{
  "code": 400,
  "message": "Description of the error"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Development

To run the backend locally:

```bash
npm install
npm run dev
```

The server will start on port 3000 or the port specified in the .env file.
