import React from 'react'

export default function AnalyticsView({ scheduleData, constraints }) {
  const { stats, teachersList } = scheduleData

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">
            Respect fenêtre ({constraints.idealStartHour}h-{constraints.idealEndHour}h)
          </p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {stats.windowComplianceRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.inTargetWindow} / {stats.totalPlaced} heures dans la cible
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Heure de fin moyenne</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {stats.avgEndHour}h00
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Objectif visé : {constraints.idealEndHour}h00
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Heures creuses (Trous)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalGaps}</p>
          <p className="text-xs text-slate-400 mt-1">
            Total sur l'ensemble des classes
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Heures non placées</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              stats.unassignedCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {stats.unassignedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Collisions évitées à 100%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Répartition de la charge par professeur
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teachersList.map((teacher) => {
            const pct = Math.min(
              100,
              Math.round((teacher.assignedHours / constraints.maxHoursPerTeacher) * 100)
            )
            return (
              <div
                key={teacher.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{teacher.name}</span>
                  <span className="font-medium text-slate-600">
                    {teacher.assignedHours}h / {constraints.maxHoursPerTeacher}h
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      teacher.assignedHours > constraints.maxHoursPerTeacher
                        ? 'bg-red-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}