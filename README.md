# FitTrack Rwanda

A comprehensive digital fitness ecosystem for the Rwandan market, combining an e-commerce platform for gym equipment with an advanced fitness tracking and subscription system.

## 🚀 Features

1. **User Authentication:** JWT-based secure auth with Role-Based Access Control (Admin/User).
2. **E-Commerce:** Browse premium fitness gear, advanced search & filtering, and a persistent shopping cart.
3. **Checkout & Orders:** Complete order management system.
4. **Mobile Money Integration:** Strategy-pattern based payment integration ready for MTN MoMo and Airtel Money.
5. **Subscription Plans:** Basic, Premium, and Annual fitness tracking plans.
6. **Fitness Tracking:** Log weight, body measurements, calories, and workouts.
7. **Admin Dashboard:** Manage users, products, orders, and view platform statistics.
8. **Premium UI/UX:** Built with Bootstrap 5 featuring a dark, glassmorphism aesthetic inspired by Rwandan vibrancy.

## 🛠 Tech Stack

- **Frontend:** HTML5, Vanilla CSS3 (Glassmorphism), JavaScript, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0 (with raw SQL queries via mysql2/promise)
- **Deployment:** Docker & Docker Compose

## 🐳 Quick Start (Docker)

The application is completely containerized. You do not need Node.js or MySQL installed locally.

1. **Clone the repository** (if using Git):
   ```bash
   git clone <repo-url>
   cd fittrack-rwanda
   ```

2. **Configure Environment:**
   Copy the example env file:
   ```bash
   cp .env.example .env
   ```

3. **Run with Docker Compose:**
   ```bash
   docker compose up --build
   ```

4. **Access the Application:**
   - Web App: [http://localhost:3000](http://localhost:3000)
   - API Base: `http://localhost:3000/api`

## 👥 Default Accounts

The database migrations automatically create an Admin user for testing:
- **Email:** `admin@fittrack.rw`
- **Password:** `admin123`

## 📂 Project Structure Overview

The backend uses a clean **Controller-Service-Route** architecture.
- `src/controllers/`: Handles HTTP requests and responses
- `src/services/`: Contains core business logic and database queries
- `src/routes/`: Express router definitions
- `src/database/migrations/`: SQL files for auto-migration
- `public/`: Static frontend assets (HTML, CSS, JS)

## 🧪 Testing

To run backend tests (once implemented):
```bash
docker compose exec app npm test
```

## 📝 License

Proprietary - FitTrack Rwanda. All rights reserved.
