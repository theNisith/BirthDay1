// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    createFloatingHearts();
    startCountdown();
    initializeMazeGame();
    initializeBalloonGame();
    triggerConfetti();
    observeElements();
});

// Initialize letter animations
function initializeAnimations() {
    const letters = document.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        letter.style.animationDelay = `${index * 0.1}s`;
    });
}

// Create floating hearts in background
function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    const hearts = ['💕', '💖', '💗', '💝', '💘', '❤️', '💓', '💞'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
        heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 10000);
    }, 800);
}

// Confetti Animation
function triggerConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#ff6b9d', '#ffc2d4', '#c44569', '#a8e6cf', '#ffd89b'];
    
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 50);
        }
    }
    
    // Initial confetti burst
    createConfetti();
    
    // Random confetti bursts
    setInterval(() => {
        if (Math.random() > 0.7) {
            createConfetti();
        }
    }, 8000);
}

// Countdown Timer
function startCountdown() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    function updateCountdown() {
        const now = new Date();
        const diff = now - startOfToday;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Maze Game Variables
let mazeGame = {
    canvas: null,
    ctx: null,
    cellSize: 30,
    rows: 15,
    cols: 15,
    maze: [],
    playerPos: {x: 0, y: 0},
    goalPos: {x: 14, y: 14},
    moves: 0,
    startTime: null,
    gameTimer: null,
    gameWon: false,
    showPath: false,
    solution: []
};

// Initialize Maze Game
function initializeMazeGame() {
    mazeGame.canvas = document.getElementById('mazeCanvas');
    if (!mazeGame.canvas) return;
    
    mazeGame.ctx = mazeGame.canvas.getContext('2d');
    
    // Set canvas size
    const size = Math.min(450, window.innerWidth - 100);
    mazeGame.canvas.width = size;
    mazeGame.canvas.height = size;
    mazeGame.cellSize = size / mazeGame.rows;
    
    generateMaze();
    drawMaze();
    
    // Keyboard controls
    document.addEventListener('keydown', handleMazeKeyPress);
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    mazeGame.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    mazeGame.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) movePlayer('right');
            else if (dx < -30) movePlayer('left');
        } else {
            if (dy > 30) movePlayer('down');
            else if (dy < -30) movePlayer('up');
        }
    });
}

// Generate Maze using Recursive Backtracking
function generateMaze() {
    // Initialize maze with walls
    mazeGame.maze = [];
    for (let i = 0; i < mazeGame.rows; i++) {
        mazeGame.maze[i] = [];
        for (let j = 0; j < mazeGame.cols; j++) {
            mazeGame.maze[i][j] = {
                top: true,
                right: true,
                bottom: true,
                left: true,
                visited: false
            };
        }
    }
    
    // Recursive backtracking algorithm
    const stack = [];
    let current = {x: 0, y: 0};
    mazeGame.maze[0][0].visited = true;
    
    while (true) {
        const neighbors = getUnvisitedNeighbors(current.x, current.y);
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            removeWall(current, next);
            mazeGame.maze[next.y][next.x].visited = true;
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
    
    // Reset visited flags
    for (let i = 0; i < mazeGame.rows; i++) {
        for (let j = 0; j < mazeGame.cols; j++) {
            mazeGame.maze[i][j].visited = false;
        }
    }
    
    // Reset game state
    mazeGame.playerPos = {x: 0, y: 0};
    mazeGame.goalPos = {x: mazeGame.cols - 1, y: mazeGame.rows - 1};
    mazeGame.moves = 0;
    mazeGame.gameWon = false;
    mazeGame.showPath = false;
    document.getElementById('moveCount').textContent = '0';
    document.getElementById('gameTime').textContent = '0';
    document.getElementById('mazeMessage').textContent = '';
    
    // Start timer
    if (mazeGame.gameTimer) clearInterval(mazeGame.gameTimer);
    mazeGame.startTime = Date.now();
    mazeGame.gameTimer = setInterval(updateGameTime, 1000);
    
    // Find solution
    findMazeSolution();
}

function getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
        {x: 0, y: -1}, // top
        {x: 1, y: 0},  // right
        {x: 0, y: 1},  // bottom
        {x: -1, y: 0}  // left
    ];
    
    for (const dir of directions) {
        const nx = x + dir.x;
        const ny = y + dir.y;
        
        if (nx >= 0 && nx < mazeGame.cols && ny >= 0 && ny < mazeGame.rows 
            && !mazeGame.maze[ny][nx].visited) {
            neighbors.push({x: nx, y: ny});
        }
    }
    
    return neighbors;
}

function removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) {
        mazeGame.maze[current.y][current.x].right = false;
        mazeGame.maze[next.y][next.x].left = false;
    } else if (dx === -1) {
        mazeGame.maze[current.y][current.x].left = false;
        mazeGame.maze[next.y][next.x].right = false;
    } else if (dy === 1) {
        mazeGame.maze[current.y][current.x].bottom = false;
        mazeGame.maze[next.y][next.x].top = false;
    } else if (dy === -1) {
        mazeGame.maze[current.y][current.x].top = false;
        mazeGame.maze[next.y][next.x].bottom = false;
    }
}

// Find solution using BFS
function findMazeSolution() {
    const queue = [{x: 0, y: 0, path: [{x: 0, y: 0}]}];
    const visited = new Set();
    visited.add('0,0');
    
    while (queue.length > 0) {
        const {x, y, path} = queue.shift();
        
        if (x === mazeGame.goalPos.x && y === mazeGame.goalPos.y) {
            mazeGame.solution = path;
            return;
        }
        
        const moves = [];
        if (!mazeGame.maze[y][x].top && y > 0) moves.push({x, y: y - 1});
        if (!mazeGame.maze[y][x].right && x < mazeGame.cols - 1) moves.push({x: x + 1, y});
        if (!mazeGame.maze[y][x].bottom && y < mazeGame.rows - 1) moves.push({x, y: y + 1});
        if (!mazeGame.maze[y][x].left && x > 0) moves.push({x: x - 1, y});
        
        for (const move of moves) {
            const key = `${move.x},${move.y}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push({...move, path: [...path, move]});
            }
        }
    }
}

// Draw Maze
function drawMaze() {
    const ctx = mazeGame.ctx;
    const cellSize = mazeGame.cellSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, mazeGame.canvas.width, mazeGame.canvas.height);
    
    // Draw solution path if showing
    if (mazeGame.showPath && mazeGame.solution.length > 0) {
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.lineWidth = cellSize * 0.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(
            mazeGame.solution[0].x * cellSize + cellSize / 2,
            mazeGame.solution[0].y * cellSize + cellSize / 2
        );
        
        for (let i = 1; i < mazeGame.solution.length; i++) {
            ctx.lineTo(
                mazeGame.solution[i].x * cellSize + cellSize / 2,
                mazeGame.solution[i].y * cellSize + cellSize / 2
            );
        }
        ctx.stroke();
    }
    
    // Draw maze walls
    ctx.strokeStyle = '#c44569';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < mazeGame.rows; i++) {
        for (let j = 0; j < mazeGame.cols; j++) {
            const x = j * cellSize;
            const y = i * cellSize;
            const cell = mazeGame.maze[i][j];
            
            ctx.beginPath();
            if (cell.top) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
            }
            if (cell.right) {
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            if (cell.bottom) {
                ctx.moveTo(x, y + cellSize);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            if (cell.left) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + cellSize);
            }
            ctx.stroke();
        }
    }
    
    // Draw goal (boy) with background circle
    const goalX = mazeGame.goalPos.x * cellSize + cellSize / 2;
    const goalY = mazeGame.goalPos.y * cellSize + cellSize / 2;
    
    // Blue background circle for boy
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(goalX, goalY, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw boy emoji
    ctx.font = `${cellSize * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText('👦', goalX, goalY);
    
    // Draw player (girl) with background circle
    const playerX = mazeGame.playerPos.x * cellSize + cellSize / 2;
    const playerY = mazeGame.playerPos.y * cellSize + cellSize / 2;
    
    // Pink background circle for girl
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(playerX, playerY, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw girl emoji
    ctx.fillStyle = '#000';
    ctx.fillText('👧', playerX, playerY);
}

// Handle keyboard controls
function handleMazeKeyPress(e) {
    if (mazeGame.gameWon) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            movePlayer('up');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            movePlayer('right');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            movePlayer('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            movePlayer('left');
            break;
    }
}

// Move player
function movePlayer(direction) {
    if (mazeGame.gameWon) return;
    
    // Auto-start music on first move
    if (mazeGame.moves === 0 && !musicPlaying) {
        bgMusic.play().catch(e => console.log('Music autoplay blocked'));
        musicToggle.classList.add('playing');
        musicToggle.textContent = '🔊';
        musicPlaying = true;
    }
    
    const {x, y} = mazeGame.playerPos;
    const cell = mazeGame.maze[y][x];
    let newX = x;
    let newY = y;
    
    switch(direction) {
        case 'up':
            if (!cell.top && y > 0) newY = y - 1;
            break;
        case 'right':
            if (!cell.right && x < mazeGame.cols - 1) newX = x + 1;
            break;
        case 'down':
            if (!cell.bottom && y < mazeGame.rows - 1) newY = y + 1;
            break;
        case 'left':
            if (!cell.left && x > 0) newX = x - 1;
            break;
    }
    
    if (newX !== x || newY !== y) {
        mazeGame.playerPos = {x: newX, y: newY};
        mazeGame.moves++;
        document.getElementById('moveCount').textContent = mazeGame.moves;
        drawMaze();
        
        // Check if won
        if (newX === mazeGame.goalPos.x && newY === mazeGame.goalPos.y) {
            winMazeGame();
        }
    }
}

// Win game
function winMazeGame() {
    mazeGame.gameWon = true;
    clearInterval(mazeGame.gameTimer);
    
    const time = Math.floor((Date.now() - mazeGame.startTime) / 1000);
    const message = document.getElementById('mazeMessage');
    message.textContent = `💕 Love Found! 💕 Time: ${time}s | Moves: ${mazeGame.moves}`;
    message.className = 'maze-message success';
    
    // Save score to scoreboard
    saveScore(time, mazeGame.moves);
    
    // Celebration animation
    celebrateLoveFound();
}

// Save score to localStorage
function saveScore(time, moves) {
    const score = {
        date: new Date().toISOString(),
        time: time,
        moves: moves,
        timestamp: Date.now()
    };
    
    let scores = JSON.parse(localStorage.getItem('mazeScores') || '[]');
    scores.push(score);
    scores.sort((a, b) => a.time - b.time); // Sort by time (fastest first)
    localStorage.setItem('mazeScores', JSON.stringify(scores));
}

function celebrateLoveFound() {
    const hearts = ['💕', '💖', '💗', '💝', '💘'];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = '-50px';
            heart.style.fontSize = '30px';
            heart.style.zIndex = '9999';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'confettiFall 3s linear forwards';
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), 3000);
        }, i * 100);
    }
}

