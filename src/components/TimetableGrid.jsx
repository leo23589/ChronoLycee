import React, { useState } from 'react'
import { DAYS, HOURS } from '../engine/constants'
import { ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function TimetableGrid({
  scheduleData,
  selectedClassIdx,
  setSelectedClassIdx,
  numClasses,
  constraints,
  onSwapSlots,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [swapFeedback, setSwapFeedback] = useState(null)

  const classGrid = scheduleData.classesGrid[selectedClassIdx] || []

  const handleSlotClick = (dayIdx, hour) => {
    setSwapFeedback(null)
    if (!selectedSlot) {
      setSelectedSlot({ dayIdx, hour })
      return
    }

    if (selectedSlot.dayIdx === dayIdx && selectedSlot.hour === hour) {
      setSelectedSlot(null)
      return
    }

    const result = onSwapSlots(selectedClassIdx, selectedSlot, { dayIdx, hour })
    if (!result.success) {
      setSwapFeedback({ type: 'error', message: result.message })
    } else {
      setSwapFeedback({ type: 'success', message: 'Créneaux permutés avec succès.' })
    }
    setSelectedSlot(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Classe affichée :
          </label>
          <select
            value={selectedClassIdx}
            onChange={(e) => {
              setSelectedClassIdx(Number(e.target.value))
              setSelectedSlot(null)
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white"
          >
            {Array.from({ length: numClasses }, (_, i) => (
              <option key={i} value={i}>
                Classe {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Fenêtre cible : {constraints.idealStartHour}h00 – {constraints.idealEndHour}h00
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Cliquez sur 2 créneaux pour les permuter
          </span>
        </div>
      </div>

      {swapFeedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            swapFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {swapFeedback.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          {swapFeedback.message}
        </div>
      )}

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
            {HOURS.map((hour) => {
              const isLunch =
                constraints.enforceLunchBreak && hour === constraints.lunchBreakHour
              const isInTargetWindow =
                hour >= constraints.idealStartHour && hour < constraints.idealEndHour

              return (
                <tr
                  key={hour}
                  className={`border-b border-slate-100 ${
                    isLunch
                      ? 'bg-slate-100/80'
                      : isInTargetWindow
                      ? 'bg-white'
                      : 'bg-amber-50/30'
                  }`}
                >
                  <td className="py-2 px-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                    <div className="flex items-center justify-between">
                      <span>
                        {hour}h00 - {hour + 1}h00
                      </span>
                      {isInTargetWindow && !isLunch && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </td>

                  {DAYS.map((_, dayIdx) => {
                    const slot = classGrid[dayIdx]?.[hour]
                    const isSelected =
                      selectedSlot?.dayIdx === dayIdx && selectedSlot?.hour === hour

                    if (isLunch) {
                      return (
                        <td
                          key={dayIdx}
                          className="border-l border-slate-200 px-3 py-2 text-center text-[11px] font-medium text-slate-400 italic"
                        >
                          Pause déjeuner
                        </td>
                      )
                    }

                    return (
                      <td
                        key={dayIdx}
                        onClick={() => handleSlotClick(dayIdx, hour)}
                        className={`border-l border-slate-200 p-1.5 h-14 align-top cursor-pointer transition ${
                          isSelected
                            ? 'ring-2 ring-inset ring-indigo-600 bg-indigo-50/40'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {slot ? (
                          <div
                            className={`h-full rounded-lg border p-2 flex flex-col justify-between ${slot.color}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold leading-tight truncate">
                                {slot.subjectName}
                              </span>
                              {!isInTargetWindow && (
                                <span className="text-[10px] px-1 rounded bg-white/70 font-semibold">
                                  Hors cible
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] opacity-80 truncate">
                              {slot.teacherName}
                            </span>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                            Libre
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}