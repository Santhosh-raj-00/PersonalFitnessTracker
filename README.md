# FitTrack - Gym Workout & Fitness Management Web Application

FitTrack is a production-quality, smart workout logging and gym management web application built with Java 17 Spring Boot, Spring Security with JWT authentication, PostgreSQL/H2, and a mobile-first React (Vite) PWA frontend with Tailwind CSS and Recharts.

---

## 🚀 Key Features (Phase 1 MVP Completed)

1. **Authentication & Profile Management**
   - JWT-based authentication (Register, Login, Profile)
   - Configurable fitness goals (`CUT`, `BULK`, `MAINTAIN`), experience levels, and available equipment selector.

2. **Seeded Exercise Library (60+ Exercises)**
   - Pre-populated library of 60+ exercises across 13 muscle groups and 8 equipment types.
   - Search & multi-filter by primary muscle and equipment.
   - Expandable execution form tips and demo images.

3. **Routines & Workout Splits**
   - Template library including **Push / Pull / Legs (PPL)**, **Upper / Lower Split**, and **6-Day Hypertrophy Split**.
   - Custom Routine Builder: Create custom days, search exercises, set target sets, rep ranges, and rest timers.

4. **1-Tap Workout Logger & Rest Timer**
   - Fast logger with number steppers (+1kg, +5kg, +1rep) designed for sweaty hands in the gym.
   - Displays previous session's weight and reps side-by-side next to each exercise.
   - **"Copy Last Set"** button for instant set logging.
   - **Automatic Rest Timer**: Auto-starts countdown after each logged set (180s for heavy compound lifts, 90s for light isolation exercises) with audio chime & visual progress bar.

5. **Automatic Personal Record (PR) Detection**
   - Automatically detects and flags Personal Records for **Max Weight** and **Estimated 1RM** ($1RM = \text{weight} \times (1 + \text{reps} / 30)$).
   - Celebrates PRs with interactive animated badge banners and saves records in the PR Hall of Fame.

6. **Progress Tracking & Analytics**
   - Recharts visual graphs for estimated 1RM, max weight history, and total volume over time per exercise.
   - Body Metrics tracking (weight, body fat %, chest, waist measurements) with interactive progress charts.
   - Physique progress photo gallery with tag categorization (Front, Back, Side).

7. **Offline PWA Support & Sync**
   - Installable Web App (PWA) with Service Worker static caching.
   - When offline, logged sets are automatically saved in local queue and synced to backend upon reconnecting.

---

## 🛠 Tech Stack

- **Backend**: Java 17+, Spring Boot 3.2, Spring Security, JWT (JJWT), Spring Data JPA, Hibernate, Bean Validation, OpenAPI/Swagger 3.
- **Database**: PostgreSQL (or H2 in-memory for zero-setup local dev).
- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, Recharts, Lucide React Icons, React Router DOM.
- **PWA**: Web App Manifest, Service Worker offline caching, LocalStorage queue sync.
- **Containers**: Docker, Docker Compose.

---

## 🗄 Data Model & Schema

```
Users (id, email, password, fullName, role, createdAt)
  └── UserProfile (id, user_id, age, heightCm, weightKg, fitnessGoal, experienceLevel, availableEquipment)

Exercises (id, name, primaryMuscle, secondaryMuscles, equipment, difficulty, formTips, demoImageUrl, isCustom)

Routines (id, user_id, name, description, isTemplate, splitType)
  └── RoutineDay (id, routine_id, dayName, dayOrder)
      └── RoutineExercise (id, routine_day_id, exercise_id, exerciseOrder, targetSets, targetRepRange, restSeconds)

WorkoutSession (id, user_id, routineDayId, sessionName, startTime, endTime, totalVolumeKg, status)
  └── WorkoutSet (id, session_id, exercise_id, setOrder, weightKg, reps, rpe, isWarmup, estimated1rm, isPr)

PersonalRecord (id, user_id, exercise_id, recordType, recordValue, reps, achievedAt)
BodyMetric (id, user_id, recordedDate, weightKg, bodyFatPercentage, chestCm, waistCm)
ProgressPhoto (id, user_id, recordedDate, photoUrl, tag)
```

---

## 🔑 Demo Account Credentials

For instant testing with pre-populated workout history, PRs, and body weight charts:

- **Email**: `user@fittrack.com`
- **Password**: `password123`

---

## 🏃 Quick Start & Run Instructions

### Option 1: Local Development Setup

#### 1. Backend Startup
From the project root directory:

```bash
cd backend
java -jar target/fittrack-backend-1.0.0-SNAPSHOT.jar
# OR if using Maven:
# mvn spring-boot:run
```
*The backend automatically starts on `http://localhost:8080` and initializes seed data in the embedded H2 database.*

- **Swagger API Docs**: `http://localhost:8080/swagger-ui.html`
- **H2 Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:fittrackdb`)

#### 2. Frontend Startup
Open a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```
*Access the Web Application in your browser at `http://localhost:5173`.*

---

### Option 2: Docker Compose Setup

Run PostgreSQL and the Spring Boot Backend in Docker:

```bash
docker-compose up --build -d
```

---

## 🧪 Running Backend Unit Tests

To execute unit tests for estimated 1RM calculation and automatic PR detection:

```bash
cd backend
mvn test
```

---

## ⏸ Phase 1 Complete - Awaiting Confirmation

Phase 1 MVP features (Auth, 60+ Exercises, Routines, Logger with Rest Timer & PR Detection, Progress Charts & Body Metrics, Offline Sync, Docker setup, and Tests) are **fully implemented and verified**.

*Please confirm to proceed with **Phase 2: Unique, Smart Features** (Auto progressive overload engine, Interactive SVG muscle recovery map, Smart "Today's Workout" recommendation, Plateau detector, Equipment-aware exercise swaps, Streaks/Badges/Challenges, and Nutrition Lite).*
