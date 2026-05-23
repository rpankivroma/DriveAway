# DriveAway - Premium Car Rental Platform

DriveAway is a modern, full-stack car rental platform built with **Next.js** for the frontend and **FastAPI** for the backend. It features a sleek, responsive design and a robust API for managing vehicle listings and bookings.

## 🚀 Features

- **Dynamic Car Listings**: Browse available vehicles with category and price information.
- **Advanced Filtering & Sorting**: Filter cars by price range, transmission, fuel type, passenger capacity, luggage space, and features. Sort by price, newest, or recommended.
- **Detailed Product Pages**: View specific car details, specifications, and select additional services.
- **Admin Dashboard**:
  - **Real-time Analytics**: Monitor monthly revenue, total bookings, and customer engagement.
  - **Fleet Management**: Full CRUD operations for vehicles with status tracking and **physical photo upload** support.
  - **Booking Control**: Centralized view of all rentals with status filtering, search, and **cancellation/dispute management**.
  - **Customer Insights**: Detailed profiles with booking history and financial summaries.
  - **Features & Discounts**: Manage rental duration discounts and additional services (insurance, GPS, etc.) with dynamic icons. **Discounts are automatically applied and displayed on product pages based on rental duration.**
  - **Support Integration**: Quick access to technical support via a dedicated Discord community modal.
- **User Profile Management**:
  - **Personal Information**: View and manage account details.
  - **Email Verification**: Secure registration flow with 6-digit email verification codes.
  - **Password Management**: 
    - Securely update account credentials with current password verification.
    - **Forgot Password**: Self-service password recovery via email verification codes.
  - **Booking History**: Track upcoming and completed rentals.
  - **Payment Methods**: Manage multiple saved cards with strict validation (16-digit numeric check and future expiration date enforcement) and the ability to delete existing ones.
- **JWT-Based Authentication**: Secure user registration and login using JWT tokens and bcrypt password hashing.
- **Protected Routes**: User profiles and booking features are protected and require a valid session.
- **Dynamic UI**: Header and navigation adapt in real-time to the user's authentication state **with robust hydration handling and cross-component synchronization**.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Polished Experience**: Modern aesthetic with toast notifications (`sonner`) and smooth animations.

