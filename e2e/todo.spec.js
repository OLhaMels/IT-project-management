/**
 * E2E (End-to-End) тести для TaskFlow To-Do List
 * 
 * Наскрізне тестування критичних шляхів користувача:
 * 
 * Сценарій 1: "Додавання нової задачі з усіма параметрами"
 *   - Користувач вводить текст задачі
 *   - Розкриває додаткові опції (дата, час, пріоритет, категорія)
 *   - Натискає кнопку додавання
 *   - Перевіряє що задача з'явилась з усіма мітками
 * 
 * Сценарій 2: "Виконання задачі та очищення виконаних"
 *   - Користувач додає кілька задач
 *   - Позначає одну як виконану
 *   - Натискає "Очистити виконані"
 *   - Перевіряє що виконана задача зникла, інша залишилась
 */

import { test, expect } from '@playwright/test'

// Очищаємо localStorage перед кожним тестом
test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForSelector('.app-layout')
})

// ==================================================================
// Сценарій 1: Додавання нової задачі з усіма параметрами
// Критичний шлях: Користувач створює задачу з датою, часом, 
// пріоритетом і категорією
// ==================================================================
test.describe('Сценарій 1: Додавання нової задачі', () => {
    test('користувач може додати задачу з пріоритетом та категорією', async ({ page }) => {
        // Крок 1: Вводимо текст задачі
        const taskInput = page.locator('#task-input')
        await taskInput.fill('Підготувати презентацію')

        // Крок 2: Розкриваємо додаткові опції
        await page.locator('.task-form-expand').click()

        // Перевіряємо що опції з'явились
        await expect(page.locator('.task-form-options')).toBeVisible()

        // Крок 3: Обираємо високий пріоритет
        await page.locator('.priority-btn.priority-high').click()
        await expect(page.locator('.priority-btn.priority-high')).toHaveClass(/active/)

        // Крок 4: Вибираємо час (замість "Цілий день")
        const timeToggleBtn = page.locator('.time-toggle-btn').filter({ hasText: 'Час' })
        await timeToggleBtn.click()

        // Перевіряємо що з'явився input для часу
        const timeInput = page.locator('.form-time-input')
        await expect(timeInput).toBeVisible()
        await timeInput.fill('14:30')

        // Крок 5: Обираємо категорію "Робота"
        await page.locator('.form-select').selectOption('Робота')

        // Крок 6: Натискаємо кнопку додавання
        await page.locator('#add-task-btn').click()

        // =================== ПЕРЕВІРКИ ===================

        // Перевірка 1: Задача з'явилась у списку
        const taskItem = page.locator('.task-item').first()
        await expect(taskItem).toBeVisible()
        await expect(taskItem.locator('.task-text')).toHaveText('Підготувати презентацію')

        // Перевірка 2: Пріоритет відображається як "ВИСОКИЙ" (бейдж)
        await expect(taskItem.locator('.priority-badge')).toContainText('Високий')

        // Перевірка 3: Час відображається
        await expect(taskItem.locator('.time-badge').first()).toContainText('14:30')

        // Перевірка 4: Категорія відображається
        await expect(taskItem.locator('.category-badge')).toHaveText('Робота')

        // Перевірка 5: Інпут очистився
        await expect(taskInput).toHaveValue('')

        // Перевірка 6: Прогрес кільце показує 0%
        await expect(page.locator('.progress-ring-text')).toHaveText('0%')
    })
})

// ==================================================================
// Сценарій 2: Виконання задачі та очищення виконаних
// Критичний шлях: Користувач виконує задачі та очищує список
// ==================================================================
test.describe('Сценарій 2: Виконання та очищення задач', () => {
    test('користувач може виконати задачу та очистити виконані', async ({ page }) => {
        const taskInput = page.locator('#task-input')

        // Крок 1: Додаємо першу задачу
        await taskInput.fill('Задача для виконання')
        await page.locator('#add-task-btn').click()

        // Крок 2: Додаємо другу задачу
        await taskInput.fill('Задача яка залишиться')
        await page.locator('#add-task-btn').click()

        // Перевіряємо що обидві задачі на місці
        await expect(page.locator('.task-item')).toHaveCount(2)

        // Крок 3: Позначаємо першу задачу як виконану (клік на чекбокс)
        const firstTask = page.locator('.task-item').filter({ hasText: 'Задача для виконання' })
        await firstTask.locator('.checkbox-btn').click()

        // Перевірка: задача має клас "completed"
        await expect(firstTask).toHaveClass(/completed/)

        // Перевірка: прогрес оновився до 50%
        await expect(page.locator('.progress-ring-text')).toHaveText('50%')

        // Крок 4: Натискаємо "Очистити виконані"
        await page.locator('.clear-btn').click()

        // =================== ПЕРЕВІРКИ ===================

        // Перевірка 1: Залишилась лише одна задача
        await expect(page.locator('.task-item')).toHaveCount(1)

        // Перевірка 2: Це задача яка НЕ була виконана
        await expect(page.locator('.task-text')).toHaveText('Задача яка залишиться')

        // Перевірка 3: Прогрес скинувся до 0%
        await expect(page.locator('.progress-ring-text')).toHaveText('0%')

        // Перевірка 4: Кнопка "Очистити виконані" зникла (немає виконаних)
        await expect(page.locator('.clear-btn')).not.toBeVisible()
    })
})
