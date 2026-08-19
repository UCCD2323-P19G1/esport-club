// ==========================================
// 🏆 E-Sports Club - 主脚本
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 E-Sports Club - JavaScript Initialized');
    initNavHighlight();
    initSidebarHighlight();
    initAuthState();
    initEmailJS();
});

// ==========================================
// 1. 导航栏高亮
// ==========================================

function initNavHighlight() {
    const currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    // 检查顶部导航栏是否有 nav-link
    document.querySelectorAll('.top-navbar .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

function initSidebarHighlight() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link-side, .nav-link-mobile').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// ==========================================
// 2. Toast 消息提示
// ==========================================

function showToast(message) {
    let container = document.querySelector('.toast-container-custom');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container-custom';
        container.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            background: rgba(14, 22, 38, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 16px 28px;
            color: #fff;
            font-weight: 500;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
            pointer-events: none;
            font-family: 'Inter', sans-serif;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(container);
    }
    
    container.textContent = message;
    container.style.opacity = '1';
    container.style.transform = 'translateX(-50%) translateY(0)';
    
    clearTimeout(container._timeout);
    container._timeout = setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3500);
}


// ==========================================
// 4. NEWS 阅读记录功能
// ==========================================

function getReadNews() {
    try {
        return JSON.parse(localStorage.getItem('readNewsArticles')) || [];
    } catch (e) {
        return [];
    }
}

function saveReadNews(ids) {
    localStorage.setItem('readNewsArticles', JSON.stringify(ids));
}

function updateReadUI() {
    let readNews = getReadNews();
    const readCount = document.getElementById('read-count');
    if (readCount) {
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

function removeSingleRead(event, id) {
    if (event) event.stopPropagation();

    let readNews = getReadNews();
    readNews = readNews.filter(articleId => articleId !== id);
    saveReadNews(readNews);
    updateReadUI();
}

function clearReadHistory() {
    if (confirm("Are you sure you want to clear all reading history?")) {
        saveReadNews([]);
        updateReadUI();
    }
}

// ==========================================
// 5. TOURNAMENTS 提醒功能
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
// 6. EVENTS 报名功能
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

// ==========================================
// 7. 🔐 登录/注册功能
// ==========================================

function openAuthModal(tab) {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (tab === 'register') {
        switchAuthTab('register');
    } else {
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

// 检查 authModal 是否存在再绑定事件
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeAuthModal();
        });
    }
});

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (!loginForm || !registerForm) return;
    
    tabs.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        const activeTab = document.querySelector('.tab-btn[data-tab="login"]');
        if (activeTab) activeTab.classList.add('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        const activeTab = document.querySelector('.tab-btn[data-tab="register"]');
        if (activeTab) activeTab.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim() || '';
    const password = document.getElementById('loginPassword')?.value?.trim() || '';
    
    if (!email || !password) {
        showToast('⚠️ Please fill in all fields.');
        return;
    }
    
    // 从 localStorage 获取用户列表
    const users = JSON.parse(localStorage.getItem('esports_users')) || [];
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
        const session = {
            name: foundUser.name,
            email: foundUser.email,
            loggedIn: true
        };
        localStorage.setItem('esports_session', JSON.stringify(session));
        updateUserUI(session);
        closeAuthModal();
        showToast('✅ Welcome back, ' + foundUser.name + '!');
        document.getElementById('loginForm')?.reset();
    } else {
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            showToast('❌ Incorrect password. Please try again.');
        } else {
            showToast('❌ No account found with this email. Please register.');
        }
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName')?.value?.trim() || '';
    const email = document.getElementById('regEmail')?.value?.trim() || '';
    const password = document.getElementById('regPassword')?.value || '';
    const confirm = document.getElementById('regConfirm')?.value || '';
    
    if (!name || !email || !password || !confirm) {
        showToast('⚠️ Please fill in all fields.');
        return;
    }
    if (password.length < 6) {
        showToast('⚠️ Password must be at least 6 characters.');
        return;
    }
    if (password !== confirm) {
        showToast('⚠️ Passwords do not match.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('esports_users')) || [];
    if (users.some(u => u.email === email)) {
        showToast('❌ This email is already registered. Please login.');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('esports_users', JSON.stringify(users));
    
    const session = { name, email, loggedIn: true };
    localStorage.setItem('esports_session', JSON.stringify(session));
    updateUserUI(session);
    closeAuthModal();
    showToast('🎉 Welcome, ' + name + '! Your account has been created.');
    document.getElementById('registerForm')?.reset();
}

function handleLogout(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('esports_session');
        updateUserUI(null);
        showToast('👋 You have been signed out.');
    }
}

function socialLogin(provider) {
    const session = {
        name: provider + '_User',
        email: provider.toLowerCase() + '@example.com',
        loggedIn: true
    };
    localStorage.setItem('esports_session', JSON.stringify(session));
    updateUserUI(session);
    closeAuthModal();
    showToast('✅ Signed in with ' + provider + '!');
}

function updateUserUI(session) {
    const authButtons = document.getElementById('authButtons');
    const userAvatar = document.getElementById('userAvatarTop');
    const userInitial = document.getElementById('userInitialTop');
    
    if (!authButtons || !userAvatar || !userInitial) return;
    
    if (session && session.loggedIn) {
        authButtons.style.display = 'none';
        userAvatar.style.display = 'flex';
        userInitial.textContent = session.name.charAt(0).toUpperCase();
    } else {
        authButtons.style.display = 'flex';
        userAvatar.style.display = 'none';
    }
}

function initAuthState() {
    const session = JSON.parse(localStorage.getItem('esports_session'));
    if (session && session.loggedIn) {
        updateUserUI(session);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAuthModal();
});

// ==========================================
// 8. 📧 EmailJS 邮件发送
// ==========================================

function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init('u8ay6aMukCVKXLVXy');
        console.log('📧 EmailJS initialized successfully');
    } else {
        console.warn('⚠️ EmailJS SDK not loaded');
    }
}

