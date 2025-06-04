// === Combined Script Start ===
function getCachedTimestampQuery(key = 'json_cache_ts') {
  const now = new Date();
  const last = localStorage.getItem(key);
  const pad = n => n.toString().padStart(2, '0');
  const currentStamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  
  if (!last || now.getTime() - new Date(last).getTime() > 3600 * 1000) {
    localStorage.setItem(key, now.toISOString()); // Save full ISO time
    return `?_cb=${currentStamp}`;
  }

  const lastDate = new Date(last);
  const lastStamp = `${lastDate.getFullYear()}${pad(lastDate.getMonth()+1)}${pad(lastDate.getDate())}-${pad(lastDate.getHours())}${pad(lastDate.getMinutes())}`;
  return `?_cb=${lastStamp}`;
}

// Loading overlay helper
const LoadingOverlay = (() => {
  let count = 0;
  let overlay;
  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = '#fff';
      overlay.style.zIndex = '9999';
    }
    if (!overlay.parentNode) {
      if (document.body) {
        document.body.appendChild(overlay);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (!overlay.parentNode) document.body.appendChild(overlay);
        });
      }
    }
  }
  function show() {
    ensureOverlay();
    overlay.style.display = 'block';
  }
  function hide() {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }
  function track(promise) {
    count++;
    show();
    return promise.finally(() => {
      count--;
      if (count === 0) hide();
    });
  }
  document.addEventListener('DOMContentLoaded', ensureOverlay);
  return { track };
})();

// Slideshow and Side Banners
(() => {
  LoadingOverlay.track(fetch('https://cdn.jsdelivr.net/gh/ippres/statics@main/top.json'+ getCachedTimestampQuery('top_json_ts')))
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      window.images_list = data.slideshow.map(item => ({
        url: item.imageUrl,
        alt: "",
        name: item.imagePath.split('/').pop(),
        link: item.link
      }));
      initSlideshow();
      updateSideBanners(data.sideBanner1, data.sideBanner2);
    })
    .catch(error => console.error('Error loading content:', error));

  function initSlideshow() {
    let slider_id = document.querySelector("#mainheaderslider");
    let images_div = "";
    for (let i = 0; i < window.images_list.length; i++) {
      let href = (window.images_list[i].link == "" ? "" : ' href="' + window.images_list[i].link + '"');
      images_div += `<a${href} class="hcg-slides"${i === 0 ? ' style="display:flex"' : ''}>
                      <img src="${window.images_list[i].url}" alt="${window.images_list[i].name}">
                    </a>`;
    }
    slider_id.querySelector(".hcg-slider-body").innerHTML = images_div;

    let slide_index = 0;
    const images = slider_id.querySelectorAll(".hcg-slides");

    function showSlides() {
      if (slide_index >= images.length) slide_index = 0;
      if (slide_index < 0) slide_index = images.length - 1;
      images.forEach((img, i) => {
        img.style.display = i === slide_index ? "flex" : "none";
      });
    }

    let autoPlay = setInterval(() => {
      slide_index++;
      showSlides();
    }, 5000);

    const prevButton = slider_id.parentElement.querySelector(".prev") || document.querySelector("#mainheaderslider .prev") || document.querySelector(".slider-arrow.prev");
    const nextButton = slider_id.parentElement.querySelector(".next") || document.querySelector("#mainheaderslider .next") || document.querySelector(".slider-arrow.next");

    if (prevButton) {
      prevButton.addEventListener("click", function(e) {
        e.preventDefault();
        slide_index--;
        showSlides();
        resetAutoPlay();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function(e) {
        e.preventDefault();
        slide_index++;
        showSlides();
        resetAutoPlay();
      });
    }

    function resetAutoPlay() {
      clearInterval(autoPlay);
      autoPlay = setInterval(() => {
        slide_index++;
        showSlides();
      }, 5000);
    }
  }

  function updateSideBanners(banner1Data, banner2Data) {
    const banner1Container = document.getElementById('right-banners-first-row');
    if (banner1Container) {
      const href1 = banner1Data.link || '';
      banner1Container.innerHTML = `<a href="${href1}"><img src="${banner1Data.imageUrl}" alt="" width="1000" height="264"></a>`;
    }
    const banner2Container = document.getElementById('right-banners-second-row');
    if (banner2Container) {
      const href2 = banner2Data.link || '';
      banner2Container.innerHTML = `<a href="${href2}"><img src="${banner2Data.imageUrl}" alt="" width="1000" height="264"></a>`;
    }
  }
})();

