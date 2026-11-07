import { DAYS, HOURS } from './constants'

export function calculateIdealTeachers(subjects, numClasses, constraints) {
  const targetSlotsPerDay = HOURS.filter(
    (h) =>
      h >= constraints.idealStartHour &&
      h < constraints.idealEndHour &&
      (!constraints.enforceLunchBreak || h !== constraints.lunchBreakHour)
  ).length

  const targetSlotsPerWeek = Math.max(1, targetSlotsPerDay * DAYS.length)
  const effectiveMaxPerTeacher = Math.min(constraints.maxHoursPerTeacher, targetSlotsPerWeek)

  return subjects.map((sub) => {
    const totalHoursNeeded = sub.hoursPerClass * numClasses
    const idealCount = Math.max(1, Math.ceil(totalHoursNeeded / Math.max(1, effectiveMaxPerTeacher)))
    return {
      ...sub,
      teachers: idealCount,
    }
  })
}

export function computeDayGaps(daySchedule, candidateHour = null) {
  const occupiedHours = HOURS.filter(
    (h) => daySchedule[h] !== null && daySchedule[h] !== undefined
  )
  if (candidateHour !== null && !occupiedHours.includes(candidateHour)) {
    occupiedHours.push(candidateHour)
  }
  if (occupiedHours.length <= 1) return 0

  const minH = Math.min(...occupiedHours)
  const maxH = Math.max(...occupiedHours)
  let gaps = 0

  for (let h = minH; h <= maxH; h++) {
    if (h === 12) continue
    if (!occupiedHours.includes(h)) {
      gaps++
    }
  }
  return gaps
}

export function evaluateSlotPenalty(classGrid, dayIdx, hour, subjectId, constraints) {
  let penalty = 0
  const daySchedule = classGrid[dayIdx]

  if (hour < constraints.idealStartHour) {
    const diff = constraints.idealStartHour - hour
    penalty += diff * diff * 45
  }

  if (hour >= constraints.idealEndHour) {
    const diff = hour - constraints.idealEndHour + 1
    penalty += diff * diff * 55
  } else {
    penalty += (hour - constraints.idealStartHour) * 1.5
  }

  const currentGaps = computeDayGaps(daySchedule, null)
  const newGaps = computeDayGaps(daySchedule, hour)
  const gapDelta = newGaps - currentGaps
  penalty += gapDelta * 35

  const currentDayHours = Object.values(daySchedule).filter(Boolean).length
  const newDayHours = currentDayHours + 1

  if (newDayHours > constraints.idealHoursPerDay) {
    const excess = newDayHours - constraints.idealHoursPerDay
    penalty += excess * excess * 25
  }

  const sameSubjectCount = Object.values(daySchedule).filter(
    (slot) => slot && slot.subjectId === subjectId
  ).length

  if (sameSubjectCount === 1) {
    const isAdjacent =
      (daySchedule[hour - 1] && daySchedule[hour - 1].subjectId === subjectId) ||
      (daySchedule[hour + 1] && daySchedule[hour + 1].subjectId === subjectId)
    penalty += isAdjacent ? 12 : 40
  } else if (sameSubjectCount >= 2) {
    penalty += 180
  }

  return penalty
}

export function evaluateClassSchedulePenalty(classGrid, constraints) {
  let totalPenalty = 0

  for (let d = 0; d < DAYS.length; d++) {
    const daySchedule = classGrid[d]
    const occupiedHours = HOURS.filter((h) => daySchedule[h] !== null)

    if (occupiedHours.length === 0) continue

    for (const h of occupiedHours) {
      if (h < constraints.idealStartHour) {
        const diff = constraints.idealStartHour - h
        totalPenalty += diff * diff * 45
      }
      if (h >= constraints.idealEndHour) {
        const diff = h - constraints.idealEndHour + 1
        totalPenalty += diff * diff * 55
      } else {
        totalPenalty += (h - constraints.idealStartHour) * 1.5
      }
    }

    const gaps = computeDayGaps(daySchedule)
    totalPenalty += gaps * 35

    if (occupiedHours.length > constraints.idealHoursPerDay) {
      const excess = occupiedHours.length - constraints.idealHoursPerDay
      totalPenalty += excess * excess * 25
    }

    const countsBySub = {}
    for (const h of occupiedHours) {
      const subId = daySchedule[h].subjectId
      countsBySub[subId] = (countsBySub[subId] || 0) + 1
    }
    for (const subId of Object.keys(countsBySub)) {
      if (countsBySub[subId] === 2) totalPenalty += 15
      if (countsBySub[subId] > 2) totalPenalty += (countsBySub[subId] - 2) * 180
    }
  }

  return totalPenalty
}

