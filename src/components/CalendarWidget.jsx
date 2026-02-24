import { useState } from 'react'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTHS_UA = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
]

function CalendarWidget({ selectedDate, onSelectDate, taskDates }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sel = selectedDate ? new Date(selectedDate) : today
    const [viewMonth, setViewMonth] = useState(sel.getMonth())
    const [viewYear, setViewYear] = useState(sel.getFullYear())

    const firstDay = new Date(viewYear, viewMonth, 1)
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11)
            setViewYear(viewYear - 1)
        } else {
            setViewMonth(viewMonth - 1)
        }
    }

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0)
            setViewYear(viewYear + 1)
        } else {
            setViewMonth(viewMonth + 1)
        }
    }

    const goToday = () => {
        setViewMonth(today.getMonth())
        setViewYear(today.getFullYear())
        onSelectDate(formatDate(today))
    }

    const formatDate = (d) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const cells = []
    for (let i = 0; i < startDay; i++) {
        cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>)
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d)
        const dateStr = formatDate(date)
        const isToday = dateStr === formatDate(today)
        const isSelected = dateStr === selectedDate
        const hasTasks = taskDates && taskDates.has(dateStr)

        let cls = 'cal-cell'
        if (isToday) cls += ' today'
        if (isSelected) cls += ' selected'
        if (hasTasks) cls += ' has-tasks'

        cells.push(
            <div key={d} className={cls} onClick={() => onSelectDate(dateStr)}>
                <span>{d}</span>
                {hasTasks && <span className="task-dot"></span>}
            </div>
        )
    }

    return (
        <div className="calendar-widget">
            <div className="cal-header">
                <button className="cal-nav" onClick={prevMonth}>
                    <span className="material-icons">chevron_left</span>
                </button>
                <div className="cal-title">
                    <span className="cal-month">{MONTHS_UA[viewMonth]}</span>
                    <span className="cal-year">{viewYear}</span>
                </div>
                <button className="cal-nav" onClick={nextMonth}>
                    <span className="material-icons">chevron_right</span>
                </button>
            </div>
            <div className="cal-days-header">
                {DAYS.map(day => (
                    <div key={day} className="cal-day-name">{day}</div>
                ))}
            </div>
            <div className="cal-grid">
                {cells}
            </div>
            <button className="cal-today-btn" onClick={goToday}>
                <span className="material-icons" style={{ fontSize: '16px' }}>today</span>
                Сьогодні
            </button>
        </div>
    )
}

export default CalendarWidget