// 统一的 Newsletter 订阅函数
function subscribeNewsletter() {
    const input = document.querySelector('.input-group input[type="email"]');
    const email = input ? input.value.trim() : '';
    
    if (!email) {
        showToast('⚠️ Please enter your email.');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('⚠️ Please enter a valid email address.');
        return;
    }

    // 检查是否已订阅
    var subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
    if (subscribers.includes(email)) {
        showToast('ℹ️ You are already subscribed!');
        return;
    }

    // 检查 EmailJS 是否可用
    if (typeof emailjs === 'undefined') {
        // 降级方案：仅保存到 localStorage
        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        showToast('✅ Subscribed successfully! (Local mode)');
        input.value = '';
        return;
    }

    // 发送邮件
    emailjs.send(
        'service_94dlryn',
        'template_1v2mnaq',
        {
            to_email: 'deejiashuaggmail.com',
            from_email: email,
            subject: 'New Newsletter Subscription',
            message: 'Email: ' + email
        }
    ).then(function(response) {
        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        showToast('✅ Subscribed successfully! We will keep you updated.');
        input.value = '';
    }).catch(function(error) {
        console.error('EmailJS Error:', error);
        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        showToast('✅ Subscribed successfully! (We\'ll save your email locally)');
        input.value = '';
    });
}
// ==========================================
// 📦 jQuery 功能
// ==========================================

// 使用 jQuery 封装 (在 DOMContentLoaded 中)
$(document).ready(function() {
    
    // 1. 侧边栏菜单 hover 效果
    $('.nav-link-side').hover(
        function() {
            $(this).find('i').css('transform', 'scale(1.2)');
            $(this).find('.link-label').css('color', '#00F0FF');
        },
        function() {
            $(this).find('i').css('transform', 'scale(1)');
            $(this).find('.link-label').css('color', '');
        }
    );
    
    // 2. 卡片动画 - 滚动到视口时触发
    $('.card, .team-logo-card, .gallery-item').each(function(index) {
        var el = $(this);
        var delay = 0.05 + (index * 0.07);
        el.css('animation-delay', delay + 's');
    });
    
    // 3. 平滑滚动到顶部
    $('#scrollToTop').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 600);
    });
    
    // 4. 团队搜索防抖 - 使用 jQuery