export function generateTimetables({ numClasses, subjects, constraints }) {
  const classesGrid = Array.from({ length: numClasses }, () =>
    Array.from({ length: DAYS.length }, () => {
      const dayObj = {}
      HOURS.forEach((h) => {
        dayObj[h] = null
      })
      return dayObj
    })
  )

  const teachersList = []
  const teachersGrid = {}

  subjects.forEach((sub) => {
    const count = Math.max(1, sub.teachers)
    for (let t = 1; t <= count; t++) {
      const teacherId = `${sub.id}_prof_${t}`
      teachersList.push({
        id: teacherId,
        name: `Prof. ${sub.name} #${t}`,
        subjectId: sub.id,
        subjectName: sub.name,
        color: sub.color,
        assignedHours: 0,
      })
      teachersGrid[teacherId] = Array.from({ length: DAYS.length }, () => {
        const dayObj = {}
        HOURS.forEach((h) => {
          dayObj[h] = null
        })
        return dayObj
      })
    }
  })

  const sessionsToPlace = []

  subjects.forEach((sub) => {
    const subTeachers = teachersList.filter((t) => t.subjectId === sub.id)
    for (let c = 0; c < numClasses; c++) {
      const assignedTeacher = subTeachers[c % subTeachers.length]
      for (let h = 0; h < sub.hoursPerClass; h++) {
        sessionsToPlace.push({
          classIdx: c,
          subjectId: sub.id,
          subjectName: sub.name,
          color: sub.color,
          teacherId: assignedTeacher.id,
          teacherName: assignedTeacher.name,
        })
      }
    }
  })

  const teacherDemandCount = {}
  sessionsToPlace.forEach((s) => {
    teacherDemandCount[s.teacherId] = (teacherDemandCount[s.teacherId] || 0) + 1
  })

  sessionsToPlace.sort((a, b) => {
    const loadDiff = teacherDemandCount[b.teacherId] - teacherDemandCount[a.teacherId]
    if (loadDiff !== 0) return loadDiff
    return a.classIdx - b.classIdx
  })

  const unassigned = []

  sessionsToPlace.forEach((session) => {
    let bestSlot = null
    let bestPenalty = Infinity

    for (let d = 0; d < DAYS.length; d++) {
      const daySchedule = classesGrid[session.classIdx][d]
      const currentDayHours = Object.values(daySchedule).filter(Boolean).length
      if (currentDayHours >= constraints.maxHoursPerDay) continue

      for (const h of HOURS) {
        if (constraints.enforceLunchBreak && h === constraints.lunchBreakHour) continue
        if (daySchedule[h] !== null) continue
        if (teachersGrid[session.teacherId][d][h] !== null) continue

        const penalty = evaluateSlotPenalty(
          classesGrid[session.classIdx],
          d,
          h,
          session.subjectId,
          constraints
        )

        if (penalty < bestPenalty) {
          bestPenalty = penalty
          bestSlot = { dayIdx: d, hour: h }
        }
      }
    }

    if (bestSlot) {
      const { dayIdx, hour } = bestSlot
      const slotData = {
        subjectId: session.subjectId,
        subjectName: session.subjectName,
        teacherId: session.teacherId,
        teacherName: session.teacherName,
        color: session.color,
        classIdx: session.classIdx,
      }
      classesGrid[session.classIdx][dayIdx][hour] = slotData
      teachersGrid[session.teacherId][dayIdx][hour] = slotData
      const teacherObj = teachersList.find((t) => t.id === session.teacherId)
      if (teacherObj) teacherObj.assignedHours++
    } else {
      unassigned.push(session)
    }
  })

  for (let pass = 0; pass < 3; pass++) {
    for (let c = 0; c < numClasses; c++) {
      const classGrid = classesGrid[c]

      for (let d1 = 0; d1 < DAYS.length; d1++) {
        for (const h1 of HOURS) {
          const slot1 = classGrid[d1][h1]
          if (!slot1) continue

          const isSuboptimal =
            h1 >= constraints.idealEndHour ||
            h1 < constraints.idealStartHour ||
            computeDayGaps(classGrid[d1]) > 0

          if (!isSuboptimal) continue

          let currentPenalty = evaluateClassSchedulePenalty(classGrid, constraints)

          for (let d2 = 0; d2 < DAYS.length; d2++) {
            for (const h2 of HOURS) {
              if (d1 === d2 && h1 === h2) continue
              if (constraints.enforceLunchBreak && h2 === constraints.lunchBreakHour) continue

              const slot2 = classGrid[d2][h2]

              if (slot2 === null) {
                const targetDayHours = Object.values(classGrid[d2]).filter(Boolean).length
                if (d1 !== d2 && targetDayHours >= constraints.maxHoursPerDay) continue
                if (teachersGrid[slot1.teacherId][d2][h2] !== null) continue

                classGrid[d1][h1] = null
                classGrid[d2][h2] = slot1
                const newPenalty = evaluateClassSchedulePenalty(classGrid, constraints)

                if (newPenalty < currentPenalty) {
                  teachersGrid[slot1.teacherId][d1][h1] = null
                  teachersGrid[slot1.teacherId][d2][h2] = slot1
                  currentPenalty = newPenalty
                  break
                } else {
                  classGrid[d1][h1] = slot1
                  classGrid[d2][h2] = null
                }
              } else {
                if (slot1.teacherId !== slot2.teacherId) {
                  if (teachersGrid[slot1.teacherId][d2][h2] !== null) continue
                  if (teachersGrid[slot2.teacherId][d1][h1] !== null) continue
                }

                classGrid[d1][h1] = slot2
                classGrid[d2][h2] = slot1
                const newPenalty = evaluateClassSchedulePenalty(classGrid, constraints)

                if (newPenalty < currentPenalty) {
                  teachersGrid[slot1.teacherId][d1][h1] = null
                  teachersGrid[slot2.teacherId][d2][h2] = null
                  teachersGrid[slot1.teacherId][d2][h2] = slot1
                  teachersGrid[slot2.teacherId][d1][h1] = slot2
                  currentPenalty = newPenalty
                  break
                } else {
                  classGrid[d1][h1] = slot1
                  classGrid[d2][h2] = slot2
                }
              }
            }
          }
        }
      }
    }
  }

  const stats = computeGlobalStats(classesGrid, teachersList, unassigned, constraints)

  return {
    classesGrid,
    teachersGrid,
    teachersList,
    unassigned,
    stats,
  }
}

