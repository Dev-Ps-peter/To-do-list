document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskTiles = document.getElementById('task-tiles');

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            await addTask(taskText);
            taskInput.value = '';
        }
    });

    taskTiles.addEventListener('click', async (e) => {
        const target = e.target;
        const taskTile = target.closest('.task-tile');
        const taskId = taskTile?.dataset.id;

        if (!taskId) return;

        if (target.classList.contains('delete')) {
            await deleteTask(taskId);
        } else if (target.classList.contains('edit')) {
            const newTaskText = prompt('Edit Task:', taskTile.querySelector('span').textContent.trim());
            if (newTaskText !== null) {
                await editTask(taskId, newTaskText);
            }
        } else if (target.classList.contains('complete')) {
            await toggleTaskComplete(taskId);
        }
    });

    async function fetchTasks() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) throw new Error('Network response was not ok');
            const tasks = await response.json();
            taskTiles.innerHTML = '';
            tasks.forEach(renderTask);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    }

    async function addTask(taskText) {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: taskText })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    }

    async function deleteTask(taskId) {
        try {
            const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    }

    async function editTask(taskId, newText) {
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
        } catch (error) {
            console.error('Failed to edit task:', error);
        }
    }

    async function toggleTaskComplete(taskId) {
        try {
            const response = await fetch(`/tasks/${taskId}/complete`, { method: 'PUT' });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
        } catch (error) {
            console.error('Failed to toggle task completion:', error);
        }
    }

    function renderTask(task) {
        const taskTile = document.createElement('div');
        taskTile.className = 'task-tile';
        taskTile.dataset.id = task.id;
        taskTile.classList.toggle('completed', task.completed);
        taskTile.innerHTML = `
            <span>${task.text}</span>
            <div class="timestamp">${new Date(task.createdAt).toLocaleString()}</div>
            <div class="tile-buttons">
                <button class="edit">Edit</button>
                <button class="complete">${task.completed ? 'Uncomplete' : 'Complete'}</button>
                <button class="delete">Delete</button>
            </div>
        `;
        taskTiles.appendChild(taskTile);
    }

    fetchTasks();
});