// Update game time
function updateGameTime() {
    if (!mazeGame.gameWon) {
        const time = Math.floor((Date.now() - mazeGame.startTime) / 1000);
        document.getElementById('gameTime').textContent = time;
    }
}

// Start new maze
function startNewMaze() {
    generateMaze();
    drawMaze();
}

// Show solution
function showMazeSolution() {
    mazeGame.showPath = !mazeGame.showPath;
    drawMaze();
}

// Balloon Pop Game
let score = 0;
const balloonColors = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'];

function initializeBalloonGame() {
    createBalloons();
}

function createBalloons() {
    const container = document.getElementById('balloonsContainer');
    container.innerHTML = '';
    
    balloonColors.forEach((balloon, index) => {
        const balloonElement = document.createElement('div');
        balloonElement.className = 'balloon';
        balloonElement.textContent = balloon;
        balloonElement.style.animationDelay = `${index * 0.2}s`;
        balloonElement.onclick = function() {
            popBalloon(this);
        };
        container.appendChild(balloonElement);
    });
}

function popBalloon(balloon) {
    if (!balloon.classList.contains('popped')) {
        balloon.classList.add('popped');
        score++;
        document.getElementById('score').textContent = score;
        
        // Create surprise message
        const surprises = ['✨', '🎉', '🎊', '⭐', '💫', '🌟', '💝', '🎁'];
        const surprise = document.createElement('div');
        surprise.textContent = surprises[Math.floor(Math.random() * surprises.length)];
        surprise.style.position = 'absolute';
        surprise.style.fontSize = '40px';
        surprise.style.left = balloon.offsetLeft + 'px';
        surprise.style.top = balloon.offsetTop + 'px';
        surprise.style.animation = 'pop 1s ease forwards';
        balloon.parentElement.appendChild(surprise);
        
        setTimeout(() => {
            surprise.remove();
            balloon.remove();
        }, 500);
        
        // Check if all balloons are popped
        if (score === balloonColors.length) {
            setTimeout(() => {
                alert('🎉 Amazing! You popped all the balloons! You\'re awesome! 💖');
            }, 500);
        }
    }
}

