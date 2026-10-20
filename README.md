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

---

## 🎬 Exercise Media Architecture & Provider Guide

FitTrack includes a multi-tiered media provider abstraction designed to deliver high-quality exercise demonstrations without copyright risks or external scraping.

### 1. Provider Modes
Every exercise resolves its media through a configurable provider cascade:
- **`builtin` (Default)**: Original procedural SVG biomechanical animation engine rendering realistic muscular anatomical figures with 46 canonical movement patterns. The working **primary muscles are highlighted in crimson red** (`#ef4444`) and **secondary muscles in lighter red/orange** (`#fb923c`) directly on the anatomical body bellies.
- **`licensed`**: Plays 720p H.264 MP4 or VP9 WebM videos (with animated WebP/GIF fallback) and poster frames served from your backend or CDN bucket (`/media/exercises/`). If a file fails to load or is missing, it **gracefully falls back to the built-in anatomical figure**.
- **`none`**: Displays a clean, labeled placeholder box with exercise name, target muscle, and equipment badges.

### 2. How to Switch to Licensed Media Later
You can switch providers globally or per-exercise:

#### A. Global Environment Variable (Frontend)
In `frontend/.env` or `frontend/.env.production`:
```env
# Switch global default provider: 'builtin' | 'licensed' | 'none'
VITE_DEFAULT_MEDIA_PROVIDER=licensed

# Base URLs for your local media server or private CDN bucket
VITE_LICENSED_MEDIA_BASE_URL=http://localhost:8085/media/exercises
VITE_LICENSED_POSTER_BASE_URL=http://localhost:8085/media/posters
```

#### B. In-App Runtime Switching (Developer / Test Mode)
You can test provider switching in the browser console or settings:
```javascript
// Switch to licensed media
localStorage.setItem('fittrack_media_provider_override', 'licensed');

// Revert to built-in anatomical animation
localStorage.setItem('fittrack_media_provider_override', 'builtin');

// Clear override
localStorage.removeItem('fittrack_media_provider_override');
```

#### C. Database Field Overrides (Per-Exercise)
The `exercises` table includes `media_provider`, `media_url`, `poster_url`, and `media_type`:
```sql
UPDATE exercises 
SET media_provider = 'licensed', 
    media_url = 'incline_dumbbell_press.mp4', 
    poster_url = 'incline_dumbbell_press_poster.webp', 
    media_type = 'video' 
WHERE name = 'Incline Dumbbell Press';
```

### 3. FFMPEG Batch Transcoding Pipeline
To convert licensed GIFs to 720p web-optimized MP4/WebM with poster frames:
```bash
# Run the automated batch transcoder script:
node tools/import_licensed_dataset.mjs /path/to/dataset.json /path/to/gifs

# Or execute the generated ffmpeg shell script:
bash tools/transcode_licensed_media.sh
```

Sample FFMPEG command:
```bash
# 720p MP4 (H.264, yuv420p, looped, faststart)
ffmpeg -y -i input.gif -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart output.mp4

# 720p WebM (VP9, small file size)
ffmpeg -y -i input.gif -vf "scale='min(720,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libvpx-vp9 -b:v 0 -crf 32 -an output.webm

# Poster Frame
ffmpeg -y -ss 00:00:00.000 -i input.gif -vframes 1 -vf "scale='min(720,iw)':-2:flags=lanczos" poster.webp
```

---

## ✅ Exercise Media Verification Checklist
Before deploying media updates, verify each exercise against this checklist:
- [ ] **No Hotlinking**: Exercise `mediaUrl` points to local `/media/` or trusted CDN, never third-party scraped domains.
- [ ] **Aspect Ratio**: Player component displays in a fixed 4:3 box without black-bar letterboxing.
- [ ] **Looping State**: Active green/red "Looping" badge appears **only** while the media is actually playing; displays "Paused" when stopped and "Photo Frame" for still images.
- [ ] **Red Anatomical Highlighting**: For built-in animations, primary muscles highlight in `#ef4444` crimson red and secondary in `#fb923c` lighter red/orange directly on the muscular body.
- [ ] **Reduced Motion**: If OS `prefers-reduced-motion` is enabled, animation pauses automatically at a mid-rep frame.
- [ ] **Battery/Performance**: Animations pause when scrolled out of view (`IntersectionObserver`).
- [ ] **Fallback Integrity**: If a licensed video file returns 404 or fails to decode, the player automatically falls back to `<ExerciseAnimation />` without breaking the UI.
- [ ] **PWA Cache**: Media requests are stored in the service worker runtime cache (`fittrack-media-cache-v1`) with maximum 80 items size limit.
- [ ] **Attribution**: Licensing and copyright text is recorded in `LICENSES.md` and displayed in the media controls overlay.

