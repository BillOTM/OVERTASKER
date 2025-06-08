document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN AND UI SETUP ---
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const aboutBtn = document.getElementById('about-toggle-btn');
    const aboutSection = document.getElementById('about-section');
    const darkToggle = document.getElementById('darkToggle');

    // Login functionality
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent actual form submission
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        // Initialize app state after login
        initialize();
    });

    // About section toggle
    aboutBtn.addEventListener('click', () => {
        const isVisible = aboutSection.style.display === 'block';
        aboutSection.style.display = isVisible ? 'none' : 'block';
    });
    
    // --- APP STATE AND DATA ---
    let tasks = [];
    let stats = {
        tasksCompleted: 0,
        pomodoroSessions: 0,
        totalFocusTime: 0,
        todayTasks: 0,
        currentStreak: 0,
        lastActiveDate: null
    };
    let timer = { minutes: 25, seconds: 0, isRunning: false, interval: null };

    // --- GLOBAL FUNCTIONS ---
    // Make functions globally accessible for onclick handlers in HTML
    window.addTask = addTask;
    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;
    window.editTask = editTask;
    window.startTimer = startTimer;
    window.pauseTimer = pauseTimer;
    window.resetTimer = resetTimer;

    // --- INITIALIZATION ---
    function initialize() {
        updateUI();
        updateStreak();
        
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
        
        // Welcome message on first load
        setTimeout(() => {
            if (tasks.length === 0 && stats.tasksCompleted === 0) {
                showAchievement("👋 Welcome to OVERTASKER! Start by adding your first task.");
            }
        }, 1000);
    }
    
    // --- TASK MANAGEMENT ---
    function addTask() {
        const input = document.getElementById("taskInput");
        const text = input.value.trim();
        if (!text) {
            input.style.borderColor = '#f5576c';
            setTimeout(() => input.style.borderColor = '', 2000);
            return;
        }
        
        const task = { 
            id: Date.now(), 
            text, 
            completed: false, 
            createdAt: new Date().toDateString() 
        };
        tasks.push(task);
        stats.todayTasks++;
        input.value = "";
        
        updateTaskList();
        updateStats();
        
        input.style.borderColor = '#43e97b';
        setTimeout(() => input.style.borderColor = '', 1000);
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            stats.tasksCompleted += task.completed ? 1 : -1;
            if (task.completed) {
                showAchievement("✅ Great job! Task completed!");
                const taskElement = document.querySelector(`[data-task-id="${id}"]`);
                if (taskElement) {
                    taskElement.style.transform = 'scale(1.05)';
                    setTimeout(() => taskElement.style.transform = '', 300);
                }
            }
            updateTaskList();
            updateStats();
        }
    }

    function deleteTask(id) {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            const task = tasks[taskIndex];
            if (task.completed) stats.tasksCompleted--;
            if (task.createdAt === new Date().toDateString()) stats.todayTasks--;
            tasks.splice(taskIndex, 1);
            updateTaskList();
            updateStats();
        }
    }

    function editTask(id, newText) {
        const task = tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
        }
    }

    function updateTaskList() {
        const container = document.getElementById("taskList");
        if (tasks.length === 0) {
            container.innerHTML = `<div class="empty-state">Ready to boost your productivity? Add your first task above! 🚀</div>`;
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
            <span contenteditable="true" onblur="editTask(${task.id}, this.textContent)">${task.text}</span>
            <div class="task-controls">
                <button class="btn btn-small btn-success" onclick="toggleTask(${task.id})" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteTask(${task.id})" title="Delete task">
                🗑️
                </button>
            </div>
            </div>`).join('');
    }

    // --- TIMER FUNCTIONALITY ---
    function updateTimerDisplay() {
        const m = String(timer.minutes).padStart(2, "0");
        const s = String(timer.seconds).padStart(2, "0");
        document.getElementById("timerDisplay").textContent = `${m}:${s}`;
    }

    function startTimer() {
        if (!timer.isRunning) {
            timer.isRunning = true;
            timer.interval = setInterval(updateTimer, 1000);
        }
    }

    function pauseTimer() {
        timer.isRunning = false;
        clearInterval(timer.interval);
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
                pauseTimer();
                stats.pomodoroSessions++;
                stats.totalFocusTime += 25;
                showAchievement("🍅 Fantastic! Pomodoro session completed!");
                
                const timerDisplay = document.getElementById("timerDisplay");
                timerDisplay.style.transform = 'scale(1.1)';
                timerDisplay.style.color = '#43e97b';
                setTimeout(() => {
                    timerDisplay.style.transform = '';
                    timerDisplay.style.color = '';
                }, 1000);
                
                resetTimer();
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

    // --- STATISTICS AND GAMIFICATION ---
    function updateStats() {
        document.getElementById("tasksCompleted").textContent = stats.tasksCompleted;
        document.getElementById("pomodoroSessions").textContent = stats.pomodoroSessions;
        document.getElementById("totalTime").textContent = Math.floor(stats.totalFocusTime / 60) + "h";
        document.getElementById("todayTasks").textContent = stats.todayTasks;
        document.getElementById("currentStreak").textContent = stats.currentStreak;
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const progressFill = document.getElementById("dailyProgress");
        const progressLabel = document.getElementById("progressPercent");
        
        progressFill.style.width = progressPercent + "%";
        progressLabel.textContent = Math.round(progressPercent) + "%";
        
        if (progressPercent >= 100) {
            progressFill.style.background = 'var(--warning-gradient)';
            if (totalTasks > 0) {
                showAchievement("🎯 Daily goal achieved! You're on fire!");
            }
        } else if (progressPercent >= 60) {
            progressFill.style.background = 'var(--success-gradient)';
        } else {
            progressFill.style.background = 'var(--primary-gradient)';
        }
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (stats.lastActiveDate === today) return;
        
        if (stats.lastActiveDate === yesterday) {
            stats.currentStreak++;
            if (stats.currentStreak > 1) {
                showAchievement(`🔥 ${stats.currentStreak} day streak! Keep it up!`);
            }
        } else {
            stats.currentStreak = 1;
        }
        
        stats.lastActiveDate = today;
        updateStats();
    }

    function showAchievement(message) {
        const achievementsContainer = document.getElementById("achievements");
        const achievementElement = document.createElement("div");
        achievementElement.className = "achievement-note";
        achievementElement.textContent = message;
        
        const placeholder = achievementsContainer.querySelector('.achievement-note');
        if (placeholder && placeholder.textContent.includes('Complete your first task')) {
            placeholder.remove();
        }
        
        achievementsContainer.insertBefore(achievementElement, achievementsContainer.firstChild);
        
        setTimeout(() => {
            if (achievementElement.parentNode) {
                achievementElement.style.opacity = '0';
                achievementElement.style.transform = 'translateX(-100%)';
                setTimeout(() => achievementElement.remove(), 300);
            }
        }, 5000);
        
        const achievements = achievementsContainer.querySelectorAll('.achievement-note');
        if (achievements.length > 5) {
            achievements[achievements.length - 1].remove();
        }
    }

    function updateUI() {
        updateTaskList();
        updateStats();
        updateTimerDisplay();
    }

    // --- EVENT LISTENERS ---
    darkToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        darkToggle.textContent = isDark ? "☀️" : "🌙";
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement.id === 'taskInput') {
            addTask();
        }
        
        if (e.key === ' ' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SPAN') {
            e.preventDefault();
            if (timer.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
        
        if (e.key === 'Escape') {
            resetTimer();
        }
    });

    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('btn')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('btn')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
});
