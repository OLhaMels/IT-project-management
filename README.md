[![CI/CD Pipeline](https://github.com/OLhaMels/IT-project-management/actions/workflows/main.yml/badge.svg)](https://github.com/OLhaMels/IT-project-management/actions/workflows/main.yml)
# 📝 To-Do List

A modern, clean To-Do List app built with **React** and **Vite**.

[**🌐 Live Demo**](https://it-project-management-five.vercel.app/)

## ✨ Features

- **Add tasks** — type and press Enter or click "+"
- **Complete tasks** — click the checkbox to mark done
- **Edit tasks** — click on task text to edit, Enter to save
- **Delete tasks** — click × to remove
- **Filter** — switch between Усі / Активні / Виконані
- **Clear completed** — remove all finished tasks at once
- **Progress bar** — visual indicator of completion
- **LocalStorage** — tasks persist between sessions

## 🛠 Tech Stack

- [React](https://react.dev/) 18
- [Vite](https://vitejs.dev/) 5
- Vanilla CSS (no frameworks)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:5173` by default.

## 📁 Project Structure

```
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Main component
    ├── index.css         # Global styles
    └── components/
        └── TaskItem.jsx  # Task item component
```

## 📄 License

This project is for educational purposes.
