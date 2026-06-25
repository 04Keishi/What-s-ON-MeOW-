import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { GeoPosition } from "@/types";

export function positionTolngLat(pos: GeoPosition): [number, number] {
  return [pos.longitude, pos.latitude];
}

export function positionsToGeoJSON(positions: GeoPosition[]) {
  return {
    type: "LineString" as const,
    coordinates: positions.map((pos) => [pos.longitude, pos.latitude]),
  };
}