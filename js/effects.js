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
            ctx.fillStyle = 'hsla(' + this.hue + ', 100%, 70%, ' + this.opacity + ')';
            ctx.fill();
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'hsla(' + this.hue + ', 100%, 70%, 0.15)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            p.update();
            p.draw();
        });
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(0, 240, 255, ' + (0.06 * (1 - dist / 120)) + ')';
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
    var progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });

    // ==========================================
    // 4. 卡片3D倾斜效果 - ✅ 完全排除团队卡片
    // ==========================================
    // ✅ 只对普通卡片生效，完全排除 .team-logo-card
    var cards = document.querySelectorAll('.card:not(.no-tilt):not(.team-logo-card)');

    cards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = ((y - centerY) / centerY) * -5;
            var rotateY = ((x - centerX) / centerX) * 5;
            this.style.transform = 'translateY(-6px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        });
    });

    // ==========================================
    // 5. 数字滚动计数器
    // ==========================================
    var counters = document.querySelectorAll('.counter-number');

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target')) || 0;
        var duration = 2000;
        var startTime = performance.now();

        function updateCounter(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * target);
            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(updateCounter);
    }

    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                if (!el.dataset.counted) {
                    el.dataset.counted = 'true';
                    animateCounter(el);
                }
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function(c) {
        counterObserver.observe(c);
    });

    // ==========================================
    // 6. 打字机效果
    // ==========================================
    var typingElements = document.querySelectorAll('.typing-text');

    typingElements.forEach(function(el) {
        var originalHTML = el.innerHTML;
        var fullText = el.textContent;
        var totalLength = fullText.length;
        var currentIndex = 0;

        function typeNextChar() {
            if (currentIndex < totalLength) {
                var charCount = 0;
                var result = '';
                var inTag = false;
                var tagContent = '';

                for (var i = 0; i < originalHTML.length; i++) {
                    var ch = originalHTML[i];
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
    // 7. 卡片入场动画 - ✅ 排除团队卡片（它们有自己的动画）
    // ==========================================
    var allCards = document.querySelectorAll('.card:not(.team-logo-card), .gallery-item');
    allCards.forEach(function(card, index) {
        var delay = 0.05 + (index * 0.07);
        card.style.animationDelay = delay + 's';
    });

    // ✅ 对于团队卡片，直接显示（不额外添加延迟）
document.querySelectorAll('.team-logo-card').forEach(function(card) {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0) scale(1)';
});
});
