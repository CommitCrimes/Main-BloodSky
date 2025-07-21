const BASE_URL = "http://localhost:5000";

export type Waypoint = {
  lat: number;
  lon: number;
  alt: number;
  frame?: number;   //argument optionnel grâce au ?
  command?: number;
  param1?: number;
  param2?: number;
  param3?: number;
  param4?: number;
  autoContinue?: number;
};

export type CreateMissionPayload = {
  filename: string;
  altitude_takeoff: number;
  waypoints?: Waypoint[];
  mode: "auto" | "man";
};

export type ModifyWaypointPayload = Partial<{   //les arguments sont optionnel grâce au Partial
  lat: number;
  lon: number;
  alt: number;
  command: number;
  frame: number;
  param1: number;
  param2: number;
  param3: number;
  param4: number;
  autoContinue: number;
  current: number;
}>;

export async function createMission(data: CreateMissionPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/mission/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}

export async function sendMission(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/mission/send`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}

export async function modifyMission(
  filename: string,
  seq: number,
  updates: ModifyWaypointPayload
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/mission/modify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, seq, updates }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}
