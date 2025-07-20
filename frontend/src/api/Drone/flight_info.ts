const BASE_URL = "http://localhost:5000";

export type FlightInfo = {
  drone_id: string;
  is_armed: boolean;
  flight_mode: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  horizontal_speed_m_s: number;
  vertical_speed_m_s: number;
  heading_deg: number;
};

export async function getFlightInfo(): Promise<FlightInfo> {
  const res = await fetch(`${BASE_URL}/flight_info`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
