document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 E-Sports Club - JavaScript Initialized');
    initNavHighlight();
});

// 1. 导航栏自动高亮（优化版：过滤 URL 中的 ? 查询参数和 # 锚点）
function initNavHighlight() {
    const currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// 2. 自定义 Toast 消息提示框
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div class="toast show text-white" id="${toastId}" role="alert" style="background: #141430; border: 1px solid #ffd700;">
            <div class="toast-header" style="background: #1a1040; color: #ffd700;">
                <i class="fas fa-gamepad me-2"></i>
                <strong class="me-auto">E-Sports Club</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);
    setTimeout(() => {
        const toastEl = document.getElementById(toastId);
        if (toastEl) toastEl.remove();
    }, 4000);
}

// 3. 战队 & 选手 实时搜索过滤函数
function filterTeamsAndRosters() {
    const input = document.getElementById('teamSearchInput');
    if (!input) return;

    const query = input.value.toLowerCase().trim();
    const teamCols = document.querySelectorAll('.division-block .col');

    teamCols.forEach(col => {
        const teamCard = col.querySelector('.team-logo-card');
        if (!teamCard) return;

        const nameEn = teamCard.querySelector('.team-name-en')?.textContent.toLowerCase() || '';
        const nameCn = teamCard.querySelector('.team-name-cn')?.textContent.toLowerCase() || '';
        const onclickAttr = teamCard.getAttribute('onclick')?.toLowerCase() || '';

        if (query === '' || nameEn.includes(query) || nameCn.includes(query) || onclickAttr.includes(query)) {
            col.style.display = '';
        } else {
            col.style.display = 'none';
        }
    });
}

// 4. 清空搜索框
function clearSearch() {
    const input = document.getElementById('teamSearchInput');
    if (input) {
        input.value = '';
        filterTeamsAndRosters();
    }
}

// ==========================================
// NEWS 页面 - 阅读记录功能
// ==========================================

// 获取所有已读文章ID
function getReadNews() {
    try {
        return JSON.parse(localStorage.getItem('readNewsArticles')) || [];
    } catch (e) {
        return [];
    }
}

// 保存已读文章ID
function saveReadNews(ids) {
    localStorage.setItem('readNewsArticles', JSON.stringify(ids));
}

// 更新阅读UI
function updateReadUI() {
    let readNews = getReadNews();
    const readCount = document.getElementById('read-count');
    if (readCount) {
        readCount.innerText = readCount.innerText.replace(/\d+/, readNews.length);
        // 或者直接设置
        readCount.innerText = readNews.length;
    }

    for (let i = 1; i <= 6; i++) {
        let tag = document.getElementById('read-tag-' + i);
        if (tag) {
            if (readNews.includes(i)) {
                tag.classList.remove('d-none');
            } else {
                tag.classList.add('d-none');
            }
        }
    }
}

// 打开新闻弹窗并标记已读
function openNewsModal(id, title, date, content) {
    document.getElementById('modalNewsTitle').innerText = title;
    document.getElementById('modalNewsDate').innerText = date;
    document.getElementById('modalNewsContent').innerText = content;

    let readNews = getReadNews();
    if (!readNews.includes(id)) {
        readNews.push(id);
        saveReadNews(readNews);
    }

    updateReadUI();

    var newsModal = new bootstrap.Modal(document.getElementById('newsModal'));
    newsModal.show();
}

// 单独删除某条已读记录
function removeSingleRead(event, id) {
    if (event) event.stopPropagation();

    let readNews = getReadNews();
    readNews = readNews.filter(articleId => articleId !== id);
    saveReadNews(readNews);

    updateReadUI();
}

// 一键清空所有阅读历史
function clearReadHistory() {
    if (confirm("Are you sure you want to clear all reading history?")) {
        saveReadNews([]);
        updateReadUI();
    }
}

// 订阅 Newsletter
function subscribeNewsletter() {
    var emailInput = document.querySelector('.input-group input[type="email"]');
    var email = emailInput ? emailInput.value.trim() : '';
    if (!email) { alert('⚠️ Please enter your email address.'); return; }
    if (!email.includes('@') || !email.includes('.')) { alert('⚠️ Please enter a valid email address.'); return; }
    var subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
    if (subscribers.includes(email)) { alert('ℹ️ You are already subscribed!'); return; }
    subscribers.push(email);
    localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
    alert('✅ Subscribed successfully! Thank you for joining our newsletter.');
    emailInput.value = '';
}

