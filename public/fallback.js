(function () {
  const root = document.getElementById('root');
  const preview = document.getElementById('static-preview');
  const stage = preview && preview.querySelector('.page-stage');
  if (!preview || !stage) return;
  const protectedPages = ['/app', '/wardrobe', '/journal', '/profile'];
  let fallbackNext = '/app';

  function hasSession() {
    try {
      return Boolean(JSON.parse(localStorage.getItem('yx-session') || 'null')?.token);
    } catch {
      return false;
    }
  }

  const wardrobeTypes = ['上衣', '下装', '外套', '鞋子', '配饰'];
  const wardrobeItems = [
    ['上衣', '月白短款针织', '白色 / 春秋 / 温柔', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86'],
    ['上衣', '花影吊带上衣', '碎花 / 夏季 / 清新', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=86'],
    ['上衣', '黑色短袖 T', '黑色 / 四季 / 街头', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=86'],
    ['下装', '雾粉半身裙', '粉色 / 春秋 / 浪漫', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=86'],
    ['下装', '浅蓝牛仔裤', '蓝色 / 四季 / 休闲', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=86'],
    ['下装', '奶油阔腿裤', '米色 / 春秋 / 通勤', 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=900&q=86'],
    ['外套', '薄雾风衣', '米色 / 春秋 / 通勤', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=86'],
    ['外套', '酒红短外套搭配', '红色 / 冬季 / 复古', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86'],
    ['外套', '灰调西装', '灰色 / 春秋 / 利落', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=86'],
    ['鞋子', '奶油乐福鞋搭配', '米色 / 四季 / 轻便', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86'],
    ['鞋子', '碎花高跟鞋搭配', '彩色 / 四季 / 精致', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=86'],
    ['鞋子', '白色运动鞋搭配', '白色 / 四季 / 轻便', 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=900&q=86'],
    ['配饰', '珍珠耳饰搭配', '白色 / 四季 / 精致', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=86'],
    ['配饰', '酒红小包搭配', '红色 / 四季 / 约会', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86'],
  ];
  const wardrobeTypeMeta = {
    上衣: { color: '#e8c9bd', hint: '针织 / 衬衫 / T 恤' },
    下装: { color: '#e7b7c4', hint: '半身裙 / 牛仔 / 阔腿裤' },
    外套: { color: '#d8c0a4', hint: '风衣 / 西装 / 短外套' },
    鞋子: { color: '#cfd3ad', hint: '乐福鞋 / 高跟鞋 / 运动鞋' },
    配饰: { color: '#d9ccd8', hint: '包袋 / 耳饰 / 丝巾' },
  };

  function wardrobeCards(type) {
    return wardrobeItems
      .filter(([itemType]) => itemType === type)
      .map(([itemType, name, meta, image]) => `<article class="wardrobe-card"><div class="garment-photo" style="--garment-image:url('${image}')"></div><div class="wardrobe-meta"><span>${itemType}</span><small>待接入上传</small></div><h3>${name}</h3><p>${meta}</p></article>`)
      .join('') + `<button class="add-garment-card" type="button"><span>添加${type}</span><small>后续接入真实上传、颜色、季节与风格标签</small></button>`;
  }

  function categoryRail(active = '') {
    return `<div class="category-rail" aria-label="衣柜分类">${wardrobeTypes
      .map((type) => `<button class="${active === type ? 'is-active' : ''}" style="--category-color:${wardrobeTypeMeta[type].color}" type="button" data-category="${type}"><span>${type}</span><small>${wardrobeTypeMeta[type].hint}</small></button>`)
      .join('')}</div>`;
  }

  function categoryDetail(type) {
    return `
      <div class="category-detail">
        <div class="category-detail-head">
          <p class="kicker">Category opened</p>
          <h2>${type}</h2>
          <button type="button" class="line-button" data-category-back>返回分类</button>
        </div>
        <div class="wardrobe-grid" data-wardrobe-grid>${wardrobeCards(type)}</div>
      </div>
    `;
  }

  const pages = {
    '/': stage.innerHTML,
    '/login': `
      <section class="login-experience">
        <div class="page-intro">
          <p class="kicker">Personal styling account</p>
          <h1 class="two-line-title"><span>登录后，</span><span>推荐会记住你的审美</span></h1>
          <p>使用本地模拟登录保存偏好、衣柜和历史 Look，用于比赛现场完整演示。</p>
        </div>
        <div class="login-grid">
          <div class="glass-form">
            <h2>演示账号登录</h2>
            <p>今日行程、衣柜、手记和画像都属于个人数据，请先登录再进入系统。</p>
            <div class="demo-account"><span>预置演示账号</span><strong>demo / Yuexing@2026</strong></div>
            <button class="ink-button" type="button" data-fallback-login>登录并进入系统</button>
            <div class="login-hint">React 正常挂载后会使用后端 /api/auth/login 完成账号验证。</div>
          </div>
          <div class="quiz-card">
            <p class="kicker">First sign-in quiz</p>
            <h2>首次登录问答</h2>
            <div class="quiz-row"><strong>今天你更想呈现哪种状态？</strong><div class="quiz-options"><button class="is-active">温柔</button><button>元气</button><button>松弛</button><button>专注</button></div></div>
            <div class="quiz-row"><strong>你最常出现在哪类场景？</strong><div class="quiz-options"><button>上学</button><button>通勤</button><button class="is-active">约会</button><button>休闲</button></div></div>
            <div class="quiz-row"><strong>你偏爱的颜色气质是？</strong><div class="quiz-options"><button class="is-active">浅色系</button><button>黑白灰</button><button>复古红</button><button>低饱和</button></div></div>
            <div class="look-tags generated-tags"><span>温柔</span><span>约会</span><span>浅色系</span><span>春秋</span><span>轻通勤</span></div>
          </div>
        </div>
      </section>
    `,
    '/app': `
      <section class="dashboard-page">
        <header class="page-header"><p class="kicker">Daily trip planner</p><h1>今日行程助手</h1></header>
        <div class="recommend-layout">
          <div class="condition-orbit">
            <article class="floating-chip"><span>天气</span><strong>晴天</strong></article>
            <article class="floating-chip"><span>温度</span><strong>24 摄氏度</strong></article>
            <article class="floating-chip"><span>推荐心情</span><strong>温柔</strong></article>
            <article class="floating-chip"><span>场景</span><strong>约会</strong></article>
          </div>
          <article class="look-result">
            <p class="kicker">Generated look</p>
            <h2>春秋温柔约会感</h2>
            <p>轻薄层次配合浅色系，保留柔和氛围，同时用外套线条让整体更完整。</p>
            <div class="piece-board compact">
              <div class="piece-card"><span>上衣</span><strong>月白短款针织</strong></div>
              <div class="piece-card"><span>下装</span><strong>雾粉半身裙</strong></div>
              <div class="piece-card"><span>外套</span><strong>薄雾风衣</strong></div>
              <div class="piece-card"><span>鞋子</span><strong>奶油乐福鞋</strong></div>
            </div>
          </article>
        </div>
      </section>
    `,
    '/journal': `
      <section class="dashboard-page journal-page">
        <header class="page-header"><p class="kicker">Travel memory</p><h1>我的手记</h1></header>
        <div class="journal-hero">
          <div>
            <p class="kicker">Long-term learning</p>
            <h2>记录去过的地方，也让系统记住你怎样出门。</h2>
            <p>手记会沉淀地点、天气、情绪、出行方式和体验负担点，成为下一次推荐的学习样本。</p>
          </div>
          <div class="journal-stats"><strong>3</strong><span>条演示手记</span></div>
        </div>
        <div class="journal-layout">
          <div class="journal-form">
            <h2>新增手记</h2>
            <p>React 正常挂载后可上传照片、保存正文，并生成 AI 摘要、情绪复盘和下次建议。</p>
            <button class="ink-button" type="button">保存并生成 AI 复盘</button>
          </div>
          <div class="journal-panel">
            <div class="journal-tabs"><button class="is-active">手记列表</button><button>月度总结</button><button>年度总结</button></div>
            <article class="memory-card">
              <div>
                <span>2026-04-24 · 湖边散步</span>
                <h3>多云天的松弛出行</h3>
                <p>系统识别到自然疗愈、步行和低负担偏好，下一次类似天气会优先推荐舒适鞋和轻便包。</p>
                <div class="memory-tags"><span>自然疗愈</span><span>舒适鞋</span><span>多云</span></div>
              </div>
            </article>
          </div>
        </div>
      </section>
    `,
    '/wardrobe': `
      <section class="dashboard-page">
        <header class="page-header"><p class="kicker">Wardrobe archive</p><h1>我的衣柜</h1></header>
        ${categoryRail('')}
        <div data-wardrobe-content><p class="wardrobe-empty-copy">选择一个分类，进入对应衣物内容。</p></div>
      </section>
    `,
    '/profile': `
      <section class="split-page">
        <div class="page-intro">
          <p class="kicker">Personal taste model</p>
          <h1>个性画像决定下一次出行。</h1>
          <p>这里会保存颜色偏好、风格偏好、常用地点、天气敏感度和手记关键词。</p>
        </div>
        <div class="preference-board">
          <h2>游客的偏好标签</h2>
          <div class="look-tags"><span>温柔</span><span>约会</span><span>浅色系</span><span>春秋</span><span>轻通勤</span></div>
        </div>
      </section>
    `,
    '/about': `
      <section class="about-page">
        <header class="page-header"><p class="kicker">Competition concept</p><h1>作品说明</h1></header>
        <div class="about-columns">
          <article class="story-card"><span>A</span><h2>创意来源</h2><p>来自学生群体每日出行、天气变化、穿搭选择和复盘记录的真实痛点。</p></article>
          <article class="story-card"><span>B</span><h2>技术路线</h2><p>React/Vite + Node.js + SQLite，接入 Open-Meteo 和兼容 OpenAI 的模型。</p></article>
          <article class="story-card"><span>C</span><h2>展示价值</h2><p>形成出门前方案、出门中提醒、出门后手记复盘的 AI 行程闭环。</p></article>
        </div>
      </section>
    `,
  };

  const pageNames = {
    '/': { en: 'HOME', cn: '首页' },
    '/login': { en: 'SIGN IN', cn: '登录' },
    '/app': { en: 'DAILY TRIP', cn: '今日行程' },
    '/wardrobe': { en: 'WARDROBE', cn: '我的衣柜' },
    '/journal': { en: 'TRAVEL MEMORY', cn: '我的手记' },
    '/profile': { en: 'PROFILE', cn: '个性画像' },
    '/about': { en: 'CONCEPT', cn: '作品说明' },
  };

  const heroSlides = [
    {
      title: 'City Soft Look',
      mood: '轻盈通勤',
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=88',
    },
    {
      title: 'Date Mood',
      mood: '温柔约会',
      image:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=88',
    },
    {
      title: 'Campus Ease',
      mood: '校园松弛',
      image:
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88',
    },
    {
      title: 'Coat Rhythm',
      mood: '利落通勤',
      image:
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88',
    },
    {
      title: 'Quiet Luxury',
      mood: '低调精致',
      image:
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=88',
    },
    {
      title: 'Soft Street',
      mood: '日常轻街头',
      image:
        'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=1400&q=88',
    },
  ];
  let activeHero = 0;

  function render() {
    if (root && root.children.length > 0) return;
    const path = pages[location.pathname] ? location.pathname : '/';
    if (protectedPages.includes(path) && !hasSession()) {
      fallbackNext = path;
      history.replaceState({}, '', '/login');
      stage.innerHTML = pages['/login'];
      updateNav('/login');
      return;
    }
    stage.innerHTML = pages[path];
    updateNav(path);
  }

  function updateNav(path) {
    const links = preview.querySelector('.nav-links');
    const action = preview.querySelector('.nav-action');
    const authed = hasSession();
    const items = authed
      ? [
          ['/', '首页'],
          ['/app', '今日行程'],
          ['/wardrobe', '我的衣柜'],
          ['/journal', '我的手记'],
          ['/profile', '个性画像'],
          ['/about', '作品说明'],
        ]
      : [
          ['/', '首页'],
          ['/about', '作品说明'],
        ];
    if (links) {
      links.innerHTML = items
        .map(([href, label]) => `<a class="${path === href ? 'is-current' : ''}" href="${href}">${label}</a>`)
        .join('');
    }
    if (action) {
      action.href = authed ? '/app' : '/login';
      action.textContent = authed ? '进入工作台' : '登录演示账号';
    }
  }

  function transitionTo(path) {
    const layer = document.getElementById('fallback-transition');
    const label = pageNames[path] || pageNames['/'];
    if (!layer) {
      history.pushState({}, '', path);
      render();
      return;
    }
    layer.querySelector('span').textContent = label.en;
    layer.querySelector('strong').textContent = label.cn;
    layer.className = 'transition-layer is-active cover';
    setTimeout(() => {
      history.pushState({}, '', path);
      render();
      scrollTo({ top: 0, behavior: 'auto' });
      layer.className = 'transition-layer is-active reveal';
    }, 560);
    setTimeout(() => {
      layer.className = 'transition-layer';
    }, 1320);
  }

  function rotateHero(direction) {
    const stack = preview.querySelector('.editorial-stack');
    if (!stack) return;
    activeHero = (activeHero + direction + heroSlides.length) % heroSlides.length;
    const slots = [
      { panel: stack.querySelector('.photo-panel.is-prev'), slide: heroSlides[(activeHero - 1 + heroSlides.length) % heroSlides.length] },
      { panel: stack.querySelector('.photo-panel.is-current'), slide: heroSlides[activeHero] },
      { panel: stack.querySelector('.photo-panel.is-next'), slide: heroSlides[(activeHero + 1) % heroSlides.length] },
    ];
    slots.forEach(({ panel, slide }, index) => {
      if (!panel) return;
      panel.style.setProperty('--image', `url("${slide.image}")`);
      panel.querySelector('span').textContent = String(index + 1).padStart(2, '0');
      panel.querySelector('strong').textContent = slide.title;
      panel.querySelector('small').textContent = slide.mood;
    });
  }

  preview.addEventListener('click', (event) => {
    const stackButton = event.target.closest('.stack-controls button');
    if (stackButton) {
      event.preventDefault();
      rotateHero(stackButton.getAttribute('aria-label') === '下一张' ? 1 : -1);
      return;
    }

    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      preview.querySelectorAll('[data-category]').forEach((button) => {
        button.classList.toggle('is-active', button === categoryButton);
      });
      const content = preview.querySelector('[data-wardrobe-content]');
      if (content) content.innerHTML = categoryDetail(categoryButton.dataset.category);
      return;
    }

    const categoryBack = event.target.closest('[data-category-back]');
    if (categoryBack) {
      preview.querySelectorAll('[data-category]').forEach((button) => {
        button.classList.remove('is-active');
      });
      const content = preview.querySelector('[data-wardrobe-content]');
      if (content) content.innerHTML = '<p class="wardrobe-empty-copy">选择一个分类，进入对应衣物内容。</p>';
      return;
    }

    const quizButton = event.target.closest('.quiz-options button');
    if (quizButton) {
      quizButton.classList.toggle('is-active');
      const tags = Array.from(preview.querySelectorAll('.quiz-options button.is-active'))
        .map((button) => button.textContent.trim())
        .concat(['春秋', '轻通勤']);
      const uniqueTags = Array.from(new Set(tags));
      const output = preview.querySelector('.generated-tags');
      if (output) output.innerHTML = uniqueTags.map((tag) => `<span>${tag}</span>`).join('');
      return;
    }

    const fallbackLogin = event.target.closest('[data-fallback-login]');
    if (fallbackLogin) {
      localStorage.setItem('yx-session', JSON.stringify({
        ok: true,
        token: 'fallback-demo-session',
        user: { id: 'demo', username: 'demo', name: '参赛演示账号' },
        source: 'static-fallback',
      }));
      localStorage.setItem('yx-user', '参赛演示账号');
      transitionTo(fallbackNext || '/app');
      return;
    }

    const link = event.target.closest('a[href^="/"]');
    if (!link) return;
    event.preventDefault();
    const path = link.getAttribute('href');
    if (path === location.pathname) return;
    if (protectedPages.includes(path) && !hasSession()) {
      fallbackNext = path;
      transitionTo('/login');
      return;
    }
    transitionTo(path);
  });

  addEventListener('popstate', render);
  setTimeout(render, 80);
})();
