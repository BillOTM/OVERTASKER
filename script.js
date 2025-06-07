// Application State
let tasks = [];
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    interval: null
};
let stats = {
    tasksCompleted: 0,
    pomodoroSessions: 0,
    totalFocusTime: 0,
    todayTasks: 0,
    currentStreak: 0,
    lastActiveDate: null
};

// Load data from localStorage on page load
window.onload = function() {
    loadData();
    updateUI();
    updateStreak();
};

// Task Management Functions
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toDateString()
    };

    tasks.push(task);
    input.value = '';
    
    if (task.createdAt === new Date().toDateString()) {
        stats.todayTasks++;
    }
    
    saveData();
    updateTaskList();
    updateStats();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            stats.tasksCompleted++;
            showAchievement("Task completed! 🎉");
        } else {
            stats.tasksCompleted--;
        }
        saveData();
        updateTaskList();
        updateStats();
    }
}

function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        if (task.completed) {
            stats.tasksCompleted--;
        }
        if (task.createdAt === new Date().toDateString()) {
            stats.todayTasks--;
        }
        tasks.splice(taskIndex, 1);
        saveData();
        updateTaskList();
        updateStats();
    }
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <span>${task.text}</span>
            <div class="task-controls">
                <button class="btn btn-small btn-complete" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="btn btn-small btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Pomodoro Timer Functions
function startTimer() {
    if (!timer.isRunning) {
        timer.isRunning = true;
        timer.interval = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    timer.isRunning = false;
    if (timer.interval) {
        clearInterval(timer.interval);
    }
}

function resetTimer() {
    pauseTimer();
    timer.minutes = 25;
    timer.seconds = 0;
    updateTimerDisplay();
}

function updateTimer() {
    if (timer.seconds === 0) {
        if (timer.minutes === 0) {
            // Timer completed
            pauseTimer();
            stats.pomodoroSessions++;
            stats.totalFocusTime += 25;
            alert('🎉 Pomodoro session completed! Great job!');
            showAchievement("Focus session completed! 🍅");
            resetTimer();
            saveData();
            updateStats();
            return;
        }
        timer.minutes--;
        timer.seconds = 59;
    } else {
        timer.seconds--;
    }
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const minutes = timer.minutes.toString().padStart(2, '0');
    const seconds = timer.seconds.toString().padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
}

// Statistics Functions
function updateStats() {
    document.getElementById('tasksCompleted').textContent = stats.tasksCompleted;
    document.getElementById('pomodoroSessions').textContent = stats.pomodoroSessions;
    document.getElementById('totalTime').textContent = Math.floor(stats.totalFocusTime / 60) + 'h';
    document.getElementById('todayTasks').textContent = stats.todayTasks;
    document.getElementById('currentStreak').textContent = stats.currentStreak;

    // Update daily progress (based on tasks completed today)
    const dailyGoal = 5; // 5 tasks per day goal
    const progress = Math.min((stats.todayTasks / dailyGoal) * 100, 100);
    document.getElementById('dailyProgress').style.width = progress + '%';
}

// Streak Management
function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (stats.lastActiveDate === today) {
        // Already updated today
        return;
    } else if (stats.lastActiveDate === yesterday) {
        // Continue streak
        stats.currentStreak++;
    } else if (stats.lastActiveDate === null) {
        // First time
        stats.currentStreak = 1;
    } else {
        // Streak broken
        stats.currentStreak = 1;
    }

    stats.lastActiveDate = today;
    saveData();
    updateStats();
}

// Achievement System
function showAchievement(message) {
    const achievementsDiv = document.getElementById('achievements');
    const achievement = document.createElement('div');
    achievement.style.cssText = 'padding: 10px; background: #d4edda; border-radius: 5px; margin: 5px 0; border-left: 4px solid #28a745;';
    achievement.textContent = message;
    achievementsDiv.appendChild(achievement);
    
    // Remove achievement after 5 seconds
    setTimeout(() => {
        if (achievement.parentNode) {
            achievement.parentNode.removeChild(achievement);
        }
    }, 5000);
}

// Data Persistence
function saveData() {
    const data = {
        tasks: tasks,
        stats: stats
    };
    // Using variables instead of localStorage as per requirements
    window.appData = data;
}

function loadData() {
    if (window.appData) {
        const data = window.appData;
        tasks = data.tasks || [];
        stats = data.stats || {
            tasksCompleted: 0,
            pomodoroSessions: 0,
            totalFocusTime: 0,
            todayTasks: 0,
            currentStreak: 0,
            lastActiveDate: null
        };
    }
}

function updateUI() {
    updateTaskList();
    updateStats();
    updateTimerDisplay();
}

// Allow Enter key to add tasks
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

