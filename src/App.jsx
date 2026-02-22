import { useState, useEffect } from 'react'
import TaskItem from './components/TaskItem'

function App() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('todo-tasks')
        return saved ? JSON.parse(saved) : []
    })
    const [input, setInput] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        localStorage.setItem('todo-tasks', JSON.stringify(tasks))
    }, [tasks])

    const addTask = (e) => {
        e.preventDefault()
        if (!input.trim()) return
        setTasks([
            ...tasks,
            { id: Date.now(), text: input.trim(), completed: false }
        ])
        setInput('')
    }

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id))
    }

    const editTask = (id, newText) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, text: newText } : task
        ))
    }

    const clearCompleted = () => {
        setTasks(tasks.filter(task => !task.completed))
    }

    const total = tasks.length
    const done = tasks.filter(t => t.completed).length
    const active = total - done
    const progress = total === 0 ? 0 : Math.round((done / total) * 100)

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed
        if (filter === 'done') return task.completed
        return true
    })

    return (
        <div className="app-container">
            <div className="card">
                <h1 className="title">Your To Do</h1>

                {total > 0 && (
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">Progress</span>
                            <span className="progress-value">{done}/{total} done</span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <form onSubmit={addTask} className="input-group">
                    <input
                        id="task-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Add new task"
                        autoFocus
                    />
                    <button id="add-task-btn" type="submit" className="add-btn" disabled={!input.trim()}>
                        <span className="add-icon">+</span>
                    </button>
                </form>

                {total > 0 && (
                    <div className="filter-bar">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Усі задачі ({total})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Активні ({active})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'done' ? 'active' : ''}`}
                            onClick={() => setFilter('done')}
                        >
                            Виконані ({done})
                        </button>
                    </div>
                )}

                <div className="task-list">
                    {filteredTasks.length === 0 ? (
                        <p className="empty">
                            {filter === 'all'
                                ? 'No tasks yet — add one above'
                                : filter === 'active'
                                    ? 'Усі задачі виконані!'
                                    : 'Немає виконаних задач'}
                        </p>
                    ) : (
                        filteredTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => toggleTask(task.id)}
                                onDelete={() => deleteTask(task.id)}
                                onEdit={(newText) => editTask(task.id, newText)}
                            />
                        ))
                    )}
                </div>

                {done > 0 && (
                    <div className="clear-section">
                        <button className="clear-btn" onClick={clearCompleted}>
                            Очистити виконані
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
