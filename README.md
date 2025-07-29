# MANTIS (Maintenance Tracking System)

This project consists of a React + TypeScript + Vite frontend and a Node.js/Express + Prisma + PostgreSQL backend.

## Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- PostgreSQL (for backend database)

---

## Backend Setup (`mantis-backend`)

1. **Install dependencies:**
   ```bash
   cd ../mantis-backend
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in `mantis-backend` with at least:
     ```env
     DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
     PORT=3000
     ```
   - Replace with your actual PostgreSQL credentials.

3. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```
   Or, for development:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Run the backend in development mode:**
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:3000` by default.

6. **Build for production:**
   ```bash
   npm run build
   # Then start with:
   npm start
   ```

---

## Frontend Setup (`mantis-frontend`)

1. **Install dependencies:**
   ```bash
   cd ../mantis-frontend
   npm install
   ```

2. **Configure environment variables (optional):**
   - If you need to override the backend API URL, create a `.env` file and set:
     ```env
     VITE_API_URL=http://localhost:3000/api
     ```

3. **Run the frontend in development mode:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` by default.

4. **Build for production:**
   ```bash
   npm run build
   # Preview the build with:
   npm run preview
   ```

---

## Notes
- Make sure the backend is running before using the frontend.
- The default ports are 3000 (backend) and 5173 (frontend).
- Seeder will clear and repopulate the database with sample data.
- For further customization, see the respective `package.json` files for available scripts.
