import { useState, useEffect, useMemo } from 'react'
import TaskItem from './components/TaskItem'
import TaskForm from './components/TaskForm'
import CalendarWidget from './components/CalendarWidget'
import ThemeToggle from './components/ThemeToggle'

const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const formatDateLabel = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === formatDate(today)) return 'Сьогодні'
    if (dateStr === formatDate(tomorrow)) return 'Завтра'
    if (dateStr === formatDate(yesterday)) return 'Вчора'

    const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
        'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']
    const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
}

// Migrate old tasks that don't have new fields
const migrateTasks = (tasks) => {
    return tasks.map(t => ({
        date: formatDate(new Date()),
        time: null,
        allDay: true,
        priority: 'medium',
        category: null,
        order: t.id,
        ...t,
    }))
}

function App() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('todo-tasks')
        return saved ? migrateTasks(JSON.parse(saved)) : []
    })
    const [filter, setFilter] = useState('all')
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('todo-categories')
        return saved ? JSON.parse(saved) : ['Робота', 'Особисте', 'Навчання']
    })
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('todo-theme') || 'light'
    })
    const [dragId, setDragId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('todo-tasks', JSON.stringify(tasks))
    }, [tasks])

    useEffect(() => {
        localStorage.setItem('todo-categories', JSON.stringify(categories))
    }, [categories])

    useEffect(() => {
        localStorage.setItem('todo-theme', theme)
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    const addTask = (task) => {
        setTasks([...tasks, task])
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

    const addCategory = (cat) => {
        if (!categories.includes(cat)) {
            setCategories([...categories, cat])
        }
    }

    // Drag and drop
    const handleDragStart = (id) => setDragId(id)
    const handleDragOver = (e) => e.preventDefault()
    const handleDrop = (targetId) => {
        if (dragId === null || dragId === targetId) return
        const dragIndex = tasks.findIndex(t => t.id === dragId)
        const targetIndex = tasks.findIndex(t => t.id === targetId)
        if (dragIndex === -1 || targetIndex === -1) return
        const newTasks = [...tasks]
        const [dragged] = newTasks.splice(dragIndex, 1)
        newTasks.splice(targetIndex, 0, dragged)
        setTasks(newTasks)
        setDragId(null)
    }

    // Task dates set for calendar dots
    const taskDates = useMemo(() => {
        const set = new Set()
        tasks.forEach(t => { if (t.date) set.add(t.date) })
        return set
    }, [tasks])

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        let result = tasks.filter(t => t.date === selectedDate)
        if (filter === 'active') result = result.filter(t => !t.completed)
        if (filter === 'done') result = result.filter(t => t.completed)
        if (selectedCategory !== 'all') {
            result = result.filter(t => t.category === selectedCategory)
        }
        // Sort: uncompleted first, then by priority, then by time
        const priOrder = { high: 0, medium: 1, low: 2 }
        result.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            if (priOrder[a.priority] !== priOrder[b.priority]) return priOrder[a.priority] - priOrder[b.priority]
            if (a.time && b.time) return a.time.localeCompare(b.time)
            if (a.time) return -1
            if (b.time) return 1
            return 0
        })
        return result
    }, [tasks, selectedDate, filter, selectedCategory])

    const dayTasks = tasks.filter(t => t.date === selectedDate)
    const total = dayTasks.length
    const done = dayTasks.filter(t => t.completed).length
    const active = total - done
    const progress = total === 0 ? 0 : Math.round((done / total) * 100)

    return (
        <div className="app-layout">
            {/* Mobile sidebar toggle */}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span className="material-icons">{sidebarOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="app-logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="material-icons logo-icon">check_circle</span>
                        To Do List
                        {import.meta.env.VITE_APP_STATUS && (
                            <span 
                                className="app-status-badge" 
                                style={{ 
                                    fontSize: '10px', 
                                    marginLeft: '8px', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    background: 'var(--primary-color, #4f46e5)', 
                                    color: 'white',
                                    fontWeight: 'normal',
                                    lineHeight: '1'
                                }}
                            >
                                {import.meta.env.VITE_APP_STATUS}
                            </span>
                        )}
                    </h1>
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                </div>

                <CalendarWidget
                    selectedDate={selectedDate}
                    onSelectDate={(d) => { setSelectedDate(d); setSidebarOpen(false) }}
                    taskDates={taskDates}
                />

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">
                        <span className="material-icons" style={{ fontSize: '18px' }}>label</span>
                        Категорії
                    </h3>
                    <div className="category-list">
                        <button
                            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            <span className="cat-dot" style={{ background: '#888' }}></span>
                            Усі
                            <span className="cat-count">{dayTasks.length}</span>
                        </button>
                        {categories.map(cat => {
                            const count = dayTasks.filter(t => t.category === cat).length
                            return (
                                <button
                                    key={cat}
                                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    <span className="cat-dot"></span>
                                    {cat}
                                    <span className="cat-count">{count}</span>
                                </button>
                            )
                        })}
                        <button
                            className={`category-item ${selectedCategory === '__none' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('__none')}
                        >
                            <span className="cat-dot" style={{ background: '#bbb' }}></span>
                            Без категорії
                            <span className="cat-count">{dayTasks.filter(t => !t.category).length}</span>
                        </button>
                    </div>
                </div>

                <div className="sidebar-section sidebar-stats">
                    <div className="stat-item">
                        <span className="stat-number">{tasks.length}</span>
                        <span className="stat-label">Всього</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{tasks.filter(t => t.completed).length}</span>
                        <span className="stat-label">Виконано</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{tasks.filter(t => !t.completed).length}</span>
                        <span className="stat-label">Активних</span>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

            {/* Main content */}
            <main className="main-content">
                <div className="main-header">
                    <div>
                        <h2 className="date-title">{formatDateLabel(selectedDate)}</h2>
                        <p className="date-subtitle">{selectedDate}</p>
                    </div>
                    {total > 0 && (
                        <div className="header-progress">
                            <div className="progress-ring-container">
                                <svg className="progress-ring" width="52" height="52">
                                    <circle className="progress-ring-bg" cx="26" cy="26" r="22" />
                                    <circle
                                        className="progress-ring-fill"
                                        cx="26" cy="26" r="22"
                                        style={{
                                            strokeDasharray: `${2 * Math.PI * 22}`,
                                            strokeDashoffset: `${2 * Math.PI * 22 * (1 - progress / 100)}`
                                        }}
                                    />
                                </svg>
                                <span className="progress-ring-text">{progress}%</span>
                            </div>
                            <div className="progress-info">
                                <span>{done}/{total}</span>
                                <span className="progress-info-label">виконано</span>
                            </div>
                        </div>
                    )}
                </div>

                <TaskForm
                    onAdd={addTask}
                    selectedDate={selectedDate}
                    categories={categories}
                    onAddCategory={addCategory}
                />

                {total > 0 && (
                    <div className="filter-bar">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}>
                            Усі ({total})
                        </button>
                        <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}>
                            Активні ({active})
                        </button>
                        <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`}
                            onClick={() => setFilter('done')}>
                            Виконані ({done})
                        </button>
                    </div>
                )}

                <div className="task-list">
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state">
                            <span className="material-icons empty-icon">
                                {filter === 'all' ? 'add_task' : filter === 'active' ? 'done_all' : 'search_off'}
                            </span>
                            <p className="empty-text">
                                {filter === 'all'
                                    ? 'Немає задач на цей день'
                                    : filter === 'active'
                                        ? 'Усі задачі виконані! 🎉'
                                        : 'Немає виконаних задач'}
                            </p>
                            {filter === 'all' && (
                                <p className="empty-hint">Додайте першу задачу вище</p>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => toggleTask(task.id)}
                                onDelete={() => deleteTask(task.id)}
                                onEdit={(newText) => editTask(task.id, newText)}
                                onDragStart={() => handleDragStart(task.id)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(task.id)}
                                isDragging={dragId === task.id}
                            />
                        ))
                    )}
                </div>

                {done > 0 && (
                    <div className="clear-section">
                        <button className="clear-btn" onClick={clearCompleted}>
                            <span className="material-icons" style={{ fontSize: '16px' }}>delete_sweep</span>
                            Очистити виконані
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
