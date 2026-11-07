export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

export const INITIAL_SUBJECTS = [
  { id: 'math', name: 'Mathématiques', hoursPerClass: 4, teachers: 3, color: 'bg-blue-100 border-blue-300 text-blue-900' },
  { id: 'fr', name: 'Français', hoursPerClass: 4, teachers: 3, color: 'bg-rose-100 border-rose-300 text-rose-900' },
  { id: 'hg', name: 'Histoire-Géo', hoursPerClass: 3, teachers: 2, color: 'bg-amber-100 border-amber-300 text-amber-900' },
  { id: 'en', name: 'Anglais', hoursPerClass: 3, teachers: 2, color: 'bg-emerald-100 border-emerald-300 text-emerald-900' },
  { id: 'pc', name: 'Physique-Chimie', hoursPerClass: 3, teachers: 2, color: 'bg-purple-100 border-purple-300 text-purple-900' },
  { id: 'svt', name: 'SVT', hoursPerClass: 2, teachers: 2, color: 'bg-teal-100 border-teal-300 text-teal-900' },
  { id: 'eps', name: 'EPS', hoursPerClass: 2, teachers: 2, color: 'bg-orange-100 border-orange-300 text-orange-900' },
  { id: 'philo', name: 'Philosophie', hoursPerClass: 2, teachers: 1, color: 'bg-indigo-100 border-indigo-300 text-indigo-900' },
  { id: 'ses', name: 'SES / NSI', hoursPerClass: 3, teachers: 2, color: 'bg-cyan-100 border-cyan-300 text-cyan-900' },
]

export const DEFAULT_CONSTRAINTS = {
  idealStartHour: 8,
  idealEndHour: 15,
  idealHoursPerDay: 5,
  maxHoursPerDay: 7,
  lunchBreakHour: 12,
  enforceLunchBreak: true,
  maxHoursPerTeacher: 18,
}