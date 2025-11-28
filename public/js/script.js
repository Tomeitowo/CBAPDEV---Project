// Helper function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get today's date
function getTodayDate() {
    return formatDate(new Date());
}

// Get category class
function getCategoryClass(category) {
    if (category === 'Social Media') return 'social-media';
    else if (category === 'Work-related' || category === 'Work') return 'work';
    else if (category === 'Gaming') return 'gaming';
    else if (category === 'Movies & Entertainment' || category === 'Movies') return 'movies';
    else if (category === 'Study & Learning' || category === 'Study') return 'study';
    else return 'other';
}

// Timer functionality
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;

// Logout function
function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(() => {
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = '/';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Logout button functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Register form validation
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Passwords do not match!');
                return false;
            }
        });
    }
    
    // MOOD FUNCTIONALITY
    
    let selectedMood = null;
    
    // Mood button selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mood-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.remove('selected');
            });
            
            this.classList.add('active');
            this.classList.add('selected');
            selectedMood = this.getAttribute('data-mood');
        });
    });

    // Save mood button
    const saveMoodBtn = document.getElementById('saveMoodBtn');
    if (saveMoodBtn) {
        saveMoodBtn.addEventListener('click', function() {
            if (!selectedMood) {
                alert('Please select a mood first');
                return;
            }
            
            const note = document.getElementById('moodNote').value;
            
            fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodLevel: selectedMood,
                    note: note
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Mood logged successfully!');
                    location.reload();
                } else {
                    alert('Failed to log mood: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to log mood');
            });
        });
    }

    // Edit mood functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-mood') || e.target.closest('.edit-mood')) {
            const btn = e.target.classList.contains('edit-mood') ? e.target : e.target.closest('.edit-mood');
            const moodId = btn.getAttribute('data-mood-id');
            
            // Find the mood entry
            const moodEntry = document.querySelector(`.mood-entry[data-mood-id="${moodId}"]`);
            if (moodEntry) {
                const moodLabel = moodEntry.querySelector('.mood-label').textContent;
                const moodNote = moodEntry.querySelector('.mood-note')?.textContent || '';
                
                // Map mood label to mood level
                const moodLabelMap = {
                    'Excellent': 'very-happy',
                    'Good': 'happy',
                    'Okay': 'neutral',
                    'Down': 'sad',
                    'Struggling': 'very-sad'
                };
                
                const moodLevel = moodLabelMap[moodLabel];
                
                // Set values in modal
                document.getElementById('editMoodId').value = moodId;
                document.getElementById('editMoodNote').value = moodNote;
                
                // Set active mood button in modal
                document.querySelectorAll('#editMoodModal .mood-btn').forEach(modalBtn => {
                    modalBtn.classList.remove('active');
                    modalBtn.classList.remove('selected');
                    if (modalBtn.getAttribute('data-mood') === moodLevel) {
                        modalBtn.classList.add('active');
                        modalBtn.classList.add('selected');
                    }
                });
                
                // Show modal
				document.getElementById('editMoodModal').classList.add('active');
            }
        }
    });

    // Edit mood form submission
    const editMoodForm = document.getElementById('editMoodForm');
    if (editMoodForm) {
        editMoodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const moodId = document.getElementById('editMoodId').value;
            const selectedMoodBtn = document.querySelector('#editMoodModal .mood-btn.active');
            const note = document.getElementById('editMoodNote').value;
            
            if (!selectedMoodBtn) {
                alert('Please select a mood');
                return;
            }
            
            const moodLevel = selectedMoodBtn.getAttribute('data-mood');
            
            fetch(`/api/mood/${moodId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodLevel: moodLevel,
                    note: note
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Mood updated successfully!');
                    document.getElementById('editMoodModal').classList.remove('active');
                    location.reload();
                } else {
                    alert('Failed to update mood: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update mood');
            });
        });
    }

    // Mood button selection in modal
    document.addEventListener('click', function(e) {
        if (e.target.closest('#editMoodModal .mood-btn')) {
            const moodBtn = e.target.closest('#editMoodModal .mood-btn');
            document.querySelectorAll('#editMoodModal .mood-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.remove('selected');
            });
            moodBtn.classList.add('active');
            moodBtn.classList.add('selected');
        }
    });
  
    // TIMER FUNCTIONALITY

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const categorySelect = document.getElementById('categorySelect');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!categorySelect.value) {
                alert('Please select a category first');
                return;
            }
            
            isTimerRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            
            timerInterval = setInterval(function() {
                timerSeconds++;
                updateTimerDisplay();
            }, 1000);
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                pauseBtn.textContent = 'Resume';
                pauseBtn.classList.remove('btn-warning');
                pauseBtn.classList.add('btn-success');
            } else {
                timerInterval = setInterval(function() {
                    timerSeconds++;
                    updateTimerDisplay();
                }, 1000);
                isTimerRunning = true;
                pauseBtn.textContent = 'Pause';
                pauseBtn.classList.remove('btn-success');
                pauseBtn.classList.add('btn-warning');
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            const hours = Math.floor(timerSeconds / 3600);
            const minutes = Math.floor((timerSeconds % 3600) / 60);
            const category = categorySelect.value;
            const totalMinutes = Math.floor(timerSeconds / 60);
            
            if (totalMinutes > 0) {
                fetch('/api/sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        category: category,
                        duration: totalMinutes,
                        notes: ''
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Session saved!\nCategory: ' + category + '\nDuration: ' + hours + 'h ' + minutes + 'm');
                        updateGoalProgress(category, totalMinutes);
                        location.reload();
                    } else {
                        alert('Failed to save session: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error saving session:', error);
                    alert('Failed to save session. Please try again.');
                });
            } else {
                alert('Session too short to save (less than 1 minute)');
            }
            
            timerSeconds = 0;
            isTimerRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
            pauseBtn.classList.remove('btn-success');
            pauseBtn.classList.add('btn-warning');
            updateTimerDisplay();
            categorySelect.value = '';
        });
    }
    
    function updateTimerDisplay() {
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
        }
    }
    
    function updateGoalProgress(category, duration) {
        fetch('/api/goals/update-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category: category,
                duration: duration
            })
        })
        .then(response => response.json())
        .catch(error => console.error('Error updating goal progress:', error));
    }
    
    // SESSIONS CRUD
    // New session button
    const newSessionBtn = document.getElementById('newSessionBtn');
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', function() {
            document.getElementById('newSessionModal').classList.add('active');
            // Reset form when modal opens
            document.getElementById('newSessionForm').reset();
        });
    }

    // Handle new session form submission
    const newSessionForm = document.getElementById('newSessionForm');
    if (newSessionForm) {
        newSessionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const category = document.getElementById('newSessionCategory').value;
            const date = document.getElementById('newSessionDate').value;
            const duration = parseInt(document.getElementById('newSessionMinutes').value);
            const sessionDate = date;
            
            fetch('/api/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: category,
					duration: duration,
					date: sessionDate,
					notes: ''
				})
			})
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Session added successfully!');
                    document.getElementById('newSessionModal').classList.remove('active');
                    location.reload();
                } else {
                    alert('Failed to add session: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add session');
            });
        });
    }
    
    // EDIT SESSION FUNCTIONALITY
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-session') || e.target.closest('.edit-session')) {
            const btn = e.target.classList.contains('edit-session') ? e.target : e.target.closest('.edit-session');
            const sessionId = btn.getAttribute('data-session-id') || btn.getAttribute('data-id');
            
            // Find the session entry
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const category = sessionItem.querySelector('.session-category').textContent;
                const durationText = sessionItem.querySelector('.session-duration').textContent;
                
                // Parse duration from "Xh Ym" format
                let hours = 0;
                let minutes = 0;
                
                const hourMatch = durationText.match(/(\d+)h/);
                const minuteMatch = durationText.match(/(\d+)m/);
                
                if (hourMatch) hours = parseInt(hourMatch[1]);
                if (minuteMatch) minutes = parseInt(minuteMatch[1]);
                
                const totalMinutes = (hours * 60) + minutes;
                
                // Set values in modal
                document.getElementById('editSessionId').value = sessionId;
                document.getElementById('editCategory').value = category;
                document.getElementById('editDuration').value = totalMinutes;
                
                // Show modal
                document.getElementById('editSessionModal').classList.add('active');
            }
        }
    });

    // Edit session form submission
    const editSessionForm = document.getElementById('editSessionForm');
    if (editSessionForm) {
        editSessionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const sessionId = document.getElementById('editSessionId').value;
            const category = document.getElementById('editCategory').value;
            const duration = parseInt(document.getElementById('editDuration').value);
            
            if (duration <= 0) {
                alert('Please enter a valid duration (at least 1 minute)');
                return;
            }
            
            fetch(`/api/sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category,
                    duration: duration
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Session updated successfully!');
                    document.getElementById('editSessionModal').classList.remove('active');
                    location.reload();
                } else {
                    alert('Failed to update session: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update session');
            });
        });
    }
    
    // Delete session
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-session') || e.target.closest('.delete-session')) {
            const btn = e.target.classList.contains('delete-session') ? e.target : e.target.closest('.delete-session');
            const sessionId = btn.getAttribute('data-session-id') || btn.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this session?')) {
                fetch(`/api/sessions/${sessionId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Failed to delete session: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete session');
                });
            }
        }
    });

    // GOALS CRUD 
	
    let editingGoalCard = null;
    
    // Create goal button
    const newGoalBtn = document.getElementById('newGoalBtn');
    if (newGoalBtn) {
        newGoalBtn.addEventListener('click', function() {
            editingGoalCard = null;
            document.getElementById('goalModal').classList.add('active');
            document.getElementById('goalModalTitle').textContent = 'Create New Goal';
            document.getElementById('goalForm').reset();
            document.getElementById('editGoalId').value = '';
        });
    }

    // Handle goal form submission
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goalId = document.getElementById('editGoalId').value;
            const name = document.getElementById('goalName').value;
            const category = document.getElementById('goalCategory').value;
            const description = document.getElementById('goalDescription').value;
            const timeLimit = parseInt(document.getElementById('goalLimit').value) * 60; // Convert hours to minutes
            
            if (goalId) {
                // Update existing goal
                fetch(`/api/goals/${goalId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        category: category,
                        description: description,
                        timeLimit: timeLimit
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Goal updated successfully!');
                        document.getElementById('goalModal').classList.remove('active');
                        location.reload();
                    } else {
                        alert('Failed to update goal: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to update goal');
                });
            } else {
                // Create new goal
                fetch('/api/goals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        category: category,
                        description: description,
                        timeLimit: timeLimit,
                        timePeriod: 'daily'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Goal created successfully!');
                        document.getElementById('goalModal').classList.remove('active');
                        location.reload();
                    } else {
                        alert('Failed to create goal: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to create goal');
                });
            }
        });
    }
    
    // Edit goal functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-goal') || e.target.closest('.edit-goal')) {
            const btn = e.target.classList.contains('edit-goal') ? e.target : e.target.closest('.edit-goal');
            const goalId = btn.getAttribute('data-goal-id');
            
            // Find the goal card
            const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
            if (goalCard && !goalCard.classList.contains('completed')) {
                const name = goalCard.querySelector('.goal-name').textContent;
                const category = goalCard.querySelector('.goal-category').textContent;
                const description = goalCard.querySelector('.goal-description')?.textContent || '';
                const targetTimeText = goalCard.querySelector('.progress-info span').textContent;
                
                // Parse target time from "Today: Xh Ym / Zh Wm" format
                const targetMatch = targetTimeText.match(/\/\s*(\d+)h\s*(\d+)m/);
                let targetHours = 0;
                if (targetMatch) {
                    targetHours = parseInt(targetMatch[1]) + (parseInt(targetMatch[2]) / 60);
                }
                
                // Set values in modal
                document.getElementById('editGoalId').value = goalId;
                document.getElementById('goalName').value = name;
                document.getElementById('goalCategory').value = category;
                document.getElementById('goalDescription').value = description === 'No description provided' ? '' : description;
                document.getElementById('goalLimit').value = targetHours;
                
                document.getElementById('goalModalTitle').textContent = 'Edit Goal';
                document.getElementById('goalModal').classList.add('active');
                editingGoalCard = goalCard;
            }
        }
    });
    
    // Complete goal functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-goal') || e.target.closest('.complete-goal')) {
            const btn = e.target.classList.contains('complete-goal') ? e.target : e.target.closest('.complete-goal');
            const goalId = btn.getAttribute('data-goal-id');
            
            if (confirm('Mark this goal as completed?')) {
                fetch(`/api/goals/${goalId}/complete`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Goal marked as completed!');
                        location.reload();
                    } else {
                        alert('Failed to complete goal: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to complete goal');
                });
            }
        }
    });
    
    // Reactivate goal functionality 
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reactivate-goal') || e.target.closest('.reactivate-goal')) {
            const btn = e.target.classList.contains('reactivate-goal') ? e.target : e.target.closest('.reactivate-goal');
            const goalId = btn.getAttribute('data-goal-id');
            
            if (confirm('Move this goal back to active goals?')) {
                fetch(`/api/goals/${goalId}/reactivate`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Goal moved to active goals!');
                        location.reload();
                    } else {
                        alert('Failed to reactivate goal: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to reactivate goal');
                });
            }
        }
    });
    
    // Delete goal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-goal') || e.target.closest('.delete-goal')) {
            const btn = e.target.classList.contains('delete-goal') ? e.target : e.target.closest('.delete-goal');
            const goalId = btn.getAttribute('data-goal-id');
            
            if (confirm('Are you sure you want to delete this goal?')) {
                fetch(`/api/goals/${goalId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Failed to delete goal: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete goal');
                });
            }
        }
    });
    
    // MOOD CRUD
    // Delete mood
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-mood') || e.target.closest('.delete-mood')) {
            const btn = e.target.classList.contains('delete-mood') ? e.target : e.target.closest('.delete-mood');
            const moodId = btn.getAttribute('data-mood-id') || btn.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this mood entry?')) {
                fetch(`/api/mood/${moodId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Failed to delete mood: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete mood');
                });
            }
        }
    });
    
    // PROFILE FUNCTIONALITY
    // Profile form handling
    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('updateUsername').value;
            const email = document.getElementById('updateEmail').value;
            
            fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: email
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile updated successfully!');
                    // Update displayed username
                    const profileName = document.getElementById('profileName');
                    if (profileName) {
                        profileName.textContent = username;
                    }
                } else {
                    alert('Failed to update profile: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update profile');
            });
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPasswordProfile').value;
            const confirmPassword = document.getElementById('confirmPasswordProfile').value;
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }
            
            fetch('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Password changed successfully!');
                    changePasswordForm.reset();
                } else {
                    alert('Failed to change password: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to change password');
            });
        });
    }
    
    // Delete account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const password = prompt('Enter your password to confirm account deletion:');
            if (!password) return;
            
            if (confirm('Are you ABSOLUTELY SURE? This will permanently delete your account and all your data!')) {
                fetch('/api/profile', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password: password
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Account deleted successfully');
                        window.location.href = '/';
                    } else {
                        alert('Failed to delete account: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete account');
                });
            }
        });
    }
    
    // SEARCH FUNCTIONALITY
    const sessionSearch = document.getElementById('sessionSearch');
    if (sessionSearch) {
        sessionSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const sessions = document.querySelectorAll('.session-item');
            
            sessions.forEach(function(session) {
                const category = session.querySelector('.session-category')?.textContent.toLowerCase() || '';
                const date = session.querySelector('.session-date')?.textContent.toLowerCase() || '';
                
                if (category.includes(searchTerm) || date.includes(searchTerm)) {
                    session.style.display = '';
                } else {
                    session.style.display = 'none';
                }
            });
        });
    }
    
    const goalSearch = document.getElementById('goalSearch');
    if (goalSearch) {
        goalSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const goals = document.querySelectorAll('.goal-card');
            
            goals.forEach(function(goal) {
                const name = goal.querySelector('.goal-name')?.textContent.toLowerCase() || '';
                const category = goal.querySelector('.goal-category')?.textContent.toLowerCase() || '';
                
                if (name.includes(searchTerm) || category.includes(searchTerm)) {
                    goal.style.display = '';
                } else {
                    goal.style.display = 'none';
                }
            });
        });
    }
    
    // Time range filter for insights
    const timeRangeSelect = document.getElementById('timeRangeFilter');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const rangeMap = {
                '7days': 7,
                '30days': 30,
                '90days': 90
            };
            window.location.href = '/insights?range=' + rangeMap[this.value];
        });
    }

    // MODAL FUNCTIONALITY
     // Close modals when clicking cancel buttons
    document.addEventListener('click', function(e) {
        // Close modals when clicking cancel buttons
        if (e.target.classList.contains('cancel-new-session') || 
            e.target.classList.contains('cancel-edit') ||
            e.target.classList.contains('cancel-goal') ||
            e.target.classList.contains('cancel-edit-mood')) {
            
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
        
        // Close modal when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
});

// Initialize timer display
updateTimerDisplay();