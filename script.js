document.addEventListener('DOMContentLoaded', () => {

  // ===== Gitalk 初始化（关于我页面用） =====
  const gitalkContainer = document.getElementById('gitalk-container');
  if (gitalkContainer) {
    const gitalk = new Gitalk({
      clientID: 'Ov23lijfU0G3M7jiMFAW',
      clientSecret: '47120dd1810d3a2a9aa0033211f5ee73ef29baa3',
      repo: 'youzai',
      owner: 'fuchenyouzai',
      admin: ['fuchenyouzai'],
      id: location.pathname,
      distractionFreeMode: false,
      language: 'zh-CN'
    });
    gitalk.render('gitalk-container');
  }

  // ===== Disqus 初始化（关于我页面用） =====
  if (document.getElementById('disqus_thread')) {
    (function() { 
      var d = document, s = d.createElement('script');
      s.src = 'https://youzaibolg.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
  }

  // ===== 图片点击放大 =====
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.8)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.cursor = 'pointer';
      overlay.innerHTML = `<img src="${img.src}" style="max-width:90%; max-height:90%; border-radius:5px;">`;
      overlay.addEventListener('click', () => document.body.removeChild(overlay));
      document.body.appendChild(overlay);
    });
  });

  // ===== PWA Service Worker 注册 =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('Service Worker 注册成功:', registration.scope))
      .catch(err => console.log('Service Worker 注册失败:', err));
  }

  // ===== 安装按钮 =====
  const installBtn = document.getElementById('install-btn');
  let deferredPrompt;
  const isEdge = /Edg/i.test(navigator.userAgent);
  const isChrome = /Chrome/i.test(navigator.userAgent) && !isEdge;

  if (isChrome) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });
  }

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (isChrome) {
        if (!deferredPrompt) { alert("PWA 安装条件未满足，或已安装"); return; }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else if (isEdge) {
        alert("请通过浏览器菜单（右上角 ⋮）选择“添加到桌面”来安装到手机或电脑桌面。");
      } else {
        alert("当前浏览器不支持自动安装，请使用 Chrome 或 Edge 浏览器。");
      }
    });
  }

  // ===== 返回顶部按钮 =====
  const backTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backTop.style.display = 'block';
    else backTop.style.display = 'none';
  });
  backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // ===== 夜晚/白天模式 =====
  const modeBtn = document.getElementById('mode-toggle-btn');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      modeBtn.textContent = document.body.classList.contains('dark-mode') ? "☀️ 白天模式" : "🌙 夜晚模式";
    });
  }

  // ===== YouTube Player API（直播页） =====
  let livePlayer;
  let soundOn = false;
  window.onYouTubeIframeAPIReady = function() {
    const liveEl = document.getElementById('live-player');
    if (!liveEl) return;
    livePlayer = new YT.Player('live-player', {
      videoId: 'fN9uYWCjQaw',
      playerVars: { autoplay: 1, mute: 1, controls: 1, modestbranding: 1 },
      events: { 'onReady': (event) => { event.target.mute(); } }
    });
  };

  // ===== 右下角声音按钮 =====
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (!livePlayer) return;
      if (soundOn) {
        livePlayer.mute();
        soundBtn.textContent = '🔊 打开声音';
        soundOn = false;
      } else {
        livePlayer.unMute();
        soundBtn.textContent = '🔇 关闭声音';
        soundOn = true;
      }
    });
  }

});