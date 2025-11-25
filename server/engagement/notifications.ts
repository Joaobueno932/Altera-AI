import { CheckInPlan } from "./checkins";
import { MicroMission } from "./microMissions";
import { ZeigarnikHook } from "./zeigarnik";

export type NotificationPlan = {
  title: string;
  body: string;
  schedule: "immediate" | "next_block" | "weekly";
};

export const buildNotifications = (
  checkIns: CheckInPlan[],
  missions: MicroMission[],
  zeigarnik: ZeigarnikHook[]
): NotificationPlan[] => {
  const plans: NotificationPlan[] = [];

  missions.forEach(mission => {
    plans.push({
      title: "Micro missão pronta",
      body: `${mission.description} — recompensa: ${mission.reward}`,
      schedule: "immediate",
    });
  });

  checkIns.forEach(checkIn => {
    plans.push({
      title: `Check-in ${checkIn.scope}`,
      body: checkIn.prompt,
      schedule: checkIn.slot === "weekly" ? "weekly" : "next_block",
    });
  });

  if (zeigarnik.length > 0) {
    plans.push({
      title: "Retome de onde parou",
      body: zeigarnik[0].reminder,
      schedule: "immediate",
    });
  }

  return plans;
};
