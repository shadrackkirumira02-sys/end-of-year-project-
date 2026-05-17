
let tasks = [];           
let nextId = 1;          


function loadTasks() {
    const storedTasks = localStorage.getItem('studentTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        
        if (tasks.length > 0) {
            nextId = Math.max(...tasks.map(t => t.id)) + 1;
        }
    }
}


function saveTasks() {
    localStorage.setItem('studentTasks', JSON.stringify(tasks));
}


function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}


function addTask(title, priority, dueDate, description = '') {
    const newTask = {
        id: nextId++,                    
        title: title,                    
        priority: priority,              
        dueDate: dueDate,                
        description: description,        
        completed: false,                
        createdAt: getCurrentDate()      
    };
    tasks.push(newTask);               
    saveTasks();                         
    return newTask;
}


function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        task.completedDate = getCurrentDate();  // Remember when it was finished
        saveTasks();
        return true;
    }
    return false;
}


function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
}

function clearCompletedTasks() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
}


function getPendingTasks() {
    return tasks.filter(t => !t.completed);
}


function getCompletedTasks() {
    return tasks.filter(t => t.completed);
}

function getTasksByPriority(priority) {
    return tasks.filter(t => !t.completed && t.priority === priority);
}


function getUpcomingDeadlines() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(t => {
        if (t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));  
}


function formatDate(dateString) {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPriorityText(priority) {
    switch(priority) {
        case 'high': return '🔴 High Priority';
        case 'medium': return '🟠 Medium Priority';
        case 'low': return '🟢 Low Priority';
        default: return priority;
    }
}


function renderPendingTasks(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let pendingTasks = getPendingTasks();
    
    if (filter !== 'all') {
        pendingTasks = pendingTasks.filter(t => t.priority === filter);
    }
    
    
    if (pendingTasks.length === 0) {
        container.innerHTML = '<li class="empty-message">✨ No pending tasks. Add a task to get started!</li>';
        return;
    }
    
    
    container.innerHTML = pendingTasks.map(task => `
        <li class="task-item ${task.priority}" data-id="${task.id}">
            <div class="task-info">
                <div class="task-title">
                    ${escapeHtml(task.title)}
                    <span class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</span>
                </div>
                <div class="task-meta">
                    📅 Due: ${formatDate(task.dueDate)}
                </div>
                ${task.description ? `<div class="task-desc">📝 ${escapeHtml(task.description)}</div>` : ''}
            </div>
            <div>
                <button class="complete-btn" onclick="handleCompleteTask(${task.id})">✓ Mark Complete</button>
                <button class="delete-btn" onclick="handleDeleteTask(${task.id})">🗑️ Delete</button>
            </div>
        </li>
    `).join('');
}


function renderCompletedTasks(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const completedTasks = getCompletedTasks();
    const completedSpan = document.getElementById('completedCountSpan');
    if (completedSpan) {
        completedSpan.textContent = completedTasks.length;
    }
    
    
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.style.display = completedTasks.length > 0 ? 'block' : 'none';
    }
    
    if (completedTasks.length === 0) {
        container.innerHTML = '<li class="empty-message">📭 No completed tasks yet. Keep working hard!</li>';
        return;
    }
    
    container.innerHTML = completedTasks.map(task => `
        <li class="task-item ${task.priority}">
            <div class="task-info">
                <div class="task-title">
                    ✅ ${escapeHtml(task.title)}
                    <span class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</span>
                </div>
                <div class="task-meta">
                    📅 Due: ${formatDate(task.dueDate)} | ✅ Finished: ${formatDate(task.completedDate)}
                </div>
                ${task.description ? `<div class="task-desc">📝 ${escapeHtml(task.description)}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="handleDeleteTask(${task.id})">🗑️ Remove</button>
        </li>
    `).join('');
}


function renderDashboard() {
    const pendingCount = getPendingTasks().length;
    const completedCount = getCompletedTasks().length;
    const totalCount = tasks.length;
    
    const pendingSpan = document.getElementById('pendingCount');
    const completedSpan = document.getElementById('completedCount');
    const totalSpan = document.getElementById('totalCount');
    const upcomingContainer = document.getElementById('upcomingTasks');
    
    if (pendingSpan) pendingSpan.textContent = pendingCount;
    if (completedSpan) completedSpan.textContent = completedCount;
    if (totalSpan) totalSpan.textContent = totalCount;
    
    if (upcomingContainer) {
        const upcoming = getUpcomingDeadlines();
        
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<li class="empty-message">🎉 No upcoming deadlines! Enjoy your free time.</li>';
        } else {
            upcomingContainer.innerHTML = upcoming.map(task => `
                <li class="task-item ${task.priority}" data-id="${task.id}">
                    <div class="task-info">
                        <div class="task-title">
                            ${escapeHtml(task.title)}
                            <span class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</span>
                        </div>
                        <div class="task-meta">
                            📅 Due: ${formatDate(task.dueDate)}
                        </div>
                    </div>
                    <button class="complete-btn" onclick="handleCompleteTask(${task.id})">✓ Mark Complete</button>
                </li>
            `).join('');
        }
    }
}


window.handleCompleteTask = function(taskId) {
    if (completeTask(taskId)) {
        refreshAllViews();  
    }
};

window.handleDeleteTask = function(taskId) {
    if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
        deleteTask(taskId);
        refreshAllViews();
    }
};

window.handleClearAllCompleted = function() {
    if (confirm('Are you sure you want to clear ALL completed tasks? This cannot be undone.')) {
        clearCompletedTasks();
        refreshAllViews();
    }
};


function refreshAllViews() {
    renderDashboard();                         
    
    const activeFilter = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    renderPendingTasks('pendingTasksList', currentFilter);  
    
    renderCompletedTasks('completedTasksList'); 
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function initializePage() {
    loadTasks();  
    
    
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    if (page === 'index.html' || page === '') {
        
        renderDashboard();
        
    } else if (page === 'tasks.html') {
        
        renderPendingTasks('pendingTasksList', 'all');
        
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.getAttribute('data-filter');
                renderPendingTasks('pendingTasksList', filter);
            });
        });
        
    } else if (page === 'completed.html') {
        
        renderCompletedTasks('completedTasksList');
        
        const clearBtn = document.getElementById('clearAllBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', window.handleClearAllCompleted);
        }
        
    } else if (page === 'add-task.html') {
        
        const form = document.getElementById('taskForm');
        const successMsg = document.getElementById('successMessage');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();  
                
                
                const title = document.getElementById('taskTitle').value.trim();
                const priority = document.getElementById('taskPriority').value;
                const dueDate = document.getElementById('taskDate').value;
                const description = document.getElementById('taskDesc').value.trim();
                
                
                if (!title) {
                    alert('Please enter what needs to be done');
                    return;
                }
                
                if (!dueDate) {
                    alert('Please select a due date');
                    return;
                }
                
                
                addTask(title, priority, dueDate, description);
                
                
                if (successMsg) {
                    successMsg.style.display = 'block';
                }
                
                
                form.reset();
                
            
                successMsg.scrollIntoView({ behavior: 'smooth' });
                
                
                setTimeout(() => {
                    if (successMsg) successMsg.style.display = 'none';
                }, 3000);
            });
        }
    }
}