// ==========================================
// TOURNAMENTS 页面 - 提醒功能
// ==========================================

function getReminders() {
    try { 
        var data = localStorage.getItem('tournamentReminders'); 
        if (data) { return JSON.parse(data); } 
    } catch (e) {}
    return [];
}

function saveReminders(data) {
    localStorage.setItem('tournamentReminders', JSON.stringify(data));
}

function renderReminderList() {
    var list = document.getElementById('reminderList');
    if (!list) return;
    var reminders = getReminders();
    if (reminders.length === 0) {
        list.innerHTML = `
            <li class="list-group-item text-center text-muted py-4" style="background:transparent; color:#a0a0c0 !important;">
                <i class="fas fa-bell-slash me-2"></i>
                No reminders yet. Click "Remind Me" on any tournament!
            </li>
        `;
    } else {
        var html = '';
        for (var i = 0; i < reminders.length; i++) {
            var r = reminders[i];
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center" style="background:rgba(255,255,255,0.05); color:#ffffff; border-color:rgba(139,92,246,0.3);">
                    <div>
                        <i class="fas fa-trophy text-warning me-2"></i>
                        <strong>${r.name}</strong>
                        <span class="badge-gold ms-2" style="font-size:0.7rem;padding:2px 10px;background:#ffd700;color:#0a0e27;border-radius:4px;">${r.game}</span>
                        <small class="text-muted ms-2"><i class="far fa-calendar-alt me-1"></i>${r.date || 'TBD'}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReminder('${r.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        }
        list.innerHTML = html;
    }
    updateAllRemindButtons();
}

function updateAllRemindButtons() {
    var reminders = getReminders();
    var btns = document.querySelectorAll('.remind-btn');
    for (var i = 0; i < btns.length; i++) {
        var onclickAttr = btns[i].getAttribute('onclick');
        if (!onclickAttr) continue;
        var match = onclickAttr.match(/toggleReminder\(this,\s*'([^']+)'/);
        if (!match) continue;
        var name = match[1];
        var exists = reminders.some(function(r) { return r.name === name; });
        if (exists) {
            btns[i].innerHTML = '<i class="fas fa-check me-1"></i> Reminded';
            btns[i].className = 'btn btn-success btn-sm';
            btns[i].style.background = '#28a745';
            btns[i].style.border = 'none';
            btns[i].style.color = '#fff';
        } else {
            btns[i].innerHTML = '<i class="fas fa-bell me-1"></i> Remind Me';
            btns[i].className = 'btn btn-outline-primary btn-sm';
            btns[i].style.background = '';
            btns[i].style.border = '';
            btns[i].style.color = '';
        }
    }
}

function toggleReminder(btn, name, game) {
    var reminders = getReminders();
    var foundIndex = -1;
    for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].name === name) { foundIndex = i; break; }
    }
    if (foundIndex >= 0) {
        reminders.splice(foundIndex, 1);
        saveReminders(reminders);
        renderReminderList();
        btn.innerHTML = '<i class="fas fa-bell me-1"></i> Remind Me';
        btn.className = 'btn btn-outline-primary btn-sm';
        btn.style.background = '';
        btn.style.border = '';
        btn.style.color = '';
    } else {
        reminders.push({ name: name, game: game, date: new Date().toLocaleDateString() });
        saveReminders(reminders);
        renderReminderList();
        btn.innerHTML = '<i class="fas fa-check me-1"></i> Reminded';
        btn.className = 'btn btn-success btn-sm';
        btn.style.background = '#28a745';
        btn.style.border = 'none';
        btn.style.color = '#fff';
    }
}

function deleteReminder(name) {
    var reminders = getReminders();
    var newReminders = reminders.filter(function(r) { return r.name !== name; });
    saveReminders(newReminders);
    renderReminderList();
}

function clearAllReminders() {
    if (confirm('Are you sure you want to clear all reminders?')) {
        saveReminders([]);
        renderReminderList();
    }
}

// ==========================================
// EVENTS 页面 - 报名功能
// ==========================================

function getRegisteredEvents() {
    try {
        return JSON.parse(localStorage.getItem('registeredEvents')) || [];
    } catch (e) {
        return [];
    }
}

function saveRegisteredEvents(ids) {
    localStorage.setItem('registeredEvents', JSON.stringify(ids));
}

// 注意：events.html 中的 checkRegisteredEvents 和 openRegisterModal 等函数已在该页面内定义
// 这里不需要重复定义，避免冲突