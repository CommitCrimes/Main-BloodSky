const BASE_URL = "http://localhost:5000";

export async function startMission(): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/start`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function returnToHome(): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/rth`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function setFlightMode(mode: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
