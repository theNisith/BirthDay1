// Floating Hearts Animation
function createHeart() {
    const heartsContainer = document.getElementById('heartsContainer');
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '💖';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 5) + 's';
    heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
    
    heartsContainer.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 8000);
}

// Create hearts periodically
setInterval(createHeart, 800);

// Load and display scores
let currentSort = 'time';

function loadScores() {
    const scores = JSON.parse(localStorage.getItem('mazeScores') || '[]');
    return scores;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function getPerformance(time, moves) {
    if (time < 60 && moves < 100) {
        return { class: 'performance-excellent', text: '🏆 Excellent!' };
    } else if (time < 120 && moves < 150) {
        return { class: 'performance-good', text: '⭐ Good!' };
    } else if (time < 180 && moves < 200) {
        return { class: 'performance-average', text: '👍 Average' };
    } else {
        return { class: 'performance-slow', text: '🐢 Keep trying!' };
    }
}

function displayScores() {
    const scores = loadScores();
    const tbody = document.getElementById('scoresTableBody');
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr class="no-scores"><td colspan="5">No attempts yet! Play the maze to see scores here. 🎮</td></tr>';
        return;
    }
    
    // Sort scores
    let sortedScores = [...scores];
    switch(currentSort) {
        case 'time':
            sortedScores.sort((a, b) => a.time - b.time);
            break;
        case 'moves':
            sortedScores.sort((a, b) => a.moves - b.moves);
            break;
        case 'date':
            sortedScores.sort((a, b) => b.timestamp - a.timestamp);
            break;
    }
    
    tbody.innerHTML = sortedScores.map((score, index) => {
        const performance = getPerformance(score.time, score.moves);
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(score.date)}</td>
                <td>${formatTime(score.time)}</td>
                <td>${score.moves}</td>
                <td><span class="performance-badge ${performance.class}">${performance.text}</span></td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    const scores = loadScores();
    
    if (scores.length === 0) {
        document.getElementById('totalAttempts').textContent = '0';
        document.getElementById('fastestTime').textContent = '-';
        document.getElementById('fewestMoves').textContent = '-';
        document.getElementById('lastPlayed').textContent = '-';
        return;
    }
    
    // Total attempts
    document.getElementById('totalAttempts').textContent = scores.length;
    
    // Fastest time
    const fastestTime = Math.min(...scores.map(s => s.time));
    document.getElementById('fastestTime').textContent = formatTime(fastestTime);
    
    // Fewest moves
    const fewestMoves = Math.min(...scores.map(s => s.moves));
    document.getElementById('fewestMoves').textContent = fewestMoves;
    
    // Last played
    const lastScore = scores.reduce((latest, score) => 
        score.timestamp > latest.timestamp ? score : latest
    );
    const lastDate = new Date(lastScore.date);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastDate) / 1000 / 60);
    
    let lastPlayedText;
    if (diffMinutes < 1) {
        lastPlayedText = 'Just now';
    } else if (diffMinutes < 60) {
        lastPlayedText = `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
        lastPlayedText = `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
        lastPlayedText = `${Math.floor(diffMinutes / 1440)}d ago`;
    }
    
    document.getElementById('lastPlayed').textContent = lastPlayedText;
}

function checkAchievements() {
    const scores = loadScores();
    
    // First Try
    if (scores.length >= 1) {
        unlockAchievement('achievement-first');
    }
    
    // Speedster - under 60 seconds
    if (scores.some(s => s.time < 60)) {
        unlockAchievement('achievement-speedster');
    }
    
    // Efficient - under 100 moves
    if (scores.some(s => s.moves < 100)) {
        unlockAchievement('achievement-efficient');
    }
    
    // Persistent - 5 attempts
    if (scores.length >= 5) {
        unlockAchievement('achievement-persistent');
    }
    
    // Dedicated - 10 attempts
    if (scores.length >= 10) {
        unlockAchievement('achievement-dedicated');
    }
    
    // Master - 20 attempts
    if (scores.length >= 20) {
        unlockAchievement('achievement-master');
    }
}

function unlockAchievement(id) {
    const achievement = document.getElementById(id);
    if (achievement && achievement.classList.contains('locked')) {
        achievement.classList.remove('locked');
        achievement.classList.add('unlocked');
    }
}

function sortScores(sortBy) {
    currentSort = sortBy;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayScores();
}

function clearScores() {
    if (confirm('Are you sure you want to clear all scores? This cannot be undone!')) {
        localStorage.removeItem('mazeScores');
        displayScores();
        updateStats();
        
        // Re-lock achievements
        document.querySelectorAll('.achievement').forEach(achievement => {
            achievement.classList.remove('unlocked');
            achievement.classList.add('locked');
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    displayScores();
    updateStats();
    checkAchievements();
    
    // Auto-refresh every 10 seconds to catch new scores
    setInterval(() => {
        displayScores();
        updateStats();
        checkAchievements();
    }, 10000);
});
