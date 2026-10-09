// ========================================
// PORTFOLIO MATHIAS FAVRE - MAIN SCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');

  /* ========================================
     1. GLOBAL UI & FIXES
     ======================================== */
     
  // --- PAGE TRANSITION ---
  setTimeout(() => body.classList.add('page-loaded'), 50);

  // --- HEADER SCROLL LOGIC ---
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (body.classList.contains('menu-open')) return;
    if (window.scrollY > lastScrollY && window.scrollY > 150) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastScrollY = window.scrollY;
  });

  // --- HAMBURGER MENU ---
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      body.classList.toggle('menu-open');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
    }
  });

  // --- FIX SAFARI: VIDEO AUTOPLAY & LOW POWER MODE ---
  const enforceVideoAutoplay = () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      
      // I video decorativi non devono mostrare controlli
      if (!video.hasAttribute('onmouseenter')) {
        video.removeAttribute('controls');
      }
      
      let playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.classList.add('low-power-blocked');
        });
      }
    });
  };

  // Esegue il fix all'avvio e se l'utente torna indietro (bfcache)
  setTimeout(enforceVideoAutoplay, 300);
  window.addEventListener('pageshow', enforceVideoAutoplay);

  // Risveglio magico: fa partire i video incastrati al primo tocco
  const wakeUpVideos = () => {
    const blockedVideos = document.querySelectorAll('video.low-power-blocked');
    blockedVideos.forEach(video => {
      video.play().then(() => {
        video.classList.remove('low-power-blocked');
      }).catch(() => {}); 
    });
  };

  document.body.addEventListener('click', wakeUpVideos, { once: true });
  document.body.addEventListener('touchstart', wakeUpVideos, { once: true });

  /* ========================================
     2. PAGE LOGIC: HOME
     ======================================== */
  const homeCircles = document.querySelectorAll('.home-circle');
  if (homeCircles.length > 0) {
    // Effetto Parallasse Gaze
    homeCircles.forEach(circle => {
      circle.addEventListener('mousemove', (e) => {
        const rect = circle.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15; 
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        circle.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
        circle.style.animationPlayState = 'paused'; 
      });
      circle.addEventListener('mouseleave', () => {
        circle.style.transform = '';
        circle.style.animationPlayState = 'running'; 
      });
    });
  }

  // Scroll sui click dei cerchi
  const aboutCircle = document.querySelector('.about-circle');
  const workCircle = document.querySelector('.work-circle');
  if (aboutCircle && document.querySelector('.about-intro')) {
      aboutCircle.addEventListener('click', () => document.querySelector('.about-intro').scrollIntoView({behavior: 'smooth'}));
  }
  if (workCircle && document.querySelector('.work-about')) {
      workCircle.addEventListener('click', () => document.querySelector('.work-about').scrollIntoView({behavior: 'smooth'}));
  }

  /* ========================================
     3. PAGE LOGIC: ABOUT
     ======================================== */
  if (document.querySelector('.about-bio')) {
    const alignAboutLabels = () => {
      const bioTextObj = document.querySelector('.bio-text');
      const labelsWrapper = document.querySelector('.about-labels-wrapper');
      const labelBio = document.querySelector('.about-label-bio');
      
      if (bioTextObj && labelsWrapper && labelBio) {
        const targetTop = bioTextObj.offsetHeight + 48; 
        const labelBioHeight = labelBio.offsetHeight;
        const offset = targetTop - labelBioHeight;
        labelsWrapper.style.setProperty('--social-offset', `${offset}px`);
      }
    };

    window.addEventListener('resize', alignAboutLabels);
    setTimeout(alignAboutLabels, 200); 
  }

  /* ========================================
     4. PAGE LOGIC: WORK GALLERY
     ======================================== */
  const workGallery = document.querySelector('.work-gallery');
  
  if (workGallery && !document.body.classList.contains('page-project')) {
    fetch('data/projects.json')
      .then(res => res.json())
      .then(projects => {
        workGallery.innerHTML = ''; 

        // Ordina i progetti
        projects.sort((a, b) => a.gallery_order - b.gallery_order);

        projects.forEach(project => {
          const isVideo = project.cover.match(/\.(webm|mp4)$/i);
          const mediaTag = isVideo 
            ? `<video src="assets/images/covers/${project.cover}" autoplay loop muted playsinline></video>` 
            : `<img src="assets/images/covers/${project.cover}" alt="${project.name}">`;

          const cardHtml = `
            <a href="project.html?id=${project.id}" class="project-card">
              <div class="project-cover">
                ${mediaTag}
                <div class="project-hover-tag type-data">${project.class} / ${project.year}</div>
              </div>
              <div class="project-info">
                <p class="project-text type-body">
                  ${project.name}<br>
                  <span class="project-caption">${project.caption}</span>
                </p>
              </div>
            </a>
          `;
          workGallery.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        // Aggiorna contatore
        const countEl = document.querySelector('.work-projects-count');
        if (countEl) countEl.innerText = `${projects.length} PROJECTS`;
        
        // Risveglia i video appena iniettati per Safari
        enforceVideoAutoplay();
      })
      .catch(err => console.error('Errore nel caricamento della galleria:', err));
  }

  /* ========================================
     5. PAGE LOGIC: PROJECT DETAIL
     ======================================== */
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (document.body.classList.contains('page-project') && projectId) {
    
    // --- Helper Generatore Media ---
    const getMediaTag = (img, pId) => {
      const folderMap = {
        '001': 'tonica', '002': 'nook', '003': 'worldmetro', '004': 'biomi', '005': 'bcs',
        '006': 'bergamo', '007': 'nutrizione', '008': 'licalbe', '009': 'studyflow'
      };
      
      const folder = folderMap[pId] || 'covers';
      const path = `assets/images/${folder}/${img.filename}`;
      const isVideo = img.filename.match(/\.(webm|mp4)$/i);
      // Regex per i video che devono mostrare i controlli in hover
      const isSpecialVideo = img.filename.match(/(bcs20|bcs21|ls17|nook13|tonica11|ber12)\.(webm|mp4)$/i);

      if (isVideo) {
        if (isSpecialVideo) {
          return `<video src="${path}" autoplay loop muted playsinline onmouseenter="this.setAttribute('controls', 'true')" onmouseleave="this.removeAttribute('controls')"></video>`;
        } else {
          return `<video src="${path}" autoplay loop muted playsinline></video>`;
        }
      } else {
        return `<img src="${path}" alt="${img.alt}">`;
      }
    };

    // --- Fetch & Popola Dati JSON ---
    Promise.all([
      fetch('data/projects.json').then(res => res.json()),
      fetch('data/projects_credits.json').then(res => res.json()),
      fetch('data/projects_images.json').then(res => res.json())
    ]).then(([projects, credits, images]) => {
      const project = projects.find(p => p.id === projectId);
      const projectCredits = credits.find(c => c.id === projectId);
      const projectImages = images.filter(i => i.id === projectId).sort((a, b) => a.order - b.order);

      if (!project) return;

      // Theme & Header Info
      document.body.setAttribute('data-project', project.id);
      document.title = project.name;
      document.getElementById('proj-name').innerHTML = project.name;
      document.getElementById('proj-class').innerHTML = project.class;
      document.getElementById('proj-year').innerHTML = project.year;
      document.getElementById('proj-caption').innerHTML = project.caption;

      // Hero Image
      const heroImg = projectImages.find(i => i.type === 0 || i.type === '00');
      if (heroImg) document.getElementById('proj-hero').innerHTML = getMediaTag(heroImg, projectId);

      // Gallery Images
      const galleryImages = projectImages.filter(i => i.type !== 0 && i.type !== '00');
      const galleryContainer = document.getElementById('proj-gallery');
      galleryImages.forEach(img => {
        const itemClass = img.type == 1 || img.type == '01' ? 'img-01' : 'img-02';
        galleryContainer.innerHTML += `<div class="gallery-item ${itemClass}">${getMediaTag(img, projectId)}</div>`;
      });

      // Description & Credits
      document.getElementById('proj-desc-text').innerHTML = project.description;
      if (projectCredits) {
        const creditsList = [
          { key: 'course', label: 'COURSE' }, { key: 'client', label: 'CLIENT' },
          { key: 'supervising_professor', label: 'SUPERVISING PROFESSOR' },
          { key: 'project_manager', label: 'PROJECT MANAGER' },
          { key: 'project_team', label: 'PROJECT TEAM' }, { key: 'typefaces', label: 'TYPEFACES' }
        ];

        const activeCredits = creditsList.filter(c => projectCredits[c.key] && projectCredits[c.key].trim() !== "");
        
        let col1 = [], col2 = [];
        if (activeCredits.length === 4) { col1 = activeCredits.slice(0, 2); col2 = activeCredits.slice(2, 4); }
        else if (activeCredits.length === 3) { col1 = activeCredits.slice(0, 2); col2 = activeCredits.slice(2, 3); }
        else if (activeCredits.length === 2) { col1 = activeCredits.slice(0, 1); col2 = activeCredits.slice(1, 2); }
        else if (activeCredits.length === 1) { col1 = activeCredits.slice(0, 1); }
        else {
           const half = Math.ceil(activeCredits.length / 2);
           col1 = activeCredits.slice(0, half); col2 = activeCredits.slice(half);
        }

        const buildColHtml = (items) => items.map(c => `
          <div class="credit-item">
            <h3 class="type-data credit-title">${c.label}</h3>
            <p class="type-body credit-value">${projectCredits[c.key]}</p>
          </div>
        `).join('');

        document.getElementById('proj-credits-col1').innerHTML = buildColHtml(col1);
        document.getElementById('proj-credits-col2').innerHTML = buildColHtml(col2);
      }

      enforceVideoAutoplay(); // Applica i fix Safari ai nuovi video inseriti

      // --- Toggle About Button ---
      const aboutBtn = document.getElementById('btn-about-project');
      const galleryWrapper = document.querySelector('.proj-gallery-wrapper');
      if (aboutBtn && galleryWrapper) {
        let isToggling = false; 
        aboutBtn.addEventListener('click', () => {
          if (isToggling) return; 
          isToggling = true;
          galleryWrapper.style.opacity = '0'; 
          setTimeout(() => {
            body.classList.toggle('desc-open'); 
            void galleryWrapper.offsetWidth; 
            galleryWrapper.style.opacity = '1'; 
            isToggling = false; 
          }, 200); 
        });
      }

      // --- Hero Click to Scroll ---
      const heroContainer = document.getElementById('proj-hero');
      if (heroContainer) {
          heroContainer.addEventListener('click', () => {
              const firstTitle = document.querySelector('.proj-info-wrapper');
              if (firstTitle) firstTitle.scrollIntoView({behavior: 'smooth', block: 'start'});
          });
      }

      // --- Intersection Observer (Fade-in Immagini) ---
      const projObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            projObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      setTimeout(() => {
        document.querySelectorAll('.gallery-item').forEach(el => projObserver.observe(el));
      }, 300);

      // --- Sticky Panel Math (Desktop Only) ---
      const descPanel = document.querySelector('.proj-desc-panel');
      let lastScrollY_sticky = window.scrollY;
      let stickyTop = 24 * 4; // 96px
      
      window.addEventListener('scroll', () => {
        if (!body.classList.contains('desc-open') || window.innerWidth <= 768) return;
        if (!descPanel) return;
        
        const scrollY = window.scrollY;
        const delta = scrollY - lastScrollY_sticky;
        lastScrollY_sticky = scrollY;
        
        const panelHeight = descPanel.offsetHeight;
        const vh = window.innerHeight;
        const headerOffset = 24 * 4; 
        
        if (panelHeight > vh - headerOffset) {
          if (delta > 0) { 
            stickyTop -= delta;
            const minTop = vh - panelHeight - 32; 
            stickyTop = Math.max(stickyTop, minTop);
          } else { 
            stickyTop -= delta;
            stickyTop = Math.min(stickyTop, headerOffset);
          }
          descPanel.style.top = `${stickyTop}px`;
        } else {
          descPanel.style.top = `${headerOffset}px`;
        }
      });

      // --- FONT TESTER (Tonica & Bergamo) ---
      if (projectId === '001' || projectId === '006') {
        const isTonica = projectId === '001';
        const fontName = isTonica ? 'Tonica' : 'BergamoDisplay';
        const weights = isTonica ? ['Light', 'Roman', 'Bold'] : ['Regular'];
        
        let style = document.createElement('style');
        weights.forEach(w => {
          let weightNum = w === 'Bold' ? 700 : (w === 'Light' ? 300 : 400);
          style.innerHTML += `@font-face { font-family: '${fontName}'; src: url('assets/fonts/${fontName}-${w}.woff2') format('woff2'); font-weight: ${weightNum}; font-display: block; }\n`;
        });
        document.head.appendChild(style);

        const weightOptions = weights.map(w => `<option value="${w}">${w}</option>`).join('');
        const testerHtml = `
          <section class="grid-container font-tester-section">
            <div class="font-tester-wrapper">
              <div class="font-tester-controls">
                ${isTonica ? `<select id="ft-weight" class="ft-select">${weightOptions}</select>` : `<div class="ft-static-weight">Regular</div>`}
                <div class="ft-control"><label>Size</label><input type="range" id="ft-size" min="10" max="200" value="80"><span id="ft-size-val">80</span></div>
                <div class="ft-control"><label>Leading</label><input type="range" id="ft-leading" min="0" max="20" value="10"><span id="ft-leading-val">10</span></div>
                <div class="ft-control"><label>Spacing</label><input type="range" id="ft-spacing" min="-20" max="20" value="0"><span id="ft-spacing-val">0</span></div>
              </div>
              <textarea id="ft-textarea" class="ft-textarea" maxlength="100" spellcheck="false">The quick brown fox jumps over the lazy dog.</textarea>
            </div>
          </section>`;

        const projGallery = document.querySelector('.proj-gallery-wrapper');
        projGallery.insertAdjacentHTML('afterend', testerHtml);

        const ftArea = document.getElementById('ft-textarea');
        const selWeight = document.getElementById('ft-weight');
        const inpSize = document.getElementById('ft-size');
        const inpLead = document.getElementById('ft-leading');
        const inpSpace = document.getElementById('ft-spacing');

        ftArea.style.fontFamily = `'${fontName}', sans-serif`;
        
        const updateFont = () => {
          if(selWeight) ftArea.style.fontWeight = selWeight.value === 'Bold' ? 700 : (selWeight.value === 'Light' ? 300 : 400);
          ftArea.style.fontSize = `${inpSize.value}px`;
          ftArea.style.lineHeight = `calc(${inpSize.value}px + ${inpLead.value}px)`;
          ftArea.style.letterSpacing = `${inpSpace.value}px`;
          
          document.getElementById('ft-size-val').innerText = inpSize.value;
          document.getElementById('ft-leading-val').innerText = inpLead.value;
          document.getElementById('ft-spacing-val').innerText = inpSpace.value;
        };

        const instantResize = () => {
          ftArea.style.transition = 'none'; 
          ftArea.style.height = 'auto';
          ftArea.style.height = ftArea.scrollHeight + 'px'; 
          requestAnimationFrame(() => {
            ftArea.style.transition = 'height var(--motion-normal) var(--ease-interaction), font-size 0.2s ease, letter-spacing 0.2s ease, line-height 0.2s ease';
          });
        };

        [inpSize, inpLead, inpSpace].forEach(inp => inp.addEventListener('input', () => { updateFont(); instantResize(); }));
        if(selWeight) selWeight.addEventListener('change', () => { updateFont(); instantResize(); });
        
        ftArea.addEventListener('input', () => {
            if(ftArea.value.length > 100) ftArea.value = ftArea.value.substring(0, 100);
            instantResize();
        });
        window.addEventListener('resize', instantResize);
        
        if (document.fonts) {
          document.fonts.ready.then(() => {
            updateFont();
            instantResize(); 
            setTimeout(instantResize, 300); 
          });
        } else {
          setTimeout(updateFont, 100); 
          setTimeout(instantResize, 500);
        }
      }
    });
  }
});