var searchTimeout = null;
if ($('#teamSearchInput').length) {   // ✅ 加了判断！只有元素存在才绑定
    $('#teamSearchInput').on('keyup', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            var query = $(this).val().toLowerCase().trim();
            $('.division-block .col').each(function() {
                var text = $(this).text().toLowerCase();
                if (query === '' || text.indexOf(query) !== -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }.bind(this), 300);
    });
}
    
    // 5. 登录弹窗淡入淡出
    $('#authModal .tab-btn').on('click', function() {
        var tab = $(this).data('tab');
        if (tab === 'login') {
            $('#loginForm').fadeIn(200).removeClass('hidden');
            $('#registerForm').fadeOut(200).addClass('hidden');
        } else {
            $('#loginForm').fadeOut(200).addClass('hidden');
            $('#registerForm').fadeIn(200).removeClass('hidden');
        }
        $(this).addClass('active').siblings().removeClass('active');
    });
    
    console.log('📦 jQuery initialized successfully');
});

// ==========================================
// 💾 Session Storage 功能
// ==========================================

// Session Storage 工具函数
function setSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Session storage error:', e);
    }
}

function getSession(key) {
    try {
        var data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function removeSession(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (e) {}
}

function clearSession() {
    try {
        sessionStorage.clear();
    } catch (e) {}
}

// ==========================================
// 使用 Session Storage 替代 localStorage
// ==========================================

// 1. 登录状态 - 使用 Session Storage（关闭浏览器后自动清除）
function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail')?.value?.trim() || '';
    var password = document.getElementById('loginPassword')?.value?.trim() || '';
    
    if (!email || !password) {
        showToast('⚠️ Please fill in all fields.');
        return;
    }
    
    var users = JSON.parse(localStorage.getItem('esports_users')) || [];
    var foundUser = users.find(function(u) { return u.email === email && u.password === password; });
    
    if (foundUser) {
        var session = {
            name: foundUser.name,
            email: foundUser.email,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };
        // ✅ 使用 Session Storage 存储登录状态
        setSession('esports_session', session);
        updateUserUI(session);
        closeAuthModal();
        showToast('✅ Welcome back, ' + foundUser.name + '!');
        document.getElementById('loginForm')?.reset();
    } else {
        var userExists = users.some(function(u) { return u.email === email; });
        showToast(userExists ? '❌ Incorrect password.' : '❌ No account found.');
    }
}

// 2. 用户浏览历史 - 记录用户访问过的页面
function trackPageView() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var history = getSession('pageHistory') || [];
    
    // 限制历史记录数量（最多20条）
    if (history.length > 20) {
        history.shift();
    }
    
    // 避免重复记录同一页面
    if (history.length === 0 || history[history.length - 1] !== currentPage) {
        history.push({
            page: currentPage,
            time: new Date().toISOString()
        });
        setSession('pageHistory', history);
    }
}

// 3. 记住用户偏好
function saveUserPreference(key, value) {
    var prefs = getSession('userPreferences') || {};
    prefs[key] = value;
    setSession('userPreferences', prefs);
}

function getUserPreference(key) {
    var prefs = getSession('userPreferences') || {};
    return prefs[key] || null;
}

// 4. 购物车/报名暂存 - 用户未登录时的临时数据
function addToTempCart(item) {
    var cart = getSession('tempCart') || [];
    cart.push(item);
    setSession('tempCart', cart);
}

function getTempCart() {
    return getSession('tempCart') || [];
}

function clearTempCart() {
    removeSession('tempCart');
}

// 5. 退出登录 - 清除 Session
function handleLogout(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to sign out?')) {
        // ✅ 清除 Session Storage
        removeSession('esports_session');
        removeSession('userPreferences');
        updateUserUI(null);
        showToast('👋 You have been signed out.');
    }
}

// 6. 初始化 - 从 Session 恢复状态
function initAuthState() {
    // ✅ 从 Session Storage 恢复登录状态
    var session = getSession('esports_session');
    if (session && session.loggedIn) {
        // 检查是否过期（8小时）
        var loginTime = new Date(session.loginTime);
        var now = new Date();
        var hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 8) {
            // 会话过期
            removeSession('esports_session');
            updateUserUI(null);
            showToast('⏰ Session expired. Please login again.');
        } else {
            updateUserUI(session);
        }
    }
}

// 7. 记录用户行为
function trackUserAction(action) {
    var actions = getSession('userActions') || [];
    actions.push({
        action: action,
        page: window.location.pathname.split('/').pop() || 'index.html',
        time: new Date().toISOString()
    });
    // 只保留最近50条
    if (actions.length > 50) {
        actions = actions.slice(-50);
    }
    setSession('userActions', actions);
}

