function ThemeToggle({ theme, onToggle }) {
    return (
        <button className="theme-toggle" onClick={onToggle} title="Змінити тему">
            <span className="material-icons">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    )
}

export default ThemeToggle
