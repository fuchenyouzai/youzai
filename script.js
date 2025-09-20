document.addEventListener('DOMContentLoaded', () => {
  // Gitalk 初始化
  const gitalkContainers = document.querySelectorAll('#gitalk-container');
  gitalkContainers.forEach(container => {
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
    gitalk.render(container);
  });

  // 图片点击放大
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.style.position='fixed';
      overlay.style.top=0;
      overlay.style.left=0;
      overlay.style.width='100%';
      overlay.style.height='100%';
      overlay.style.background='rgba(0,0,0,0.8)';
      overlay.style.display='flex';
      overlay.style.justifyContent='center';
      overlay.style.alignItems='center';
      overlay.style.cursor='pointer';
      overlay.innerHTML=`<img src="${img.src}" style="max-width:90%; max-height:90%; border-radius:5px;">`;
      overlay.addEventListener('click', ()=>document.body.removeChild(overlay));
      document.body.appendChild(overlay);
    });
  });

  // YouTube 视频墙示例
  const feedContainer = document.getElementById("youtube-feed");
  if(feedContainer){
    const videos = [
      {id:"ZB9QSD_SWmM", type:"shorts", title:"最新 Shorts 视频"},
      {id:"dQw4w9WgXcQ", type:"video", title:"示例视频 1"},
      {id:"oHg5SJYRHA0", type:"video", title:"示例视频 2"}
    ];
    videos.forEach(v=>{
      const wrapper=document.createElement("div");
      wrapper.style.display="flex";
      wrapper.style.flexDirection="column";
      wrapper.style.gap="5px";

      const iframeWrapper=document.createElement("div");
      iframeWrapper.style.position="relative";
      iframeWrapper.style.width="100%";
      iframeWrapper.style.height=0;
      iframeWrapper.style.overflow="hidden";
      iframeWrapper.style.borderRadius="5px";
      iframeWrapper.style.paddingBottom = v.type==="shorts" ? "177.78%" : "56.25%";
      iframeWrapper.innerHTML=`<iframe src="https://www.youtube.com/embed/${v.id}" title="${v.title}" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>`;

      const infoDiv=document.createElement("div");
      infoDiv.style.display="flex";
      infoDiv.style.flexDirection="column";
      infoDiv.style.alignItems="center";
      infoDiv.style.gap="5px";

      const titleEl=document.createElement("p");
      titleEl.textContent=v.title;
      titleEl.style.textAlign="center";
      titleEl.style.margin="0";
      titleEl.style.fontWeight="bold";
      titleEl.style.fontSize="14px";

      const btn=document.createElement("a");
      btn.href=`https://www.youtube.com/watch?v=${v.id}`;
      btn.target="_blank";
      btn.textContent="在 YouTube 上观看";
      btn.style.display="inline-block";
      btn.style.padding="5px 10px";
      btn.style.backgroundColor="#ff0000";
      btn.style.color="#fff";
      btn.style.borderRadius="4px";
      btn.style.fontSize="12px";
      btn.style.textDecoration="none";

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(btn);
      wrapper.appendChild(iframeWrapper);
      wrapper.appendChild(infoDiv);
      feedContainer.appendChild(wrapper);
    });
  }

  // PWA 注册
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
      .then(reg=>console.log('Service Worker 注册成功',reg.scope))
      .catch(err=>console.log('Service Worker 注册失败',err));
  }

  // 安装按钮逻辑
  const installBtn = document.getElementById('install-btn');
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
  });
  installBtn.addEventListener('click', async ()=>{
    if(!deferredPrompt){ alert("PWA 安装条件未满足或已安装"); return; }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
  });

  // 白天/夜晚模式
  const modeBtn=document.getElementById('mode-toggle-btn');
  modeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
    modeBtn.textContent=document.body.classList.contains('dark-mode') ? "☀️ 白天模式":"🌙 夜晚模式";
  });

  // 返回顶部按钮
  const backBtn=document.getElementById('back-top-btn-fixed');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY>300){ backBtn.style.display='block'; }
    else{ backBtn.style.display='none'; }
  });
  backBtn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
});