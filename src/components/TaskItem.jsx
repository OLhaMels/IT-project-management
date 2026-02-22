import { useState, useRef, useEffect } from 'react'

function TaskItem({ task, onToggle, onDelete, onEdit }) {
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
        if (e.key === 'Enter') {
            handleSave()
        }
        if (e.key === 'Escape') {
            setEditText(task.text)
            setIsEditing(false)
        }
    }

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            <button className="checkbox-btn" onClick={onToggle}>
                <span className={`checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <span className="tick">✓</span>}
                </span>
            </button>

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

            <button className="delete-btn" onClick={onDelete}>×</button>
        </div>
    )
}

export default TaskItem
