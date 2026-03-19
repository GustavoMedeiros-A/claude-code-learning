import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutsForUserByDate } from "@/data/workouts";
import { DatePicker } from "./DatePicker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date: dateParam } = await searchParams;
  const date = dateParam
    ? (() => { const [y, m, d] = dateParam.split("-").map(Number); return new Date(y, m - 1, d); })()
    : new Date();

  const rows = await getWorkoutsForUserByDate(userId, date);

  // Group rows by workout, then by workoutExercise
  type SetRow = { setNumber: number; reps: number | null; weightKg: string | null; completed: boolean };
  type ExerciseGroup = { workoutExerciseId: number; exerciseName: string; sets: SetRow[] };
  type WorkoutGroup = { workoutId: number; workoutName: string | null; exercises: ExerciseGroup[] };

  const workoutMap = new Map<number, WorkoutGroup>();

  for (const row of rows) {
    if (!row.workoutId) continue;

    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        workoutId: row.workoutId,
        workoutName: row.workoutName,
        exercises: [],
      });
    }

    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId) {
      let exercise = workout.exercises.find(
        (e) => e.workoutExerciseId === row.workoutExerciseId
      );
      if (!exercise) {
        exercise = {
          workoutExerciseId: row.workoutExerciseId,
          exerciseName: row.exerciseName ?? "Unknown",
          sets: [],
        };
        workout.exercises.push(exercise);
      }

      if (row.setId) {
        exercise.sets.push({
          setNumber: row.setNumber!,
          reps: row.reps,
          weightKg: row.weightKg,
          completed: row.completed!,
        });
      }
    }
  }

  const workoutList = Array.from(workoutMap.values());

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Viewing workouts for:</span>
        <DatePicker selected={date} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Workouts logged on {format(date, "do MMM yyyy")}
        </h2>

        {workoutList.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          workoutList.map((workout) => (
            <Card key={workout.workoutId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {workout.workoutName ?? "Workout"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.workoutExerciseId}>
                    <p className="text-sm font-medium">{exercise.exerciseName}</p>
                    {exercise.sets.map((set) => (
                      <p
                        key={set.setNumber}
                        className="text-sm text-muted-foreground"
                      >
                        Set {set.setNumber}: {set.reps ?? "—"} reps
                        {set.weightKg ? ` @ ${set.weightKg}kg` : ""}
                      </p>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
