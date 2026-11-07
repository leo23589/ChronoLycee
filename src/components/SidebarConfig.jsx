import React from 'react'
import { Sliders, Clock, Users, Wand2, RefreshCw } from 'lucide-react'

export default function SidebarConfig({
  totalStudents,
  setTotalStudents,
  studentsPerClass,
  setStudentsPerClass,
  numClasses,
  constraints,
  setConstraints,
  subjects,
  onUpdateSubject,
  onAutoScaleTeachers,
  onReoptimize,
}) {
  return (
    <aside className="w-full lg:w-88 shrink-0 space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Effectifs (Sans limite)
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            {numClasses} {numClasses > 1 ? 'classes' : 'classe'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Élèves au total
            </label>
            <input
              type="number"
              min="1"
              step="10"
              value={totalStudents}
              onChange={(e) => setTotalStudents(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Élèves / classe
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={studentsPerClass}
              onChange={(e) => setStudentsPerClass(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[150, 300, 600, 1200, 2500].map((preset) => (
            <button
              key={preset}
              onClick={() => setTotalStudents(preset)}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                totalStudents === preset
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset} élèves
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          Fenêtre Horaire Cible & Légèreté
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Début idéal
            </label>
            <select
              value={constraints.idealStartHour}
              onChange={(e) =>
                setConstraints((prev) => ({
                  ...prev,
                  idealStartHour: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-900"
            >
              {[7, 8, 9, 10].map((h) => (
                <option key={h} value={h}>
                  {h}h00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Fin idéale visée
            </label>
            <select
              value={constraints.idealEndHour}
              onChange={(e) =>
                setConstraints((prev) => ({
                  ...prev,
                  idealEndHour: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-900"
            >
              {[14, 15, 16, 17, 18].map((h) => (
                <option key={h} value={h}>
                  {h}h00
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Max idéal / jour
            </label>
            <input
              type="number"
              min="3"
              max="9"
              value={constraints.idealHoursPerDay}
              onChange={(e) =>
                setConstraints((prev) => ({
                  ...prev,
                  idealHoursPerDay: Math.max(3, Number(e.target.value) || 5),
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Plafond dur / jour
            </label>
            <input
              type="number"
              min="4"
              max="10"
              value={constraints.maxHoursPerDay}
              onChange={(e) =>
                setConstraints((prev) => ({
                  ...prev,
                  maxHoursPerDay: Math.max(4, Number(e.target.value) || 7),
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={constraints.enforceLunchBreak}
            onChange={(e) =>
              setConstraints((prev) => ({
                ...prev,
                enforceLunchBreak: e.target.checked,
              }))
            }
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Pause méridienne obligatoire (12h00 - 13h00)
        </label>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Profs & Matières (Min. 1)
          </h2>
          <button
            onClick={onAutoScaleTeachers}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Dimensionner ({constraints.idealStartHour}h-{constraints.idealEndHour}h)
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const totalNeeded = sub.hoursPerClass * numClasses
            const maxCap = sub.teachers * constraints.maxHoursPerTeacher
            const isShortage = totalNeeded > maxCap

            return (
              <div
                key={sub.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{sub.name}</span>
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      isShortage
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {totalNeeded}h / {maxCap}h max
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2 py-1">
                    <span className="text-[11px] text-slate-500">Profs:</span>
                    <input
                      type="number"
                      min="1"
                      value={sub.teachers}
                      onChange={(e) =>
                        onUpdateSubject(sub.id, 'teachers', Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-12 text-right text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2 py-1">
                    <span className="text-[11px] text-slate-500">Heures/cl:</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={sub.hoursPerClass}
                      onChange={(e) =>
                        onUpdateSubject(
                          sub.id,
                          'hoursPerClass',
                          Math.max(1, parseInt(e.target.value, 10) || 1)
                        )
                      }
                      className="w-10 text-right text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onReoptimize}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Relancer l'optimisation
        </button>
      </div>
    </aside>
  )
}