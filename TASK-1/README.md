# Northstar Simple E-commerce Store

An assignment-ready e-commerce site with product listings, product details in the catalog, a browser cart, order processing, user registration/login, MongoDB storage, and a responsive vanilla JavaScript interface.

## Run locally

1. Copy `.env.example` to `.env` and add a MongoDB Atlas connection string and secure JWT secret.
2. Run `npm install`.
3. Run `npm start` and open `http://localhost:5000`.

The first startup automatically adds six starter products if the product collection is empty.

## Deploy to Render

1. Upload this folder to a GitHub repository.
2. In Render, choose **New → Blueprint** and select the repository. `render.yaml` configures the service.
3. Enter `MONGODB_URI` when Render asks for it. The JWT secret is generated automatically.
4. Deploy. Render hosts both the site and the API from one URL.

Alternatively, use the included `Dockerfile` with any Docker-compatible host.

## Security and data

Passwords are bcrypt-hashed. Orders are associated with the signed-in user. Product inventory is reduced when an order is placed. This project intentionally does not collect payment details; it models order placement only.
