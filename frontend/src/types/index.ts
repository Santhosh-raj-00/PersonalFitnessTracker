export type Role = 'ROLE_USER' | 'ROLE_TRAINER' | 'ROLE_ADMIN';
export type FitnessGoal = 'CUT' | 'BULK' | 'MAINTAIN';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type MuscleGroup = 'CHEST' | 'BACK' | 'BICEPS' | 'TRICEPS' | 'SHOULDERS' | 'QUADRICEPS' | 'HAMSTRINGS' | 'CALVES' | 'ABS' | 'GLUTES' | 'TRAPS' | 'FOREARMS' | 'CARDIO';
export type Equipment = 'BARBELL' | 'DUMBBELL' | 'CABLE' | 'MACHINE' | 'BODYWEIGHT' | 'SMITH_MACHINE' | 'KETTLEBELL' | 'EZ_BAR';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RecordType = 'MAX_WEIGHT' | 'MAX_REPS' | 'MAX_1RM' | 'MAX_VOLUME_SET';

export interface UserProfile {
  id: number;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  availableEquipment: string;
  dailyCalorieTarget: number;
  dailyProteinTargetGrams: number;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  token: string;
  profile?: UserProfile;
}

export interface Exercise {
  id: number;
  name: string;
  primaryMuscle: MuscleGroup;
  primaryMuscles?: string[];
  secondaryMuscles?: string;
  secondaryMusclesList?: string[];
  equipment: Equipment;
  difficulty: Difficulty;
  formTips?: string;
  demoImageUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  steps?: string[];
  mistakes?: string[];
  defaultSets?: number;
  defaultReps?: string;
  isCustom?: boolean;
  attribution?: string;
}

export interface MuscleGroupSummary {
  id: string;
  displayName: string;
  description: string;
  exerciseCount: number;
}

export interface CreateCustomExerciseRequest {
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: Equipment;
  difficulty: Difficulty;
  mediaUrl?: string;
  thumbnailUrl?: string;
  steps?: string[];
  mistakes?: string[];
  defaultSets?: number;
  defaultReps?: string;
}

export interface RoutineExercise {
  id: number;
  exerciseId: number;
  exerciseName: string;
  primaryMuscle: string;
  equipment: string;
  demoImageUrl?: string;
  exerciseOrder: number;
  targetSets: number;
  targetRepRange: string;
  restSeconds: number;
  notes?: string;
}

export interface RoutineDay {
  id: number;
  dayName: string;
  dayOrder: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: number;
  name: string;
  description?: string;
  isTemplate: boolean;
  splitType: string;
  days: RoutineDay[];
}

export interface WorkoutSet {
  id?: number;
  exerciseId: number;
  exerciseName?: string;
  primaryMuscle?: string;
  setOrder: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  estimated1rm?: number;
  isPr?: boolean;
  loggedAt?: string;
}

export interface WorkoutSession {
  id: number;
  routineDayId?: number;
  routineName?: string;
  sessionName: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  totalVolumeKg: number;
  status: SessionStatus;
  sets: WorkoutSet[];
}

export interface LastExerciseStats {
  exerciseId: number;
  lastWeightKg?: number;
  lastReps?: number;
  maxWeightKg?: number;
  maxEstimated1rm?: number;
  lastLoggedAt?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  secondaryValue?: number;
  label?: string;
}

export interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  weightHistory: ChartDataPoint[];
  estimated1rmHistory: ChartDataPoint[];
  volumeHistory: ChartDataPoint[];
}

export interface BodyMetric {
  id?: number;
  recordedDate: string;
  weightKg?: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id?: number;
  recordedDate: string;
  photoUrl: string;
  tag?: string;
}

export interface PersonalRecord {
  id: number;
  exerciseId: number;
  exerciseName: string;
  recordType: RecordType;
  recordValue: number;
  reps?: number;
  achievedAt: string;
}

export interface DashboardSummary {
  totalWorkoutsCompleted: number;
  totalVolumeThisWeekKg: number;
  activeStreakDays: number;
  recentPRs: PersonalRecord[];
  weeklyVolumeChart: ChartDataPoint[];
  bodyWeightChart: ChartDataPoint[];
  recommendedRoutines: Routine[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

