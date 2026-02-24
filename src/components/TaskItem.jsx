import { useState, useRef, useEffect } from 'react'

const PRIORITY_CONFIG = {
    low: { label: 'Низький', color: '#4caf50' },
    medium: { label: 'Середній', color: '#ff9800' },
    high: { label: 'Високий', color: '#f44336' },
}

function TaskItem({ task, onToggle, onDelete, onEdit, onDragStart, onDragOver, onDrop, isDragging }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(task.text)
    const editRef = useRef(null)

    useEffect(() => {
        if (isEditing && editRef.current) {
            editRef.current.focus()
        }
    }, [isEditing])

    const startEdit = () => {
        if (!task.completed) {
            setEditText(task.text)
            setIsEditing(true)
        }
    }

    const handleSave = () => {
        const trimmed = editText.trim()
        if (trimmed && trimmed !== task.text) {
            onEdit(trimmed)
        } else {
            setEditText(task.text)
        }
        setIsEditing(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') {
            setEditText(task.text)
            setIsEditing(false)
        }
    }

    const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

    return (
        <div
            className={`task-item ${task.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''} priority-${task.priority || 'medium'}`}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className="drag-handle" title="Перетягнути">
                <span className="material-icons">drag_indicator</span>
            </div>

            <button className="checkbox-btn" onClick={onToggle}>
                <span className={`checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <span className="tick">✓</span>}
                </span>
            </button>

            <div className="task-content">
                <div className="task-main-row">
                    {isEditing ? (
                        <input
                            ref={editRef}
                            className="edit-input"
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                        />
                    ) : (
                        <span className="task-text" onClick={startEdit}>
                            {task.text}
                        </span>
                    )}
                </div>
                <div className="task-meta">
                    <span className="priority-badge" style={{ background: pri.color }}>
                        {pri.label}
                    </span>
                    {task.time && !task.allDay && (
                        <span className="time-badge">
                            <span className="material-icons" style={{ fontSize: '13px' }}>schedule</span>
                            {task.time}
                        </span>
                    )}
                    {task.allDay && (
                        <span className="time-badge allday">
                            Цілий день
                        </span>
                    )}
                    {task.category && (
                        <span className="category-badge">
                            {task.category}
                        </span>
                    )}
                </div>
            </div>

            <button className="delete-btn" onClick={onDelete} title="Видалити">
                <span className="material-icons">close</span>
            </button>
        </div>
    )
}

export default TaskItem
