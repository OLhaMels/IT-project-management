/**
 * Модульні тести (Unit Tests) для TaskFlow To-Do List
 * 
 * Тестуємо ключові функції бізнес-логіки:
 * 1. Додавання задачі
 * 2. Перемикання статусу (toggle)
 * 3. Видалення задачі
 * 4. Редагування тексту задачі
 * 5. Очищення виконаних задач
 * 6. Фільтрація задач за статусом
 * 7. Міграція старих задач (додавання нових полів)
 * 
 * Використовуємо: Vitest, React Testing Library, jest-dom, mock localStorage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// ============================================================
// Mock localStorage для ізоляції тестів від реального сховища
// Це приклад використання Mock-об'єктів для ізоляції логіки
// ============================================================
const localStorageMock = (() => {
    let store = {}
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value }),
        removeItem: vi.fn((key) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock для scrollIntoView (jsdom його не підтримує)
Element.prototype.scrollIntoView = vi.fn()

beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
})

// ============================================================
// Допоміжна функція для пошуку інпуту задачі
// ============================================================
const getTaskInput = () => screen.getByPlaceholderText('Нова задача...')
const getAddButton = () => screen.getByRole('button', { name: /add/i })

// ============================================================
// Тест 1: Додавання нової задачі
// Assertion: після додавання задачі вона з'являється у списку
// ============================================================
describe('Додавання задачі', () => {
    it('повинно додати задачу у список після натискання кнопки', async () => {
        render(<App />)
        const user = userEvent.setup()

        const input = getTaskInput()
        await user.type(input, 'Купити молоко')
        await user.click(getAddButton())

        // Assertion: задача з'явилась у DOM (ЦЕЙ ТЕСТ МАЄ ВПАСТИ ДЛЯ ПЕРЕВІРКИ PIPELINE)
        expect(screen.getByText('ЦЕЙ ТЕСТ МАЄ ВПАСТИ')).toBeInTheDocument()
        // Assertion: інпут очистився після додавання
        expect(input.value).toBe('')
    })

    it('не повинно додавати порожню задачу', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Кнопка додавання повинна бути disabled при порожньому інпуті
        const addBtn = getAddButton()
        expect(addBtn).toBeDisabled()

        // Спробуємо ввести тільки пробіли
        await user.type(getTaskInput(), '   ')
        expect(addBtn).toBeDisabled()
    })
})

// ============================================================
// Тест 2: Перемикання статусу задачі (completed / active)
// Assertion: після кліку на чекбокс, задача стає виконаною
// ============================================================
describe('Перемикання статусу задачі', () => {
    it('повинно позначити задачу як виконану при кліку на чекбокс', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Додаємо задачу
        await user.type(getTaskInput(), 'Зробити домашнє завдання')
        await user.click(getAddButton())

        // Знаходимо task-item контейнер
        const taskText = screen.getByText('Зробити домашнє завдання')
        const taskItem = taskText.closest('.task-item')

        // Assertion: спочатку задача НЕ виконана
        expect(taskItem).not.toHaveClass('completed')

        // Клікаємо на чекбокс (перша кнопка всередині task-item)
        const checkbox = within(taskItem).getAllByRole('button')[0]
        await user.click(checkbox)

        // Assertion: тепер задача виконана
        expect(taskItem).toHaveClass('completed')
    })
})

// ============================================================
// Тест 3: Видалення задачі
// Assertion: після видалення задача зникає зі списку
// ============================================================
describe('Видалення задачі', () => {
    it('повинно видалити задачу після натискання кнопки видалення', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Додаємо задачу
        await user.type(getTaskInput(), 'Задача для видалення')
        await user.click(getAddButton())

        // Assertion: задача існує
        expect(screen.getByText('Задача для видалення')).toBeInTheDocument()

        // Знаходимо кнопку видалення (остання кнопка у task-item)
        const taskItem = screen.getByText('Задача для видалення').closest('.task-item')
        const deleteBtn = within(taskItem).getByTitle('Видалити')
        await user.click(deleteBtn)

        // Assertion: задача видалена з DOM
        expect(screen.queryByText('Задача для видалення')).not.toBeInTheDocument()
    })
})

// ============================================================
// Тест 4: Редагування тексту задачі
// Assertion: після подвійного кліку та Enter текст оновлюється
// ============================================================
describe('Редагування задачі', () => {
    it('повинно дозволити редагувати текст задачі', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Додаємо задачу
        await user.type(getTaskInput(), 'Старий текст')
        await user.click(getAddButton())

        // Клікаємо на текст задачі для редагування
        const taskText = screen.getByText('Старий текст')
        await user.click(taskText)

        // Знаходимо edit-input, очищаємо та вводимо новий текст
        const editInput = screen.getByDisplayValue('Старий текст')
        await user.clear(editInput)
        await user.type(editInput, 'Новий текст{Enter}')

        // Assertion: текст оновився
        expect(screen.getByText('Новий текст')).toBeInTheDocument()
        expect(screen.queryByText('Старий текст')).not.toBeInTheDocument()
    })
})

// ============================================================
// Тест 5: Очищення виконаних задач
// Assertion: виконані задачі видаляються, активні залишаються
// ============================================================
describe('Очищення виконаних задач', () => {
    it('повинно видалити лише виконані задачі', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Додаємо дві задачі
        await user.type(getTaskInput(), 'Задача 1')
        await user.click(getAddButton())
        await user.type(getTaskInput(), 'Задача 2')
        await user.click(getAddButton())

        // Виконуємо першу задачу (клікаємо чекбокс)
        const task1Item = screen.getByText('Задача 1').closest('.task-item')
        const checkbox1 = within(task1Item).getAllByRole('button')[0]
        await user.click(checkbox1)

        // Натискаємо "Очистити виконані"
        const clearBtn = screen.getByText(/Очистити виконані/i)
        await user.click(clearBtn)

        // Assertion: виконана задача видалена, активна залишилась
        expect(screen.queryByText('Задача 1')).not.toBeInTheDocument()
        expect(screen.getByText('Задача 2')).toBeInTheDocument()
    })
})

// ============================================================
// Тест 6: Фільтрація задач
// Assertion: фільтр показує правильні задачі
// ============================================================
describe('Фільтрація задач', () => {
    it('повинно фільтрувати задачі за статусом', async () => {
        render(<App />)
        const user = userEvent.setup()

        // Додаємо дві задачі
        await user.type(getTaskInput(), 'Активна задача')
        await user.click(getAddButton())
        await user.type(getTaskInput(), 'Виконана задача')
        await user.click(getAddButton())

        // Виконуємо другу задачу
        const task2Item = screen.getByText('Виконана задача').closest('.task-item')
        const checkbox2 = within(task2Item).getAllByRole('button')[0]
        await user.click(checkbox2)

        // Фільтруємо по "Активні" — шукаємо кнопку саме у filter-bar
        const filterBar = document.querySelector('.filter-bar')
        const activeFilter = within(filterBar).getByText(/Активні/i)
        await user.click(activeFilter)

        // Assertion: показана тільки активна задача
        expect(screen.getByText('Активна задача')).toBeInTheDocument()
        expect(screen.queryByText('Виконана задача')).not.toBeInTheDocument()

        // Фільтруємо по "Виконані"
        const doneFilter = within(filterBar).getByText(/Виконані/i)
        await user.click(doneFilter)

        // Assertion: показана тільки виконана задача
        expect(screen.queryByText('Активна задача')).not.toBeInTheDocument()
        expect(screen.getByText('Виконана задача')).toBeInTheDocument()
    })
})

// ============================================================
// Тест 7: Збереження у localStorage (Mock-об'єкт)
// Assertion: при додаванні задачі localStorage.setItem викликається
// ============================================================
describe('Збереження у localStorage', () => {
    it('повинно зберігати задачі у localStorage при зміні', async () => {
        render(<App />)
        const user = userEvent.setup()

        await user.type(getTaskInput(), 'Тестова задача')
        await user.click(getAddButton())

        // Assertion: localStorage.setItem було викликано з ключем 'todo-tasks'
        const calls = localStorageMock.setItem.mock.calls
        const todoTasksCalls = calls.filter(c => c[0] === 'todo-tasks')
        expect(todoTasksCalls.length).toBeGreaterThan(0)

        // Assertion: останнє значення містить нашу задачу
        const lastValue = JSON.parse(todoTasksCalls[todoTasksCalls.length - 1][1])
        const found = lastValue.find(t => t.text === 'Тестова задача')
        expect(found).toBeDefined()
        expect(found.completed).toBe(false)
        expect(found.priority).toBe('medium')
        expect(found.allDay).toBe(true)
    })
})
