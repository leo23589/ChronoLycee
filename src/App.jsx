import React, { useState, useMemo } from 'react'
import { INITIAL_SUBJECTS, DEFAULT_CONSTRAINTS } from './engine/constants'
import {
  generateTimetables,
  calculateIdealTeachers,
  trySwapClassSlots,
} from './engine/optimizer'
import { exportToCSV, exportToJSON } from './utils/exporters'
import Header from './components/Header'
import SidebarConfig from './components/SidebarConfig'
import TimetableGrid from './components/TimetableGrid'
import TeacherView from './components/TeacherView'
import AnalyticsView from './components/AnalyticsView'

export default function App() {
  const [totalStudents, setTotalStudents] = useState(300)
  const [studentsPerClass, setStudentsPerClass] = useState(30)
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS)
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS)
  const [activeTab, setActiveTab] = useState('classes')
  const [selectedClassIdx, setSelectedClassIdx] = useState(0)
  const [manualSchedule, setManualSchedule] = useState(null)

  const numClasses = Math.max(1, Math.ceil(totalStudents / Math.max(1, studentsPerClass)))

  const computedSchedule = useMemo(() => {
    setManualSchedule(null)
    return generateTimetables({
      numClasses,
      subjects,
      constraints,
    })
  }, [numClasses, subjects, constraints])

  const scheduleData = manualSchedule || computedSchedule

  const totalTeachers = useMemo(
    () => subjects.reduce((acc, s) => acc + Math.max(1, s.teachers), 0),
    [subjects]
  )

  const handleUpdateSubject = (id, field, value) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: Math.max(1, value) } : s))
    )
  }

  const handleAutoScaleTeachers = () => {
    setSubjects((prev) => calculateIdealTeachers(prev, numClasses, constraints))
  }

  const handleReoptimize = () => {
    setManualSchedule(
      generateTimetables({
        numClasses,
        subjects,
        constraints,
      })
    )
  }

  const handleSwapSlots = (classIdx, slotA, slotB) => {
    const result = trySwapClassSlots(scheduleData, classIdx, slotA, slotB, constraints)
    if (result.success) {
      setManualSchedule(result.nextSchedule)
    }
    return result
  }

  const safeClassIdx = Math.min(selectedClassIdx, numClasses - 1)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        totalStudents={totalStudents}
        numClasses={numClasses}
        totalTeachers={totalTeachers}
        stats={scheduleData.stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCSV={() => exportToCSV(scheduleData)}
        onExportJSON={() => exportToJSON(scheduleData)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <SidebarConfig
          totalStudents={totalStudents}
          setTotalStudents={setTotalStudents}
          studentsPerClass={studentsPerClass}
          setStudentsPerClass={setStudentsPerClass}
          numClasses={numClasses}
          constraints={constraints}
          setConstraints={setConstraints}
          subjects={subjects}
          onUpdateSubject={handleUpdateSubject}
          onAutoScaleTeachers={handleAutoScaleTeachers}
          onReoptimize={handleReoptimize}
        />

        <section className="flex-1 min-w-0">
          {activeTab === 'classes' && (
            <TimetableGrid
              scheduleData={scheduleData}
              selectedClassIdx={safeClassIdx}
              setSelectedClassIdx={setSelectedClassIdx}
              numClasses={numClasses}
              constraints={constraints}
              onSwapSlots={handleSwapSlots}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherView scheduleData={scheduleData} constraints={constraints} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView scheduleData={scheduleData} constraints={constraints} />
          )}
        </section>
      </main>
    </div>
  )
}