import { useState } from 'react'

const PRIORITIES = [
    { value: 'low', label: 'Низький', icon: 'arrow_downward' },
    { value: 'medium', label: 'Середній', icon: 'remove' },
    { value: 'high', label: 'Високий', icon: 'arrow_upward' },
]

function TaskForm({ onAdd, selectedDate, categories, onAddCategory }) {
    const [text, setText] = useState('')
    const [date, setDate] = useState(selectedDate || '')
    const [allDay, setAllDay] = useState(true)
    const [time, setTime] = useState('09:00')
    const [priority, setPriority] = useState('medium')
    const [category, setCategory] = useState('')
    const [newCat, setNewCat] = useState('')
    const [expanded, setExpanded] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!text.trim()) return
        onAdd({
            id: Date.now(),
            text: text.trim(),
            completed: false,
            date: date || selectedDate,
            time: allDay ? null : time,
            allDay,
            priority,
            category: category || null,
            order: Date.now(),
        })
        setText('')
        setAllDay(true)
        setTime('09:00')
        setPriority('medium')
        setCategory('')
    }

    const handleAddCategory = () => {
        const trimmed = newCat.trim()
        if (trimmed && !categories.includes(trimmed)) {
            onAddCategory(trimmed)
            setCategory(trimmed)
        }
        setNewCat('')
    }

    const handleCatKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddCategory()
        }
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="task-form-main">
                <input
                    id="task-input"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Нова задача..."
                    className="task-form-input"
                    autoFocus
                />
                <button
                    type="button"
                    className={`task-form-expand ${expanded ? 'active' : ''}`}
                    onClick={() => setExpanded(!expanded)}
                    title="Додаткові опції"
                >
                    <span className="material-icons">tune</span>
                </button>
                <button
                    id="add-task-btn"
                    type="submit"
                    className="task-form-submit"
                    disabled={!text.trim()}
                >
                    <span className="material-icons">add</span>
                </button>
            </div>

            {expanded && (
                <div className="task-form-options">
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <span className="material-icons" style={{ fontSize: '16px' }}>event</span>
                                Дата
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="form-date-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="material-icons" style={{ fontSize: '16px' }}>schedule</span>
                                Час
                            </label>
                            <div className="time-toggle-group">
                                <button
                                    type="button"
                                    className={`time-toggle-btn ${allDay ? 'active' : ''}`}
                                    onClick={() => setAllDay(true)}
                                >
                                    Цілий день
                                </button>
                                <button
                                    type="button"
                                    className={`time-toggle-btn ${!allDay ? 'active' : ''}`}
                                    onClick={() => setAllDay(false)}
                                >
                                    Час
                                </button>
                            </div>
                            {!allDay && (
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="form-time-input"
                                />
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <span className="material-icons" style={{ fontSize: '16px' }}>flag</span>
                                Пріоритет
                            </label>
                            <div className="priority-selector">
                                {PRIORITIES.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        className={`priority-btn priority-${p.value} ${priority === p.value ? 'active' : ''}`}
                                        onClick={() => setPriority(p.value)}
                                        title={p.label}
                                    >
                                        <span className="material-icons" style={{ fontSize: '16px' }}>{p.icon}</span>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="material-icons" style={{ fontSize: '16px' }}>label</span>
                                Категорія
                            </label>
                            <div className="category-selector">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Без категорії</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <div className="add-category-row">
                                    <input
                                        type="text"
                                        value={newCat}
                                        onChange={(e) => setNewCat(e.target.value)}
                                        onKeyDown={handleCatKeyDown}
                                        placeholder="Нова категорія"
                                        className="form-cat-input"
                                    />
                                    <button
                                        type="button"
                                        className="form-cat-add"
                                        onClick={handleAddCategory}
                                        disabled={!newCat.trim()}
                                    >
                                        <span className="material-icons" style={{ fontSize: '16px' }}>add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}

export default TaskForm