// Timers Setup
(() => {
  LoadingOverlay.track(fetch('https://cdn.jsdelivr.net/gh/ippres/statics@main/timers.json' + getCachedTimestampQuery('top_json_ts')))
    .then(response => response.json())
    .then(data => {
      setupTimers(data);
    })
    .catch(() => {
      setupTimers({
        timer1: { date: "2025-05-19", time: "03:13" },
        timer2: { date: "2025-05-11", time: "07:16" }
      });
    });

  function setupTimers(timerData) {
    const timers = [
      { idPrefix: "", data: timerData.timer1 },
      { idPrefix: "flash-", data: timerData.timer2 }
    ];
    timers.forEach(timer => {
      if (!timer.data) return;
      const [y, m, d] = timer.data.date.split('-').map(Number);
      const [h, min] = timer.data.time.split(':').map(Number);
      const targetTime = new Date(y, m - 1, d, h, min).getTime();

      function update() {
        const now = new Date().getTime();
        const diff = targetTime - now;
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const updateText = (id, val) => {
          const el = document.getElementById(timer.idPrefix + id);
          if (el) el.textContent = val.toString().padStart(2, '0');
        };

        if (diff <= 0) {
          ['hours', 'minutes', 'seconds'].forEach(id => updateText(id, '00'));
          const headline = document.querySelector('.countdown-card h2');
          if (headline && timer.idPrefix === '') headline.textContent = 'Sale Ended!';
          return;
        }

        updateText('hours', hours);
        updateText('minutes', minutes);
        updateText('seconds', seconds);
      }

      setInterval(update, 1000);
      update();
    });
  }
})();

// Middle Banner
document.addEventListener('DOMContentLoaded', () => {
  LoadingOverlay.track(fetch('https://cdn.jsdelivr.net/gh/ippres/statics/middle-banner.json' + getCachedTimestampQuery('top_json_ts')))
    .then(response => response.json())
    .then(data => {
      const bannerImg = document.querySelector('#middle-banner img');
      const bannerLink = document.querySelector('#middle-banner a');
      if (bannerImg) bannerImg.src = data.imageUrl;
      if (bannerLink) bannerLink.href = data.link;
    })
    .catch(error => console.error('Error updating banner:', error));
});

// Discover Section Banners
function updateBannersFromJSON() {
  LoadingOverlay.track(fetch('https://cdn.jsdelivr.net/gh/ippres/statics/three-banners.json' + getCachedTimestampQuery('top_json_ts')))
    .then(response => response.json())
    .then(bannerData => {
      const bannerContent = {
        banner1: { title: "Découvrez Nos Packs", description: "Economiser de l'argent<br>gagner plus d'articles.", buttonText: "Découvrir" },
        banner2: { title: "Nos Meilleurs Deals", description: "Vous êtes toujours gagnant<br>avec NEWA.", buttonText: "Découvrir" },
        banner3: { title: "Top Produit du Mois", description: "Profitez des meilleurs choix<br>de nos produits.", buttonText: "Découvrir" }
      };
      const discoverSection = document.querySelector('.discover-section');
      if (!discoverSection) return;
      discoverSection.innerHTML = '';
      Object.keys(bannerData).forEach(key => {
        if (key === 'sha') return;
        const b = bannerData[key], c = bannerContent[key];
        if (!b || !c) return;
        const a = document.createElement('a');
        a.className = 'discover-card';
        a.href = b.link;
        a.innerHTML = `<div class="discover-overlay"><h3>${c.title}</h3><p>${c.description}</p>${c.buttonText}</div>
                       <div class="discover-image" style="background-image: url('${b.imageUrl}');">&nbsp;</div>`;
        discoverSection.appendChild(a);
      });
    })
    .catch(error => console.error('Error updating discover banners:', error));
}
document.addEventListener('DOMContentLoaded', updateBannersFromJSON);

// Side Banner Class Updater
class BannerUpdater {
  constructor() {
    this.jsonUrl = 'https://cdn.jsdelivr.net/gh/ippres/statics/side-banners.json';
    this.bannerData = null;
  }
  async fetchBannerData() {
    try {
      const response = await LoadingOverlay.track(fetch(this.jsonUrl + getCachedTimestampQuery('top_json_ts')));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.bannerData = await response.json();
    } catch (error) {
      console.error('Error fetching banner data:', error);
    }
  }
  async updateAllBanners() {
    await this.fetchBannerData();
    if (!this.bannerData) return;

    const update = (selector, data, imgSelector, linkHandler) => {
      const container = document.querySelector(selector);
      if (container) {
        const img = container.querySelector(imgSelector);
        if (img) img.src = data.imageUrl;
        const btn = container.querySelector('.buy-now-button');
        if (btn && linkHandler) btn.onclick = () => window.location.href = data.link;
      }
    };
    update('.cerave-banner.top-right', this.bannerData.topRight, '.cerave-image', true);
    update('.cerave-banner.bottom-right', this.bannerData.bottomRight, '.cerave-image', true);

    const newaBanner = document.querySelector('.newa-banner');
    if (newaBanner && this.bannerData.middleLeft) {
      newaBanner.style.backgroundImage = `url('${this.bannerData.middleLeft.imageUrl}')`;
      ['.buy-now-link', '.learn-more-link'].forEach(sel => {
        const link = newaBanner.querySelector(sel);
        if (link) link.href = this.bannerData.middleLeft.link;
      });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const bannerUpdater = new BannerUpdater();
  bannerUpdater.updateAllBanners();
});

// === Combined Script End ===
