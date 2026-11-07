import { DAYS, HOURS } from '../engine/constants'

export function exportToCSV(scheduleData) {
  const rows = [['Classe', 'Jour', 'Créneau', 'Matière', 'Professeur']]

  scheduleData.classesGrid.forEach((classGrid, classIdx) => {
    DAYS.forEach((dayName, dIdx) => {
      HOURS.forEach((h) => {
        const slot = classGrid[dIdx][h]
        if (slot) {
          rows.push([
            `Classe ${classIdx + 1}`,
            dayName,
            `${h}h00 - ${h + 1}h00`,
            slot.subjectName,
            slot.teacherName,
          ])
        }
      })
    })
  })

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'emplois_du_temps_lycee.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(scheduleData) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(scheduleData, null, 2))
  const link = document.createElement('a')
  link.setAttribute('href', dataStr)
  link.setAttribute('download', 'emplois_du_temps_lycee.json')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}