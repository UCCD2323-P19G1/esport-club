document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 E-Sports Club - JavaScript Initialized');
    initNavHighlight();
});

// 1. 导航栏自动高亮（优化版：过滤 URL 中的 ? 查询参数和 # 锚点）
function initNavHighlight() {
    // 提取纯文件名，忽略 query string 和 hash
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
    // 查找所有战队卡片所在的列 (col)
    const teamCols = document.querySelectorAll('.division-block .col');

    teamCols.forEach(col => {
        const teamCard = col.querySelector('.team-logo-card');
        if (!teamCard) return;

        // 提取战队英文名、中文名
        const nameEn = teamCard.querySelector('.team-name-en')?.textContent.toLowerCase() || '';
        const nameCn = teamCard.querySelector('.team-name-cn')?.textContent.toLowerCase() || '';
        
        // 提取 onclick 属性（里面包含了该战队所有选手的 IGN、全名等信息）
        const onclickAttr = teamCard.getAttribute('onclick')?.toLowerCase() || '';

        // 如果搜索框为空，或匹配到战队名/选手ID，则显示该战队
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