// 页面加载时调用
$(document).ready(function() {
    // 跟踪页面访问
    trackPageView();
    
    // 恢复登录状态
    initAuthState();
    
    // 记录用户行为示例
    $('.game-tab-btn').on('click', function() {
        var game = $(this).text().trim();
        trackUserAction('Filter: ' + game);
    });
    
    $('.team-logo-card').on('click', function() {
        var team = $(this).find('.team-name-en').text().trim();
        trackUserAction('View Team: ' + team);
    });
});
// ==========================================
// 📱 Social Media Plugin - 分享功能
// ==========================================

// 获取当前页面 URL 和标题
function getShareData() {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title || 'E-Sports Club');
    var description = encodeURIComponent('Join the ultimate E-Sports community! 🎮');
    return { url: url, title: title, description: description };
}

// Facebook 分享
function shareOnFacebook() {
    var url = window.location.href;
    // 本地 file:// 协议处理
    if (url.startsWith('file://')) {
        // 部署后的正式域名
        var siteDomain = 'https://your-esports-club.com';
        var path = window.location.pathname;
        url = siteDomain + path;
    }
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'width=600,height=400');
}

// Twitter/X Share
function shareOnTwitter() {
    var data = getShareData();
    window.open(
        'https://twitter.com/intent/tweet?text=' + data.title + '%20-%20' + data.description + '&url=' + data.url + '&hashtags=Esports,Gaming',
        '_blank',
        'width=600,height=400'
    );
    trackUserAction('Share: Twitter');
}

// LinkedIn Share
function shareOnLinkedIn() {
    var data = getShareData();
    window.open(
        'https://www.linkedin.com/sharing/share-offsite/?url=' + data.url,
        '_blank',
        'width=600,height=400'
    );
    trackUserAction('Share: LinkedIn');
}

// WhatsApp Share
function shareOnWhatsApp() {
    var data = getShareData();
    window.open(
        'https://api.whatsapp.com/send?text=' + data.title + '%20-%20' + data.description + '%20' + data.url,
        '_blank',
        'width=600,height=400'
    );
    trackUserAction('Share: WhatsApp');
}

// Telegram Share
function shareOnTelegram() {
    var data = getShareData();
    window.open(
        'https://t.me/share/url?url=' + data.url + '&text=' + data.title + '%20-%20' + data.description,
        '_blank',
        'width=600,height=400'
    );
    trackUserAction('Share: Telegram');
}

// Copy Link
function copyPageLink() {
    var url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('✅ Link copied to clipboard!');
        }).catch(function() {
            // 降级方案
            fallbackCopyLink(url);
        });
    } else {
        fallbackCopyLink(url);
    }
    trackUserAction('Share: Copy Link');
}

function fallbackCopyLink(url) {
    var textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ Link copied to clipboard!');
    } catch (e) {
        showToast('⚠️ Please copy the link manually: ' + url);
    }
    document.body.removeChild(textarea);
}

// ==========================================
// 社交嵌入插件 - 显示社交媒体动态
// ==========================================

// Facebook Page Plugin (嵌入 Facebook 页面)
function embedFacebookPage() {
    var container = document.getElementById('facebookEmbed');
    if (!container) return;
    
    container.innerHTML = `
        <div class="fb-page" 
             data-href="https://www.facebook.com/yourpage" 
             data-tabs="timeline" 
             data-width="340" 
             data-height="500" 
             data-small-header="false" 
             data-adapt-container-width="true" 
             data-hide-cover="false" 
             data-show-facepile="true">
            <blockquote cite="https://www.facebook.com/yourpage" class="fb-xfbml-parse-ignore">
                <a href="https://www.facebook.com/yourpage">E-Sports Club</a>
            </blockquote>
        </div>
    `;
}

// Twitter/X Timeline Embed
function embedTwitterTimeline() {
    var container = document.getElementById('twitterEmbed');
    if (!container) return;
    
    container.innerHTML = `
        <a class="twitter-timeline" 
           data-width="340" 
           data-height="500" 
           href="https://twitter.com/yourhandle?ref_src=twsrc%5Etfw">
            Tweets by E-Sports Club
        </a>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    `;
}

