export const mockReports = [
  {
    id: 1,
    category: "pothole",
    severity: "high",
    status: "verified",
    description: "Large pothole near the bus stop, causing vehicles to swerve.",
    lat: 12.9716, lng: 77.5946,
    photo_url: "/mock/photos/pothole1.jpg",
    confirmation_count: 14,
    reported_at: "2026-07-20T08:12:00Z"
  },
  {
    id: 2,
    category: "accident",
    severity: "high",
    status: "reported",
    description: "Two-vehicle collision, partial lane blockage.",
    lat: 12.9750, lng: 77.6010,
    photo_url: "/mock/photos/accident1.jpg",
    confirmation_count: 6,
    reported_at: "2026-07-22T05:40:00Z"
  },
  {
    id: 3,
    category: "waterlogging",
    severity: "medium",
    status: "in_progress",
    description: "Ankle-deep water after last night's rain, slow traffic.",
    lat: 12.9698, lng: 77.5900,
    photo_url: "/mock/photos/waterlogging1.jpg",
    confirmation_count: 22,
    reported_at: "2026-07-21T19:05:00Z"
  },
  {
    id: 4,
    category: "road_closure",
    severity: "medium",
    status: "verified",
    description: "Road closed for municipal repair work until Friday.",
    lat: 12.9800, lng: 77.5920,
    photo_url: "/mock/photos/closure1.jpg",
    confirmation_count: 9,
    reported_at: "2026-07-19T11:30:00Z"
  },
  {
    id: 5,
    category: "heavy_traffic",
    severity: "low",
    status: "reported",
    description: "Signal malfunction causing heavy backup at junction.",
    lat: 12.9670, lng: 77.5980,
    photo_url: null,
    confirmation_count: 3,
    reported_at: "2026-07-22T07:55:00Z"
  }
];
