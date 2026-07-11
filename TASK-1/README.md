# Mini Social Media Platform

A full-stack assignment project for sharing posts, commenting, liking posts, and following people. It uses a vanilla HTML/CSS/JavaScript client and an Express/MongoDB REST API.

## Features

- JWT registration, login, logout, protected API routes, hashed passwords, validation, and request sanitization
- User profiles with biography and profile-picture upload
- Create, view, edit, and delete posts, including an optional image
- Add, view, and delete comments
- Toggle likes, limited to one per user per post
- Follow/unfollow users, with automatically maintained follower/following totals
- Responsive home feed, profile view, and edit-profile experience

## Folder structure

```
mini-social-media/
├── client/
│   ├── css/styles.css
│   ├── js/api.js
│   ├── js/app.js
│   ├── js/auth.js
│   ├── js/profile.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── profile.html
├── server/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md
```

## Install and run

1. Create a MongoDB Atlas cluster and database user. In Atlas Network Access, allow the IP address from which you will run the server.
2. In `server`, copy `.env.example` to `.env` and set `MONGODB_URI` and a long, unique `JWT_SECRET`.
3. Install and start the API:

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. Serve `client` with a local static server (for example, VS Code Live Server) at `http://localhost:5500`. If you choose another origin, update `CLIENT_URL` in `server/.env`.
5. Open `http://localhost:5500/login.html`.

The client expects the API at `http://localhost:5000/api`. For another API address, set `localStorage.apiUrl` in the browser console before signing in.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Allowed client origin for CORS |

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| POST | `/api/auth/logout` | Client logout acknowledgement |
| GET | `/api/users/profile` | Get the signed-in profile |
| PUT | `/api/users/profile` | Update profile / profile picture |
| GET | `/api/users/:id` | Get a user profile and their posts |
| POST | `/api/users/:id/follow` | Follow or unfollow a user |
| GET | `/api/posts` | Get feed posts |
| POST | `/api/posts` | Create a post (multipart image optional) |
| PUT | `/api/posts/:id` | Update an owned post |
| DELETE | `/api/posts/:id` | Delete an owned post |
| POST | `/api/posts/:id/like` | Like or unlike a post |
| GET | `/api/comments/:postId` | View post comments |
| POST | `/api/comments/:postId` | Add a comment |
| DELETE | `/api/comments/:id` | Delete an owned comment |

All endpoints other than registration and login require `Authorization: Bearer <token>`.

## Deployment

Deploy the server to a Node-compatible host, configure the environment variables there, and permit the deployed client URL with `CLIENT_URL`. Deploy `client` as static files, then set its API address in local storage if it differs from the default local address. Use persistent storage for `uploads` in a production deployment.

## Future improvements

- Paginate feed and comments
- Move uploaded images to object storage
- Add automated API and UI tests
- Add rate limiting and email verification
