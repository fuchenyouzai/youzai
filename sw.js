const CACHE_NAME = 'youzaiblog-cache-v1';
// 新增offline.html到缓存列表，确保离线时可访问；补充静态资源缓存（如CSS/JS）
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html', // 核心：离线页面缓存，断网时展示
  // 若页面有单独的CSS/JS文件，需添加到此处（如/style.css、/script.js）
];

// 安装 SW：缓存关键资源，安装完成后强制激活
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW：开始缓存资源');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SW：资源缓存完成');
        return self.skipWaiting(); // 跳过等待，直接激活新SW（避免用户刷新）
      })
      .catch(err => {
        console.error('SW：资源缓存失败', err);
      })
  );
});

// 激活 SW：删除旧版本缓存，确保新缓存生效
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      // 批量删除非当前版本的缓存
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('SW：删除旧缓存', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('SW：激活完成，控制所有页面');
      return self.clients.claim(); // 让新SW控制已打开的所有页面
    })
  );
});

// 拦截请求：实现“缓存优先+网络兜底+离线返回offline.html”
self.addEventListener('fetch', event => {
  // 1. 忽略跨域请求（如第三方API、YouTube视频），避免缓存冲突
  if (!event.request.url.startsWith(self.location.origin)) {
    return event.respondWith(fetch(event.request));
  }

  // 2. 处理HTML请求：优先缓存，离线时返回offline.html
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedHtml => {
          // 缓存命中：返回缓存的HTML（如首页）
          if (cachedHtml) {
            // 后台异步请求网络，更新缓存（保证下次打开是最新内容）
            fetch(event.request)
              .then(networkHtml => {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, networkHtml.clone()));
              })
              .catch(() => console.log('SW：HTML网络更新失败（离线）'));
            return cachedHtml;
          }

          // 缓存未命中：请求网络
          return fetch(event.request)
            .then(networkHtml => {
              // 网络成功：更新缓存后返回
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, networkHtml.clone()));
              return networkHtml;
            })
            .catch(() => {
              // 网络失败（离线）：返回缓存的offline.html
              console.log('SW：离线状态，返回offline.html');
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 3. 处理非HTML请求（图片、音频、JS/CSS）：缓存优先，无缓存则网络请求
  event.respondWith(
    caches.match(event.request)
      .then(cachedRes => {
        // 缓存命中返回缓存，否则请求网络（失败则返回错误）
        return cachedRes || fetch(event.request)
          .then(networkRes => {
            // 网络成功：仅缓存GET请求（避免POST等非幂等请求冲突）
            if (event.request.method === 'GET' && networkRes.ok) {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, networkRes.clone()));
            }
            return networkRes;
          })
          .catch(() => {
            console.log('SW：非HTML资源加载失败（离线）');
            // 可返回默认图片（如加载失败占位图），需提前缓存
            // if (event.request.url.includes('img')) return caches.match('/default-img.png');
            return new Response('资源加载失败（离线状态）', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 监听消息：允许页面主动触发SW更新或清理缓存
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting(); // 页面触发SW激活
  } else if (event.data === 'deleteOldCaches') {
    // 页面触发清理旧缓存
    caches.keys().then(keyList => {
      keyList.forEach(key => {
        if (key !== CACHE_NAME) caches.delete(key);
      });
    });
  }
});
