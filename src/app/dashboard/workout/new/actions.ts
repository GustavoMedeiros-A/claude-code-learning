"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { name, date } = createWorkoutSchema.parse(params);

  await createWorkout(userId, name, date);
}
