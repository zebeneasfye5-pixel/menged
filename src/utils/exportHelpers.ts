import { Driver, QueueTurn, SafetyReport, Vehicle } from '../types';

/**
 * Downloads CSV content as a file with UTF-8 BOM so Ethiopian Ge'ez characters render perfectly in Excel.
 */
function downloadCsvFile(content: string, filename: string) {
  // UTF-8 BOM (\uFEFF) ensures Excel reads Amharic characters properly
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportVehiclesToCSV(vehicles: Vehicle[]) {
  const headers = [
    'የሰሌዳ ቁጥር (Plate)',
    'የተሽከርካሪ ዓይነት (Type)',
    'ሞዴል (Make & Model)',
    'የተመረተበት ዓ.ም (Year)',
    'የመጫን አቅም (Capacity)',
    'ባለቤት (Owner)',
    'ሹፌር (Driver)',
    'ስልክ (Phone)',
    'የፍጥነት መቆጣጠሪያ ቁጥር (Limiter ID)',
    'ሁኔታ (Status)',
    'የቴክኒክ ምርመራ (Inspection)',
    'የፍጥነት ወሰን (Speed Limit)',
    'የአሁኑ ፍጥነት (Current Speed km/h)',
    'ነዳጅ መጠን (Fuel %)',
    'መነሻ - መዳረሻ (Route)'
  ];

  const rows = vehicles.map(v => [
    `"${v.plateNumber}"`,
    `"${v.vehicleType}"`,
    `"${v.makeModel}"`,
    `"${v.year}"`,
    `"${v.capacity}"`,
    `"${v.ownerName}"`,
    `"${v.driverName}"`,
    `"${v.driverPhone}"`,
    `"${v.speedLimiterId}"`,
    `"${v.status}"`,
    `"${v.inspectionStatus} (${v.inspectionExpiry})"`,
    `"${v.speedLimit} km/h"`,
    `"${v.currentSpeed} km/h"`,
    `"${v.fuelLevel}%"`,
    `"${v.origin || ''} - ${v.destination || ''}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `የመንገድ_ትራንስፖርት_የተሽከርካሪዎች_ዝርዝር_${dateStr}.csv`);
}

export function exportDriversToCSV(drivers: Driver[]) {
  const headers = [
    'ሙሉ ስም (Full Name)',
    'የመንጃ ፍቃድ ቁጥር (License No)',
    'የመንጃ ፍቃድ ደረጃ (Grade)',
    'ስልክ ቁጥር (Phone)',
    'የልምድ ዓመታት (Experience)',
    'ደህንነት ደረጃ (Rating)',
    'የቅጣት ነጥብ (Penalty Points)',
    'የተመደበለት ተሽከርካሪ (Assigned Plate)',
    'የስራ ሁኔታ (Status)',
    'የጤና ምርመራ ጊዜ (Health Expiry)'
  ];

  const rows = drivers.map(d => [
    `"${d.fullName}"`,
    `"${d.licenseNumber}"`,
    `"${d.licenseGrade}"`,
    `"${d.phone}"`,
    `"${d.experienceYears}"`,
    `"${d.rating} / 5"`,
    `"${d.penaltyPoints}"`,
    `"${d.assignedPlate}"`,
    `"${d.status}"`,
    `"${d.healthCertExpiry}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `የአሽከርካሪዎች_ማህደር_${dateStr}.csv`);
}

export function exportQueueToCSV(queues: QueueTurn[]) {
  const headers = [
    'የተራ ቁጥር (Turn #)',
    'የቲኬት ኮድ (Ticket Code)',
    'መናኸሪያ (Terminal)',
    'መስመር (Route)',
    'የሰሌዳ ቁጥር (Plate)',
    'አሽከርካሪ (Driver)',
    'ስልክ (Phone)',
    'የገባበት ሰዓት (Entry Time)',
    'የመነሻ ሰዓት (Departure Time)',
    'የተሳፋሪ ቁጥር (Booked/Capacity)',
    'የታሪፍ ዋጋ (Tariff ETB)',
    'ሁኔታ (Status)'
  ];

  const rows = queues.map(q => [
    `"${q.turnNumber}"`,
    `"${q.ticketCode}"`,
    `"${q.terminalName}"`,
    `"${q.routeName}"`,
    `"${q.plateNumber}"`,
    `"${q.driverName}"`,
    `"${q.driverPhone}"`,
    `"${q.entryTime}"`,
    `"${q.estimatedDeparture}"`,
    `"${q.bookedSeats}/${q.capacity}"`,
    `"${q.tariffPerSeat} ETB"`,
    `"${q.status}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `የተሽከርካሪዎች_የተራ_ዝርዝር_${dateStr}.csv`);
}

export function exportSafetyReportsToCSV(reports: SafetyReport[]) {
  const headers = [
    'መለያ ቁጥር (Tracking No)',
    'የሰሌዳ ቁጥር (Plate)',
    'የጥሰት ዓይነት (Incident)',
    'ደረጃ (Severity)',
    'ቦታ (Location)',
    'የተመዘገበ ፍጥነት (Speed km/h)',
    'ጠቋሚ (Reporter)',
    'ቀንና ሰዓት (Timestamp)',
    'ዝርዝር መግለጫ (Description)',
    'ሁኔታ (Status)',
    'የተወሰደ እርምጃ (Action Taken)'
  ];

  const rows = reports.map(r => [
    `"${r.trackingNumber}"`,
    `"${r.vehiclePlate}"`,
    `"${r.incidentType}"`,
    `"${r.severity}"`,
    `"${r.location}"`,
    `"${r.speedRecorded || '-'}"`,
    `"${r.reportedBy}"`,
    `"${r.timestamp}"`,
    `"${r.description.replace(/"/g, '""')}"`,
    `"${r.status}"`,
    `"${r.actionTaken || '-'}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(csv, `የትራፊክ_ደህንነት_የጥቆማዎች_መዝገብ_${dateStr}.csv`);
}