function resetGame() {
    score = 0;
    document.getElementById('score').textContent = score;
    createBalloons();
}

// Smooth scroll to wishes section
function scrollToWishes() {
    document.getElementById('wishes').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Music Toggle
let musicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function toggleMusic() {
    if (musicPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.textContent = '🎵';
        musicPlaying = false;
    } else {
        // Note: Music will require user interaction to play due to browser policies
        bgMusic.play().catch(e => {
            console.log('Music playback requires user interaction');
        });
        musicToggle.classList.add('playing');
        musicToggle.textContent = '🔊';
        musicPlaying = true;
    }
}

// Intersection Observer for scroll animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    const elementsToObserve = document.querySelectorAll('.slide-up');
    elementsToObserve.forEach(element => {
        observer.observe(element);
    });
}

// Add hover effects to wish cards
document.querySelectorAll('.wish-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Easter egg - Click on the big heart
document.querySelector('.big-heart')?.addEventListener('click', function() {
    this.style.animation = 'none';
    setTimeout(() => {
        this.style.animation = 'heartbeat 1.5s ease-in-out infinite';
    }, 10);
    
    // Create heart burst
    const colors = ['❤️', '💖', '💕', '💗', '💓', '💝', '💘'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = colors[Math.floor(Math.random() * colors.length)];
            heart.style.position = 'fixed';
            heart.style.left = this.getBoundingClientRect().left + 'px';
            heart.style.top = this.getBoundingClientRect().top + 'px';
            heart.style.fontSize = '30px';
            heart.style.zIndex = '9999';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'heartBurst 2s ease-out forwards';
            
            const angle = (Math.PI * 2 * i) / 15;
            heart.style.setProperty('--tx', Math.cos(angle) * 200 + 'px');
            heart.style.setProperty('--ty', Math.sin(angle) * 200 + 'px');
            
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), 2000);
        }, i * 50);
    }
});

// Add CSS for heart burst animation
const style = document.createElement('style');
style.textContent = `
    @keyframes heartBurst {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Random sparkle effect on mouse move
let sparkleTimeout;
document.addEventListener('mousemove', function(e) {
    clearTimeout(sparkleTimeout);
    sparkleTimeout = setTimeout(() => {
        if (Math.random() > 0.9) {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.position = 'fixed';
            sparkle.style.left = e.pageX + 'px';
            sparkle.style.top = e.pageY + 'px';
            sparkle.style.fontSize = '20px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';
            sparkle.style.animation = 'fadeOut 1s ease-out forwards';
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
    }, 50);
});

const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.5) translateY(-30px);
        }
    }
`;
document.head.appendChild(fadeOutStyle);

console.log('🎉 Happy Birthday! This website was made with love! 💖');
