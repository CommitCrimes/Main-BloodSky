const DRONE_API_BASE = process.env.DRONE_API_BASE ?? "http://localhost:5000";

export async function startMission(): Promise<{ message: string }> {
  const res = await fetch(`${DRONE_API_BASE}/start`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function returnToHome(): Promise<{ message: string }> {
  const res = await fetch(`${DRONE_API_BASE}/rth`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function setFlightMode(mode: string): Promise<{ message: string }> {
  const res = await fetch(`${DRONE_API_BASE}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
