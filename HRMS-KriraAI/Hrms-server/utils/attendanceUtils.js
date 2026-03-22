// Business Rules
// Normal time: exactly 8 hours (480 minutes)
// Low Time: worked < 8:00 (< 480 minutes)
// Extra Time: worked > 8:00 (> 480 minutes)
// Half-day: normal = 4h (240 min). Low < 4h, Extra > 4h
// Holiday Work: ALL worked time counts as overtime (extraTime), no lowTime ever

const MIN_NORMAL_MINUTES = 480; // 8h 0m (exact boundary for low vs normal)
const MAX_NORMAL_MINUTES = 480; // 8h 0m (exact boundary for normal vs extra)
const HALF_DAY_THRESHOLD_MINUTES = 240; // 4h 0m (standard half-day duration)

export const calculateDurationSeconds = (start, end) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, (e - s) / 1000);
};

export const calculateTotalBreakSeconds = (breaks) => {
  return (breaks || []).reduce((acc, b) => {
    if (b.start && b.end) {
      return acc + calculateDurationSeconds(b.start, b.end);
    }
    return acc;
  }, 0);
};

export const calculateTotalManualSeconds = (manualHours) => {
  return (manualHours || []).reduce((acc, m) => {
    return acc + (m.hours * 3600);
  }, 0);
};

export const calculateWorkedSeconds = (attendance, checkOutTime) => {
  const totalManual = calculateTotalManualSeconds(attendance.manualHours || []);
  
  if (!attendance.checkIn) return totalManual;

  const endTimeStr = checkOutTime || attendance.checkOut;
  if (!endTimeStr) return totalManual; // Session active, only count manual for now

  const totalSession = calculateDurationSeconds(attendance.checkIn, endTimeStr);
  const totalBreaks = calculateTotalBreakSeconds(attendance.breaks);

  return Math.max(0, totalSession - totalBreaks + totalManual);
};

/**
 * Calculate overtime/low-time flags.
 * @param {number} workedSeconds - Net worked seconds
 * @param {boolean} isHalfDayApproved - Whether a half-day leave is approved for this day
 * @param {number} extraTimeLeaveMinutes - Additional minutes from Extra Time Leave
 * @param {boolean} isHolidayWork - If true, ALL worked time is overtime (no low time ever)
 * @returns {{ lowTime: boolean, extraTime: boolean }}
 */
export const getFlags = (workedSeconds, isHalfDayApproved, extraTimeLeaveMinutes = 0, isHolidayWork = false) => {
  // Holiday rule: if employee works on a holiday, entire duration is overtime
  if (isHolidayWork) {
    return {
      lowTime: false,
      extraTime: workedSeconds > 0
    };
  }

  // Add Extra Time Leave minutes to worked time for calculation
  const workedMinutes = (workedSeconds / 60) + extraTimeLeaveMinutes;

  // Use half-day threshold if approved
  if (isHalfDayApproved) {
    const halfThreshold = HALF_DAY_THRESHOLD_MINUTES; // 240 min = 4h
    return {
      lowTime: workedMinutes > 0 && workedMinutes < halfThreshold,
      extraTime: workedMinutes > halfThreshold
    };
  }

  // Normal logic: Low < 8h, Extra > 8h
  return {
    lowTime: workedMinutes > 0 && workedMinutes < MIN_NORMAL_MINUTES,
    extraTime: workedMinutes > MAX_NORMAL_MINUTES
  };
};

export const getTodayStr = () => {
  return new Date().toISOString().split('T')[0];
};
