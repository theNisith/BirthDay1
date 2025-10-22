// Music Toggle Functionality
let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '🎵';
    } else {
        bgMusic.play().catch(e => console.log('Music autoplay blocked'));
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '🎶';
    }
    isMusicPlaying = !isMusicPlaying;
}

// Create shooting stars
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.cssText = `
        position: fixed;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 10px 2px white;
        top: ${Math.random() * 50}%;
        left: ${Math.random() * 100}%;
        animation: shoot 2s linear forwards;
        z-index: 1;
    `;
    
    document.body.appendChild(star);
    
    setTimeout(() => {
        star.remove();
    }, 2000);
}

// Add shooting star animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shoot {
        0% {
            transform: translate(0, 0) rotate(-45deg);
            opacity: 1;
        }
        100% {
            transform: translate(200px, 200px) rotate(-45deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create occasional shooting stars
setInterval(() => {
    if (Math.random() > 0.7) {
        createShootingStar();
    }
}, 3000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const starsContainer = document.querySelector('.stars-container');
    if (starsContainer) {
        starsContainer.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

console.log('🌙 Adventures await...');
