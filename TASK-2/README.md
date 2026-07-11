# Mini Social Media Platform

Assignment project using vanilla HTML/CSS/JavaScript, Express, and MongoDB Atlas.

## Features

- JWT authentication with bcrypt password hashing
- User profiles, biography, and profile-picture upload
- Create, edit, delete, and view posts with optional images
- Add and view comments
- Like/unlike posts (one like per user)
- Follow/unfollow users with follower/following counts

## Setup

1. In `server`, copy `.env.example` to `.env` and configure your MongoDB Atlas URI and JWT secret.
2. Run `npm install`, then `npm run dev` from `server`.
3. Serve the `client` folder on `http://localhost:5500` and open `login.html`.

## API

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`  
`GET|PUT /api/users/profile`, `GET /api/users/:id`, `POST /api/users/:id/follow`  
`GET|POST /api/posts`, `PUT|DELETE /api/posts/:id`, `POST /api/posts/:id/like`  
`GET|POST /api/comments/:postId`, `DELETE /api/comments/:id`

All non-auth endpoints require `Authorization: Bearer <token>`.
