// Task Manager JavaScript
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }
    
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
    }
    
    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Clear events
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Input validation
        this.taskInput.addEventListener('input', () => this.validateInput());
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.showMessage('Please enter a task!', 'error');
            return;
        }
        
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, text);
            this.editingTaskId = null;
            this.addBtn.textContent = 'Add Task';
        } else {
            const task = {
                id: this.generateId(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.tasks.unshift(task);
            this.showMessage('Task added successfully!', 'success');
        }
        
        this.taskInput.value = '';
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }
    
    updateTask(taskId, newText) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            this.showMessage('Task updated successfully!', 'success');
        }
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending';
            this.showMessage(message, 'success');
        }
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.classList.add('removing');
                    setTimeout(() => {
                        this.tasks.splice(taskIndex, 1);
                        this.saveTasks();
                        this.renderTasks();
                        this.updateStats();
                        this.showMessage('Task deleted successfully!', 'success');
                    }, 300);
                }
            }
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.taskInput.value = task.text;
            this.taskInput.focus();
            this.addBtn.textContent = 'Update Task';
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderTasks();
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }
    
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyIcon = this.emptyState.querySelector('.empty-icon');
            const emptyTitle = this.emptyState.querySelector('h3');
            const emptyText = this.emptyState.querySelector('p');
            
            switch (this.currentFilter) {
                case 'completed':
                    emptyIcon.textContent = '✅';
                    emptyTitle.textContent = 'No completed tasks';
                    emptyText.textContent = 'Complete some tasks to see them here!';
                    break;
                case 'pending':
                    emptyIcon.textContent = '⏳';
                    emptyTitle.textContent = 'No pending tasks';
                    emptyText.textContent = 'Great job! All tasks are completed!';
                    break;
                default:
                    emptyIcon.textContent = '📋';
                    emptyTitle.textContent = 'No tasks yet';
                    emptyText.textContent = 'Add your first task to get started!';
            }
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="taskManager.toggleTask('${task.id}')">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <div class="task-actions">
                        <button class="task-btn edit-btn" onclick="taskManager.editTask('${task.id}')">
                            ✏️ Edit
                        </button>
                        <button class="task-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </li>
            `).join('');
        }
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
        
        // Update progress bar if needed
        this.updateProgressBar(completed, total);
    }
    
    updateProgressBar(completed, total) {
        // Add visual progress indicator
        const progress = total > 0 ? (completed / total) * 100 : 0;
        
        // Update completed tasks color based on progress
        const completedStat = this.completedTasks.parentElement;
        if (progress === 100 && total > 0) {
            completedStat.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else if (progress > 50) {
            completedStat.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
        } else {
            completedStat.style.background = 'white';
        }
    }
    
    clearCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            this.showMessage('No completed tasks to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showMessage('Completed tasks cleared!', 'success');
        }
    }
    
    clearAll() {
        if (this.tasks.length === 0) {
            this.showMessage('No tasks to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete all ${this.tasks.length} task(s)?`)) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showMessage('All tasks cleared!', 'success');
        }
    }
    
    validateInput() {
        const text = this.taskInput.value.trim();
        const isValid = text.length > 0 && text.length <= 100;
        
        this.addBtn.disabled = !isValid;
        this.addBtn.style.opacity = isValid ? '1' : '0.6';
        
        // Show character count
        const charCount = this.taskInput.value.length;
        if (charCount > 80) {
            this.taskInput.style.borderColor = '#ffc107';
        } else if (charCount > 90) {
            this.taskInput.style.borderColor = '#dc3545';
        } else {
            this.taskInput.style.borderColor = '#e1e5e9';
        }
    }
    
    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        toast.style.background = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Local Storage Methods
    saveTasks() {
        try {
            localStorage.setItem('taskManagerTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showMessage('Error saving tasks to local storage', 'error');
        }
    }
    
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('taskManagerTasks');
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showMessage('Error loading tasks from local storage', 'error');
            return [];
        }
    }
}

// Initialize the task manager when the page loads
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add some sample tasks if none exist
    if (taskManager.tasks.length === 0) {
        const sampleTasks = [
            { id: taskManager.generateId(), text: 'Welcome to your Task Manager!', completed: false, createdAt: new Date().toISOString() },
            { id: taskManager.generateId(), text: 'Click the checkbox to mark tasks as complete', completed: true, createdAt: new Date().toISOString() },
            { id: taskManager.generateId(), text: 'Use the edit button to modify tasks', completed: false, createdAt: new Date().toISOString() }
        ];
        
        taskManager.tasks = sampleTasks;
        taskManager.saveTasks();
        taskManager.renderTasks();
        taskManager.updateStats();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        taskManager.addTask();
    }
    
    // Escape to cancel editing
    if (e.key === 'Escape' && taskManager.editingTaskId) {
        taskManager.editingTaskId = null;
        taskManager.taskInput.value = '';
        taskManager.addBtn.textContent = 'Add Task';
        taskManager.taskInput.blur();
    }
});

// Add drag and drop functionality (bonus feature)
let draggedTask = null;

document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task-item')) {
        draggedTask = e.target.dataset.taskId;
        e.target.style.opacity = '0.5';
    }
});

document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task-item')) {
        e.target.style.opacity = '1';
        draggedTask = null;
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedTask && e.target.classList.contains('task-item')) {
        const targetTaskId = e.target.dataset.taskId;
        if (draggedTask !== targetTaskId) {
            // Reorder tasks
            const draggedIndex = taskManager.tasks.findIndex(task => task.id === draggedTask);
            const targetIndex = taskManager.tasks.findIndex(task => task.id === targetTaskId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const draggedTaskObj = taskManager.tasks.splice(draggedIndex, 1)[0];
                taskManager.tasks.splice(targetIndex, 0, draggedTaskObj);
                taskManager.saveTasks();
                taskManager.renderTasks();
            }
        }
    }
});