export function computeGlobalStats(classesGrid, teachersList, unassigned, constraints) {
  let totalPlaced = 0
  let inTargetWindow = 0
  let totalGaps = 0
  let sumEndHours = 0
  let countActiveDays = 0

  classesGrid.forEach((classGrid) => {
    for (let d = 0; d < DAYS.length; d++) {
      const daySchedule = classGrid[d]
      const occupied = HOURS.filter((h) => daySchedule[h] !== null)
      totalGaps += computeDayGaps(daySchedule)

      if (occupied.length > 0) {
        const maxHour = Math.max(...occupied) + 1
        sumEndHours += maxHour
        countActiveDays++
      }

      occupied.forEach((h) => {
        totalPlaced++
        if (h >= constraints.idealStartHour && h < constraints.idealEndHour) {
          inTargetWindow++
        }
      })
    }
  })

  const windowComplianceRate =
    totalPlaced > 0 ? Math.round((inTargetWindow / totalPlaced) * 100) : 100
  const avgEndHour =
    countActiveDays > 0 ? (sumEndHours / countActiveDays).toFixed(1) : constraints.idealEndHour

  return {
    totalPlaced,
    inTargetWindow,
    windowComplianceRate,
    totalGaps,
    avgEndHour,
    unassignedCount: unassigned.length,
    overloadedTeachers: teachersList.filter((t) => t.assignedHours > constraints.maxHoursPerTeacher)
      .length,
  }
}

export function trySwapClassSlots(scheduleData, classIdx, slotA, slotB, constraints) {
  const { classesGrid, teachersGrid, teachersList, unassigned } = scheduleData
  const classGrid = classesGrid[classIdx]

  const itemA = classGrid[slotA.dayIdx][slotA.hour]
  const itemB = classGrid[slotB.dayIdx][slotB.hour]

  if (!itemA && !itemB) {
    return { success: false, message: 'Les deux créneaux sélectionnés sont vides.' }
  }

  if (
    constraints.enforceLunchBreak &&
    (slotA.hour === constraints.lunchBreakHour || slotB.hour === constraints.lunchBreakHour)
  ) {
    return { success: false, message: 'Ce créneau est réservé à la pause déjeuner.' }
  }

  if (itemA && (!itemB || itemA.teacherId !== itemB.teacherId)) {
    const conflictA = teachersGrid[itemA.teacherId][slotB.dayIdx][slotB.hour]
    if (conflictA && conflictA.classIdx !== classIdx) {
      return {
        success: false,
        message: `${itemA.teacherName} donne déjà cours à la Classe ${conflictA.classIdx + 1} sur ce créneau.`,
      }
    }
  }

  if (itemB && (!itemA || itemA.teacherId !== itemB.teacherId)) {
    const conflictB = teachersGrid[itemB.teacherId][slotA.dayIdx][slotA.hour]
    if (conflictB && conflictB.classIdx !== classIdx) {
      return {
        success: false,
        message: `${itemB.teacherName} donne déjà cours à la Classe ${conflictB.classIdx + 1} sur ce créneau.`,
      }
    }
  }

  const nextClassesGrid = structuredClone(classesGrid)
  const nextTeachersGrid = structuredClone(teachersGrid)

  if (itemA) nextTeachersGrid[itemA.teacherId][slotA.dayIdx][slotA.hour] = null
  if (itemB) nextTeachersGrid[itemB.teacherId][slotB.dayIdx][slotB.hour] = null

  nextClassesGrid[classIdx][slotA.dayIdx][slotA.hour] = itemB
  nextClassesGrid[classIdx][slotB.dayIdx][slotB.hour] = itemA

  if (itemA) nextTeachersGrid[itemA.teacherId][slotB.dayIdx][slotB.hour] = itemA
  if (itemB) nextTeachersGrid[itemB.teacherId][slotA.dayIdx][slotA.hour] = itemB

  const nextStats = computeGlobalStats(nextClassesGrid, teachersList, unassigned, constraints)

  return {
    success: true,
    nextSchedule: {
      ...scheduleData,
      classesGrid: nextClassesGrid,
      teachersGrid: nextTeachersGrid,
      stats: nextStats,
    },
  }
}