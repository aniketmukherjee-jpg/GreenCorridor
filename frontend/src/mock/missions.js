export const mockMissions = [
  {
    id: 101,
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    pickup_location: "MG Road, near Trinity Circle",
    destination_hospital: "Victoria Hospital",
    ambulance_id: "AMB-204",
    patient_condition_tag: "cardiac",
    eta_minutes: 4,
    started_at: "2026-07-22T09:14:00Z"
  },
  {
    id: 102,
    priority: "HIGH",
    status: "PENDING",
    pickup_location: "Brigade Road Junction",
    destination_hospital: "St. John's Medical Center",
    ambulance_id: "AMB-117",
    patient_condition_tag: "trauma",
    eta_minutes: null,
    started_at: null
  },
  {
    id: 103,
    priority: "MEDIUM",
    status: "COMPLETED",
    pickup_location: "Koramangala 5th Block",
    destination_hospital: "Manipal Hospital",
    ambulance_id: "AMB-088",
    patient_condition_tag: "maternity",
    eta_minutes: 0,
    started_at: "2026-07-22T06:02:00Z",
    completed_at: "2026-07-22T06:31:00Z"
  }
];

export const mockAmbulances = [
  { id: "AMB-204", plate: "KA-01-AB-2041", status: "on_mission", equipment_level: "ALS", driver: "R. Kumar" },
  { id: "AMB-117", plate: "KA-05-CD-1178", status: "available", equipment_level: "BLS", driver: "S. Iyer" },
  { id: "AMB-088", plate: "KA-03-EF-0882", status: "available", equipment_level: "ALS", driver: "A. Rao" }
];
