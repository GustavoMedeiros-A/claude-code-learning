import {
    pgTable,
    serial,
    text,
    integer,
    boolean,
    numeric,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const exercises = pgTable(
    "exercises",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [uniqueIndex("exercises_name_unique_idx").on(table.name)]
);

export const exercisesRelations = relations(exercises, ({ many }) => ({
    workoutExercises: many(workoutExercises),
}));

export const workouts = pgTable(
    "workouts",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        name: text("name"),
        startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
    },
    (table) => [
        index("workouts_user_id_idx").on(table.userId),
        index("workouts_user_id_started_at_idx").on(table.userId, table.startedAt),
    ]
);

export const workoutsRelations = relations(workouts, ({ many }) => ({
    workoutExercises: many(workoutExercises),
}));

export const workoutExercises = pgTable(
    "workout_exercises",
    {
        id: serial("id").primaryKey(),
        workoutId: integer("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
        exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),
        order: integer("order").notNull(),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
    },
    (table) => [index("workout_exercises_workout_id_idx").on(table.workoutId)]
);

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
    workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
    exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
    sets: many(sets),
}));

export const sets = pgTable(
    "sets",
    {
        id: serial("id").primaryKey(),
        workoutExerciseId: integer("workout_exercise_id").notNull().references(() => workoutExercises.id, { onDelete: "cascade" }),
        setNumber: integer("set_number").notNull(),
        reps: integer("reps"),
        weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),
        completed: boolean("completed").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index("sets_workout_exercise_id_idx").on(table.workoutExerciseId)]
);

export const setsRelations = relations(sets, ({ one }) => ({
    workoutExercise: one(workoutExercises, { fields: [sets.workoutExerciseId], references: [workoutExercises.id] }),
}));

// TypeScript types
export type Exercise = InferSelectModel<typeof exercises>;
export type NewExercise = InferInsertModel<typeof exercises>;
export type Workout = InferSelectModel<typeof workouts>;
export type NewWorkout = InferInsertModel<typeof workouts>;
export type WorkoutExercise = InferSelectModel<typeof workoutExercises>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;
export type Set = InferSelectModel<typeof sets>;
export type NewSet = InferInsertModel<typeof sets>;

