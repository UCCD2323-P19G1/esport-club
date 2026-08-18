// ==========================================
// 🌌 极光竞技 · 动态效果引擎
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ==========================================
    // 1. 鼠标跟随光晕
    // ==========================================
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.prepend(glow);

    let mouseX = -1000, mouseY = -1000;
    let glowX = -1000, glowY = -1000;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ==========================================
    // 2. 粒子背景
    // ==========================================
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    const PARTICLE_COUNT = 50;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 190 : 330;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
            ctx.fill();
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.15)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // ==========================================
    // 3. 滚动进度条
    // ==========================================
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });

    // ==========================================
    // 4. 卡片3D倾斜效果
    // ==========================================
    const cards = document.querySelectorAll('.card:not(.no-tilt)');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            this.style.transform = 
                `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        });
    });

    // ==========================================
    // 5. 数字滚动计数器
    // ==========================================
    const counters = document.querySelectorAll('.counter-number');
    
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target')) || 0;
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(updateCounter);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.dataset.counted) {
                    el.dataset.counted = 'true';
                    animateCounter(el);
                }
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

// ==========================================
// 6. 打字机效果 (固定速度版)
// ==========================================
const typingElements = document.querySelectorAll('.typing-text');

typingElements.forEach(el => {
    const originalHTML = el.innerHTML;
    const fullText = el.textContent;
    const totalLength = fullText.length;
    let currentIndex = 0;
    
    function typeNextChar() {
        if (currentIndex < totalLength) {
            let charCount = 0;
            let result = '';
            let inTag = false;
            let tagContent = '';
            
            for (let i = 0; i < originalHTML.length; i++) {
                const ch = originalHTML[i];
                if (ch === '<') {
                    inTag = true;
                    tagContent = '';
                }
                if (inTag) {
                    tagContent += ch;
                    if (ch === '>') {
                        inTag = false;
                        result += tagContent;
                    }
                    continue;
                }
                if (charCount < currentIndex + 1) {
                    result += ch;
                    charCount++;
                }
            }
            
            el.innerHTML = result;
            el.style.width = (currentIndex + 1) * 0.6 + 'em';
            currentIndex++;
            
            // 🔥 固定速度 - 每个字母 60ms
            setTimeout(typeNextChar, 60);
        } else {
            el.style.borderRight = 'none';
        }
    }
    
    el.innerHTML = '';
    el.style.width = '0';
    el.style.display = 'inline-block';
    el.style.whiteSpace = 'nowrap';
    el.style.overflow = 'hidden';
    el.style.borderRight = '3px solid var(--accent-cyan)';
    
    setTimeout(typeNextChar, 10);
});

    // ==========================================
    // 7. 卡片入场动画
    // ==========================================
    const allCards = document.querySelectorAll('.card, .team-logo-card, .gallery-item');
    allCards.forEach((card, index) => {
        const delay = 0.05 + (index * 0.07);
        card.style.animationDelay = delay + 's';
    });

    console.log('🌌 极光竞技 · 动态效果引擎已启动');
});