## 🛠️ Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python), [Passlib](https://passlib.readthedocs.io/) (Auth), [python-jose](https://python-jose.readthedocs.io/) (JWT)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/) for production)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (Async with `asyncpg`)
- **Containerization**: [Docker](https://www.docker.com/)
- **Frontend**: 
  - [Next.js](https://nextjs.org/) (React Framework)
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
  - [Framer Motion](https://www.framer.com/motion/) (Animations)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [Recharts](https://recharts.org/) (Data Visualization)

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.11 or higher)
- **PostgreSQL Server** (e.g., [Neon](https://neon.tech/), local installation, or Docker)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd driveaway-monorepo
```

### 2. Install Dependencies

Install root and workspace dependencies:
```bash
npm install
```

Install backend dependencies (it is recommended to use a virtual environment):
```bash
pip install -r backend/requirements.txt
```

### 3. Environment Configuration

#### Backend (`/backend/.env`)
1. Navigate to the `backend` directory.
2. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update `DATABASE_URL` or individual `DB_` variables to match your PostgreSQL setup.
   - For Neon/Render: Use the provided connection string (should start with `postgresql://`).

#### Frontend (`/frontend/.env.local`)
1. Navigate to the `frontend` directory.
2. Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g., `http://localhost:8000` for local dev).

### 4. Database Setup

1. Run the database migrations to create the necessary tables:
   ```bash
   cd backend
   alembic upgrade head
   cd ..
   ```

   > **Note**: If you encounter an error like `Can't locate revision identified by '...'`, run `alembic stamp head` to sync your database version with the migration files, then try the upgrade again.

### 5. Running the Application

Start both the frontend and backend development servers using the root command:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 6. Running Tests

The backend includes a suite of unit tests for services and schemas. To run them:

```bash
cd backend
pytest
```

For more details, see the [Backend Testing README](backend/tests/README.md).

### 🔍 Health Checks

You can verify the status of the application and database using these endpoints:

- **Backend Health**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Database Health**: [http://localhost:8000/db-status](http://localhost:8000/db-status)

---

## 📂 Project Structure

The project follows a monorepo architecture with a clear separation of concerns:

### Backend (`/backend`)
FastAPI application following a modular architecture:
- **`app/`**: Main application package.
  - **`api/`**: API route handlers (routers) organized by resource.
  - **`core/`**: Core configuration, security (JWT, hashing), and dependencies.
  - **`db/`**: Database connection setup and base model definitions.
  - **`models/`**: SQLAlchemy database models.
  - **`repositories/`**: Data access layer for CRUD operations.
  - **`schemas/`**: Pydantic models for request/response validation and serialization.
  - **`services/`**: Business logic layer that orchestrates repositories and models.
  - **`main.py`**: Application entry point and middleware configuration.
- **`tests/`**: Unit tests for services and schemas using `pytest`.
- **`migrations/`**: Alembic database migration scripts.
- **`static/uploads/cars/`**: Storage for dynamic assets (car photos uploaded via Admin).

### Frontend (`/frontend`)
Next.js application using the App Router:
- **`src/app/`**: Pages, layouts, and route handlers.
- **`src/components/`**: Reusable UI components (buttons, modals, cards).
- **`src/features/`**: Feature-specific components and logic (e.g., admin dashboard, car catalog).
- **`src/shared/`**: Shared utilities, constants, and hooks.
- **`src/store/`**: Client-side state management using Zustand.
- **`src/types/`**: Global TypeScript type definitions.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Register a new user account.
- `POST /login`: Authenticate user and return a JWT access token.
- `POST /forgot-password`: Request a password reset code via email.
- `POST /reset-password`: Reset password using a verification code.
- `POST /verify-email`: Verify user email using a 6-digit code.
- `POST /resend-verification`: Resend the email verification code.

### User Profile (`/api/users`)
- `GET /me`: Fetch current user profile with booking history and payment methods.
- `PUT /me`: Update user personal information.
- `POST /change-password`: Update account password (requires current password).
- `POST /cards`: Add a new payment card to the user's profile with strict validation (16-digit numeric check and future expiration date enforcement).
- `DELETE /cards/{card_id}`: Remove a specific payment card.

### Discounts (`/api/discounts`)
- `GET /`: List all available rental duration discounts (Public).

### Cars Catalog (`/api/cars` & `/api/catalog`)
- `GET /`: List all vehicles with advanced filtering (price, transmission, etc.) and pagination.
- `GET /makes`: Retrieve a list of all available car brands.
- `GET /categories`: Retrieve a list of all car categories.
- `GET /{car_id}`: Fetch detailed information for a specific vehicle.

### Bookings (`/api/bookings`)
- `POST /`: Create a new car rental booking.
- `GET /`: List all bookings for the authenticated user.
- `GET /{booking_id}`: Get detailed information for a specific booking.
- `POST /{booking_id}/cancel`: Cancel an existing booking.

### Services (`/api/services`)
- `GET /`: List all available additional services (Insurance, GPS, etc.).

### Management (Admin) (`/api/admin`)
- **Dashboard**:
  - `GET /stats`: Business analytics, revenue trends, and booking summaries.
- **Fleet**:
  - `GET /cars`: List all vehicles in the fleet.
  - `POST /cars`: Add a new vehicle to the catalog.
  - `PUT /cars/{car_id}`: Update vehicle specifications or status.
  - `DELETE /cars/{car_id}`: Remove a vehicle from the fleet.
  - `POST /cars/upload`: Upload a physical photo for a vehicle.
- **Bookings**:
  - `GET /bookings`: Centralized view of all system bookings with filters.
  - `POST /bookings/{booking_id}/cancel`: Admin-level booking cancellation.
  - `POST /bookings/{booking_id}/dispute`: Flag a booking for dispute resolution.
- **Customers**:
  - `GET /users`: List all registered customers with search.
  - `GET /users/{user_id}`: View detailed customer profile and history.
- **Discounts**:
  - `GET /discounts`: List all rental duration discounts.
  - `POST /discounts`: Create a new discount rule.
  - `PUT /discounts/{id}`: Update an existing discount.
  - `DELETE /discounts/{id}`: Remove a discount rule.
- **Services**:
  - `GET /services`: Manage additional services catalog.
  - `POST /services`: Add a new service.
  - `PUT /services/{id}`: Update service details.
  - `DELETE /services/{id}`: Remove a service.
- **Settings**:
  - `GET /settings`: Retrieve admin profile settings.
  - `POST /settings`: Update admin profile.
  - `POST /change-password`: Securely change admin password.

### System
- `GET /api/health`: Check if the backend is reachable.
- `GET /db-status`: Check the database connection health.

---

## 🚢 Deployment Guide

### 1. Database (Neon)
1. Create a project at [Neon](https://neon.tech/).
2. Copy the **Connection String**.
3. It should look like: `postgres://user:password@host/dbname`. The backend will automatically convert this to an async-compatible string (`postgresql+asyncpg://`).

### 2. Backend (Render via Docker)
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set **Runtime** to `Docker`.
4. Add **Environment Variables**:
   - `DATABASE_URL`: Your Neon connection string.
   - Any other secrets from your `.env` file.
5. Render will build and deploy the `Dockerfile` located in the `/backend` directory.

### 3. Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com/).
2. Select your repository and set the **Root Directory** to `frontend`.
3. Select **Next.js** framework preset.
4. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL from Render (e.g., `https://driveaway-api.onrender.com`).
5. Deploy.

---

## 🛠️ Recent Improvements

- **PostgreSQL & Docker Migration**: Switched the database from MySQL to PostgreSQL for better cloud compatibility (Neon) and added Docker support for standardized deployments.
- **Dynamic API Configuration**: Updated the frontend to use `NEXT_PUBLIC_API_URL`, allowing it to connect to any deployed backend.
- **Admin Booking Management**: Added `cancel_booking` and `dispute_booking` functionality for admins to manage problematic rentals directly from the dashboard.
- **Frontend Auth Synchronization**: Implemented a custom `auth-change` event system to keep the Header and other components perfectly in sync with the user's authentication state across the application.
- **Improved UX Notifications**: Replaced browser `alert()` calls with modern toast notifications using `sonner` for a more polished and less intrusive user experience.
- **Header Hydration & State Persistence**: Resolved issues where the header would flicker or incorrectly show a "Logged out" state during initial page loads for authorized users.
- **Admin Analytics Fix**: Corrected fleet distribution charts to accurately group data by car category, improving business intelligence insights.
- **Dynamic Discount System**: Implemented a global discount system where rental duration rules (e.g., "10% off for 3-6 days") are managed in the DB and displayed dynamically on car product pages.
- **Timezone-Aware Datetimes**: Standardized all datetime operations to use UTC and implemented resilience against naive datetimes from the database, resolving comparison errors during password resets.
- **Enhanced Schema Validation**:
  - **Auth**: Strict 6-digit format validation for email verification and password reset codes.
  - **Payments**: Robust validation for 16-digit card numbers and `MM/YY` expiration formats, including automatic rejection of expired cards.
- **Comprehensive Unit Testing**: Added a full suite of unit tests for backend services (Auth, Car, Admin) and schemas (Auth, Card) using `pytest`.
- **Backend Refactoring**: Migrated to Pydantic V2 methods (`model_dump`) and resolved various deprecation warnings for better long-term stability.
- **Improved About Page**: Refactored the About page with a cleaner, more modular structure and optimized image handling using Next.js `Image` component.
- **Multi-Card Management**: Refactored the payment system to support multiple credit cards per user with full CRUD support.
- **Email Verification & Password Recovery**: Implemented robust flows using 6-digit codes for secure account management.
- **Physical Photo Upload**: Admins can now upload actual vehicle photos directly from their devices.

## 📄 License

This project is private and intended for internal use.