// Instagram Feed Embed
function embedInstagramFeed() {
    var container = document.getElementById('instagramEmbed');
    if (!container) return;
    
    // 使用 Instagram 官方嵌入
    container.innerHTML = `
        <blockquote class="instagram-media" 
                    data-instgrm-permalink="https://www.instagram.com/yourhandle/" 
                    data-instgrm-version="14" 
                    style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5); margin: 1px; max-width:340px; padding:0; width:99.375%;">
        </blockquote>
        <script async src="https://www.instagram.com/embed.js"></script>
    `;
}
// ==========================================
// 🌐 网站配置
// ==========================================
var SITE_URL = 'https://your-esports-club.com'; // ⚠️ 替换成你的域名

function getShareUrl() {
    var url = window.location.href;
    if (url.startsWith('file://')) {
        var path = window.location.pathname;
        var fileName = path.split('/').pop() || 'index.html';
        return SITE_URL + '/' + fileName;
    }
    return url;
}

// ==========================================
// 📱 Social Media Share
// ==========================================

// 获取当前页面 URL 和标题
function getShareData() {
    var url = getShareUrl();
    var title = encodeURIComponent(document.title || 'E-Sports Club');
    return { url: url, title: title };
}

// Facebook 分享
function shareOnFacebook() {
    var data = getShareData();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + data.url, '_blank', 'width=600,height=400');
}

// Twitter 分享
function shareOnTwitter() {
    var data = getShareData();
    window.open('https://twitter.com/intent/tweet?url=' + data.url + '&text=' + data.title, '_blank', 'width=600,height=400');
}

// LinkedIn 分享
function shareOnLinkedIn() {
    var data = getShareData();
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + data.url, '_blank', 'width=600,height=400');
}

// WhatsApp 分享
function shareOnWhatsApp() {
    var data = getShareData();
    window.open('https://api.whatsapp.com/send?text=' + data.title + '%20' + data.url, '_blank', 'width=600,height=400');
}

// 复制链接
function copyPageLink() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('✅ Link copied to clipboard!');
        }).catch(function() {
            copyLinkFallback(url);
        });
    } else {
        copyLinkFallback(url);
    }
}

function copyLinkFallback(url) {
    var tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        showToast('✅ Link copied to clipboard!');
    } catch (e) {
        showToast('⚠️ Please copy the link manually');
    }
    document.body.removeChild(tempInput);
}

// ==========================================
// 🌐 RESTful API - 仅用于演示，不覆盖数据
// ==========================================

// 只在控制台显示 API 数据，不影响页面
function demoAPI() {
    console.log('🌐 API Demo: Fetching team data...');
    
    // 模拟 API 请求
    var mockData = {
        lpl: ['AL', 'BLG', 'EDG', 'iG', 'JDG', 'LGD', 'LNG', 'NIP', 'OMG', 'TES', 'TT', 'UP', 'WBG', 'WE'],
        kpl: ['AG', 'DRG', 'DYG', 'EDGM', 'ESTAR', 'KSG', 'HERO', 'WB', 'WOLVES', 'TESA', 'TTG', 'RW', 'WE', 'JDG', 'LGD', 'RNGM', 'SYG', 'WST']
    };
    
    console.log('📊 LPL Teams:', mockData.lpl);
    console.log('📊 KPL Teams:', mockData.kpl);
    console.log('✅ API Demo completed (data not applied to page)');
}

// 页面加载后在控制台显示 API 数据（不影响页面显示）
document.addEventListener('DOMContentLoaded', function() {
    demoAPI();
});
// ==========================================
// 用户头像 - 点击切换下拉菜单
// ==========================================

// ✅ 切换下拉菜单
function toggleDropdown(event) {
    if (event) {
        event.stopPropagation(); // 防止冒泡
    }
    var menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

// ✅ 点击菜单项
function handleMenuItemClick(action, event) {
    if (event) {
        event.stopPropagation(); // 防止关闭菜单
        event.preventDefault();  // 防止页面跳转
    }
    
    // 关闭菜单
    var menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.classList.remove('open');
    }
    
}

// ✅ 点击页面其他地方关闭菜单
document.addEventListener('click', function(event) {
    var avatar = document.querySelector('.user-avatar-top');
    var menu = document.getElementById('userDropdownMenu');
    
    if (avatar && menu) {
        // 如果点击的不是头像和菜单区域，关闭菜单
        if (!avatar.contains(event.target)) {
            menu.classList.remove('open');
        }
    }
});

// ✅ 按 ESC 键关闭菜单
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        var menu = document.getElementById('userDropdownMenu');
        if (menu) {
            menu.classList.remove('open');
        }
    }
});
