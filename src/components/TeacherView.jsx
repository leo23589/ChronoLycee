import React, { useState } from 'react'
import { DAYS, HOURS } from '../engine/constants'

export default function TeacherView({ scheduleData, constraints }) {
  const { teachersList, teachersGrid } = scheduleData
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    teachersList[0]?.id || ''
  )

  const currentTeacher =
    teachersList.find((t) => t.id === selectedTeacherId) || teachersList[0]
  const grid = currentTeacher ? teachersGrid[currentTeacher.id] : null

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Professeur :
          </label>
          <select
            value={currentTeacher?.id || ''}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white"
          >
            {teachersList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.assignedHours}h / sem)
              </option>
            ))}
          </select>
        </div>

        {currentTeacher && (
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Matière : {currentTeacher.subjectName}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full font-semibold ${
                currentTeacher.assignedHours > constraints.maxHoursPerTeacher
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Charge : {currentTeacher.assignedHours}h / {constraints.maxHoursPerTeacher}h max
            </span>
          </div>
        )}
      </div>

      {grid && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 w-24">
                  Horaire
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="py-2.5 px-3 text-left text-xs font-semibold text-slate-700 border-l border-slate-200"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-slate-100">
                  <td className="py-2 px-3 text-xs font-medium text-slate-500">
                    {hour}h00 - {hour + 1}h00
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const slot = grid[dayIdx]?.[hour]
                    return (
                      <td
                        key={dayIdx}
                        className="border-l border-slate-200 p-1.5 h-14 align-top"
                      >
                        {slot ? (
                          <div
                            className={`h-full rounded-lg border p-2 flex flex-col justify-between ${slot.color}`}
                          >
                            <span className="text-xs font-bold">
                              Classe {slot.classIdx + 1}
                            </span>
                            <span className="text-[11px] opacity-80">
                              {slot.subjectName}
                            </span>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                            Disponible
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}