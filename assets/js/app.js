/* ---------------- i18n ---------------- */
const I18N = {
  zh: {
    navExplore:"作品", navMap:"足迹", navAbout:"关于",
    brandName:"yifan的摄影集",
    heroTop:"精选<br>合集",
    heroTitle:"yifan的摄影集", heroSub:"记录旅途中的光、色彩与瞬间。",
    mapTitle:"足迹", mapSub:"点击地图上的坐标点，查看该地作品",
    exploreTitle:"全部作品", exploreSub:"按年份 / 地点 / 风格筛选",
    all:"全部", style:"风格",
    galleryLeft:"全部照片", galleryCenter:"摄影 · 旅途 · 札记",
    navVideo:"视频", videoTitle:"视频", videoSub:"独立创作与合作项目", videoComingSoon:"视频文件准备中",
    speedLabel:"速度", shuffle:"⟲ 换一批", nextPage:"下一页",
    aboutTitle:"关于", aboutText:"摄影是我记录世界的方式。这里收录了这几年在旅途与日常中拍下的画面。",
    footer:"版权所有",
  },
  en: {
    navExplore:"Work", navMap:"Journey", navAbout:"About",
    brandName:"Yifan\u2019s Photography",
    heroTop:"Featured<br>Set",
    heroTitle:"Yifan\u2019s Photography", heroSub:"Fragments of light, color and moments collected along the way.",
    mapTitle:"Journey", mapSub:"Click a point on the map to explore photos from there",
    exploreTitle:"All Work", exploreSub:"Filter by year / place / style",
    all:"All", style:"Style",
    galleryLeft:"All Photos", galleryCenter:"Photography · Travel · Notes",
    navVideo:"Video", videoTitle:"Video", videoSub:"Independent & collaborative projects", videoComingSoon:"Video file coming soon",
    speedLabel:"Speed", shuffle:"⟲ Shuffle", nextPage:"Next",
    aboutTitle:"About", aboutText:"Photography is how I keep record of the world — moments from years of travel and everyday life.",
    footer:"All rights reserved",
  }
};
let LANG = "en";
function t(k){ return I18N[LANG][k]; }
function regionLabel(p){ return LANG === "zh" ? p.region_cn : p.region_en; }

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(I18N[LANG][key] !== undefined) el.innerHTML = I18N[LANG][key];
  });
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.title = t("brandName");
  document.getElementById("langCN").classList.toggle("dim", LANG !== "zh");
  document.getElementById("langEN").classList.toggle("dim", LANG !== "en");
  renderFilters();
  renderGallery();
  refreshCarouselCaptions();
  refreshMapLabels();
  refreshVideoGrid();
}
document.getElementById("langToggle").addEventListener("click", ()=>{
  LANG = LANG === "zh" ? "en" : "zh";
  applyI18n();
});

/* ---------------- Scroll reveal ---------------- */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); revealObserver.unobserve(e.target); } });
}, {threshold:.12});
document.querySelectorAll(".reveal").forEach(el=> revealObserver.observe(el));

/* ---------------- Hero carousel (kept from last round — this one worked) ---------------- */
let carouselPhotos = [];
let carouselAngle = 0;
let carouselPaused = false;

function buildCarousel(shuffleMode){
  const ring = document.getElementById("carouselRing");
  const pool = PHOTOS.filter(p=>p.kind==="location" && (Math.max(p.w,p.h)/Math.min(p.w,p.h)) <= 1.4);
  carouselPhotos = [];
  if(shuffleMode){
    const shuffled = [...pool].sort(()=> Math.random()-0.5);
    carouselPhotos = shuffled.slice(0, Math.min(24, shuffled.length));
  } else {
    const step = Math.max(1, Math.floor(pool.length / 24));
    for(let i=0; i<pool.length && carouselPhotos.length<24; i+=step) carouselPhotos.push(pool[i]);
  }

  const n = carouselPhotos.length;
  // mobile uses the exact same 3D geometry as desktop, just uniformly scaled down —
  // this keeps photos from overlapping (a proportional scale can't break spacing)
  const isMobile = window.innerWidth <= 640;
  const scale = isMobile ? 0.4 : 1;
  const radius = 460 * scale;
  const baseSizes = [{w:132,h:174}, {w:96,h:126}, {w:114,h:150}, {w:84,h:112}];
  const sizeCycle = baseSizes.map(s=>({w:Math.round(s.w*scale), h:Math.round(s.h*scale)}));
  const baseY = [-26, 18, -8, 32, -34, 6];
  const yCycle = baseY.map(y=>Math.round(y*scale));

  ring.innerHTML = "";
  carouselPhotos.forEach((p,i)=>{
    const angle = (360/n) * i;
    const sz = sizeCycle[i % sizeCycle.length];
    const yOff = yCycle[i % yCycle.length];
    const card = document.createElement("div");
    card.className = "carousel-card";
    card.style.width = sz.w+"px";
    card.style.height = sz.h+"px";
    card.style.left = (-sz.w/2)+"px";
    card.style.top = (-sz.h/2)+"px";
    card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px) translateY(${yOff}px)`;
    card.innerHTML = `<div class="cc-inner"><img src="assets/img/thumb/${p.id}.jpg" loading="lazy" alt="">
      <div class="carousel-cap">${regionLabel(p)}</div></div>`;
    card.addEventListener("click", ()=> openLightboxFrom(carouselPhotos, i));
    ring.appendChild(card);
  });

  document.getElementById("heroThumb").src = `assets/img/thumb/${carouselPhotos[0].id}.jpg`;
  applyCarouselAngle();
}
function applyCarouselAngle(){
  document.getElementById("carouselRing").style.transform = `rotateX(-16deg) rotateY(${carouselAngle}deg)`;
}
function startCarouselLoop(){
  const step = ()=>{
    if(!carouselPaused){ carouselAngle += carouselSpeed; applyCarouselAngle(); }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function refreshCarouselCaptions(){
  document.querySelectorAll(".carousel-card").forEach((card,i)=>{
    const cap = card.querySelector(".carousel-cap");
    if(cap && carouselPhotos[i]) cap.textContent = regionLabel(carouselPhotos[i]);
  });
}
const carouselStage = document.querySelector(".carousel-stage");
carouselStage.addEventListener("mouseenter", ()=> carouselPaused = true);
carouselStage.addEventListener("mouseleave", ()=>{ carouselPaused = false; tiltTarget = {x:0,y:0}; });

let tiltTarget = {x:0,y:0};
let tiltCurrent = {x:0,y:0};
carouselStage.addEventListener("mousemove", (e)=>{
  const r = carouselStage.getBoundingClientRect();
  const nx = ((e.clientX - r.left)/r.width - 0.5) * 2;
  const ny = ((e.clientY - r.top)/r.height - 0.5) * 2;
  tiltTarget = {x: ny*-8, y: nx*10};
});
(function tiltLoop(){
  tiltCurrent.x += (tiltTarget.x - tiltCurrent.x)*0.08;
  tiltCurrent.y += (tiltTarget.y - tiltCurrent.y)*0.08;
  const el = document.getElementById("carouselTilt");
  if(el) el.style.transform = `rotateX(${tiltCurrent.x}deg) rotateY(${tiltCurrent.y}deg)`;
  requestAnimationFrame(tiltLoop);
})();

let carouselSpeed = 0.1;
const speedSlider = document.getElementById("speedSlider");
const speedPct = document.getElementById("speedPct");
function updateSpeedFromSlider(){
  const pct = parseInt(speedSlider.value, 10);
  speedPct.textContent = pct + "%";
  carouselSpeed = 0.02 + (pct/100) * (0.35 - 0.02);
}
speedSlider.addEventListener("input", updateSpeedFromSlider);
updateSpeedFromSlider();
let carouselShuffleState = false;
document.getElementById("shuffleBtn").addEventListener("click", ()=>{
  carouselShuffleState = true;
  buildCarousel(true);
});
let carouselResizeTimer;
let carouselWasMobile = window.innerWidth <= 640;
window.addEventListener("resize", ()=>{
  clearTimeout(carouselResizeTimer);
  carouselResizeTimer = setTimeout(()=>{
    const nowMobile = window.innerWidth <= 640;
    if(nowMobile !== carouselWasMobile){
      carouselWasMobile = nowMobile;
      buildCarousel(carouselShuffleState);
    }
  }, 300);
});

/* ---------------- Filters ---------------- */
const YEARS = ["2021","2022","2023","2024","2025","2026"];
let activeYear = "all";
let activeRegion = "all";

function renderFilters(){
  const yearRow = document.getElementById("yearFilters");
  const regionRow = document.getElementById("regionFilters");
  yearRow.innerHTML = ""; regionRow.innerHTML = "";

  const mk = (label, active, fn)=>{
    const c = document.createElement("div");
    c.className = "chip" + (active?" active":"");
    c.textContent = label; c.onclick = fn;
    return c;
  };
  yearRow.appendChild(mk(t("all"), activeYear==="all", ()=>{activeYear="all";activeRegion="all";currentPage=1;renderFilters();renderGallery();}));
  YEARS.forEach(y=>{
    if(!PHOTOS.some(p=>p.year===y)) return;
    yearRow.appendChild(mk(y, activeYear===y, ()=>{activeYear=y;activeRegion="all";currentPage=1;renderFilters();renderGallery();}));
  });
  yearRow.appendChild(mk(t("style"), activeYear==="style", ()=>{activeYear="style";activeRegion="all";currentPage=1;renderFilters();renderGallery();}));

  let pool = PHOTOS;
  if(activeYear==="style") pool = PHOTOS.filter(p=>p.kind==="style");
  else if(activeYear!=="all") pool = PHOTOS.filter(p=>p.year===activeYear);
  const regions = [...new Set(pool.map(p=>p.region_cn))];
  if(regions.length>1){
    regionRow.appendChild(mk(t("all"), activeRegion==="all", ()=>{activeRegion="all";currentPage=1;renderFilters();renderGallery();}));
    regions.forEach(r=>{
      const sample = pool.find(p=>p.region_cn===r);
      regionRow.appendChild(mk(LANG==="zh"?r:sample.region_en, activeRegion===r, ()=>{activeRegion=r;currentPage=1;renderFilters();renderGallery();}));
    });
  }
}

function setRegionFilter(region_cn){
  activeYear = "all";
  activeRegion = region_cn;
  currentPage = 1;
  renderFilters();
  renderGallery();
  document.getElementById("explore-head").scrollIntoView({behavior:"smooth", block:"start"});
}

/* ---------------- Gallery: clean uniform grid, paginated ---------------- */
let currentList = [];
let currentPage = 1;
const PAGE_SIZE = 25;

function getFiltered(){
  let pool = PHOTOS;
  if(activeYear==="style") pool = pool.filter(p=>p.kind==="style");
  else if(activeYear!=="all") pool = pool.filter(p=>p.year===activeYear);
  if(activeRegion!=="all") pool = pool.filter(p=>p.region_cn===activeRegion);
  return pool;
}

let lastGalleryPageItems = null, lastGalleryStart = 0;

function renderGallery(){
  const grid = document.getElementById("gallery");
  currentList = getFiltered();
  document.getElementById("galleryCount").textContent = `${currentList.length} ${LANG==="zh"?"张":"photos"}`;

  if(currentList.length===0){
    grid.innerHTML = `<div class="empty-msg">--</div>`;
    lastGalleryPageItems = null;
    renderPagination(0);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage-1) * PAGE_SIZE;
  const pageItems = currentList.slice(start, start + PAGE_SIZE);
  lastGalleryPageItems = pageItems;
  lastGalleryStart = start;

  buildJustifiedGallery();
  renderPagination(totalPages);
}

// Justified-row layout (like a photo-album contact sheet): each row is filled
// edge-to-edge, every photo's own width/height ratio decides how much space it
// takes, and every image in a row shares the exact same height — so nothing
// ever overlaps or drifts out of alignment regardless of photo orientation.
function buildJustifiedGallery(){
  const grid = document.getElementById("gallery");
  if(!lastGalleryPageItems) return;
  const items = lastGalleryPageItems;
  const start = lastGalleryStart;

  // clientWidth includes the element's own left/right padding, but children lay
  // out inside the content box only — subtract padding or rows run past the edge
  const cs = getComputedStyle(grid);
  const containerWidth = grid.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if(!containerWidth) return;
  const gap = containerWidth < 640 ? 10 : 18;
  const aimHeight = containerWidth < 640 ? 130 : containerWidth < 900 ? 170 : 230;

  grid.innerHTML = "";

  let row = [];
  let rowAspectSum = 0;

  const flushRow = (stretch)=>{
    if(!row.length) return;
    const n = row.length;
    const naturalH = (containerWidth - (n-1)*gap) / rowAspectSum;
    // a trailing row with very few/narrow photos would need to blow up huge to
    // fill the full width — cap how far we stretch it, and center the row
    // instead so any leftover space reads as intentional, not a missing photo
    const h = stretch ? Math.min(naturalH, aimHeight*1.6) : Math.min(aimHeight, naturalH);
    const rowEl = document.createElement("div");
    rowEl.className = "g-row";
    // round each item's width, then correct the rounding drift on the last item
    // so the row's total width never exceeds the container (and never overflows)
    const widths = row.map(({a})=> Math.round(h*a));
    const targetTotal = (stretch && h===naturalH) ? Math.round(containerWidth - (n-1)*gap) : null;
    if(targetTotal !== null){
      const drift = targetTotal - widths.reduce((s,w)=>s+w,0);
      widths[widths.length-1] += drift;
    }
    row.forEach(({p, a, globalIndex}, idx)=>{
      const w = widths[idx];
      const num = p.id.replace(/^p/,"");
      const item = document.createElement("div");
      item.className = "g-item";
      item.style.width = w+"px";
      // only the image box gets the fixed row height — the caption sits below
      // it at its own natural height, so image tops AND bottoms stay aligned
      // across every item in the row regardless of caption line-wrapping
      item.innerHTML = `<div class="imgwrap" style="height:${h}px"><img src="assets/img/thumb/${p.id}.jpg" loading="lazy" alt="${regionLabel(p)}"></div>
        <div class="g-cap"><div class="name">${regionLabel(p)}</div><div class="num">#${num}${p.year? " · "+p.year:""}</div></div>`;
      item.addEventListener("click", ()=> openLightboxFrom(currentList, globalIndex));
      rowEl.appendChild(item);
    });
    grid.appendChild(rowEl);
    row = []; rowAspectSum = 0;
  };

  items.forEach((p,i)=>{
    const a = Math.max(0.55, Math.min(2.2, p.w/p.h)); // clamp extreme ratios so no single photo dominates a row
    row.push({p, a, globalIndex: start+i});
    rowAspectSum += a;
    const naturalWidth = rowAspectSum*aimHeight + (row.length-1)*gap;
    if(naturalWidth >= containerWidth) flushRow(true);
  });
  flushRow(true); // trailing partial row: stretch (capped) + centered, so it never leaves a bare gap
}

let galleryResizeTimer;
window.addEventListener("resize", ()=>{
  clearTimeout(galleryResizeTimer);
  galleryResizeTimer = setTimeout(()=>{ if(lastGalleryPageItems) buildJustifiedGallery(); }, 200);
});

function renderPagination(totalPages){
  const bar = document.getElementById("pagination");
  bar.innerHTML = "";
  if(totalPages <= 1) return;

  for(let i=1; i<=totalPages; i++){
    const b = document.createElement("div");
    b.className = "page-btn" + (i===currentPage ? " active" : "");
    b.textContent = i;
    b.onclick = ()=>{
      if(i===currentPage) return;
      currentPage = i;
      renderGallery();
      document.getElementById("explore-head").scrollIntoView({behavior:"smooth", block:"start"});
    };
    bar.appendChild(b);
  }

  const next = document.createElement("div");
  next.className = "page-btn" + (currentPage>=totalPages ? " disabled" : "");
  next.textContent = t("nextPage");
  next.onclick = ()=>{
    if(currentPage>=totalPages) return;
    currentPage++;
    renderGallery();
    document.getElementById("explore-head").scrollIntoView({behavior:"smooth", block:"start"});
  };
  bar.appendChild(next);

  const info = document.createElement("div");
  info.className = "page-info";
  info.textContent = `${currentPage} / ${totalPages}`;
  bar.appendChild(info);
}

/* ---------------- Lightbox ---------------- */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
let lbIndex = 0, lbSource = PHOTOS;
function openLightboxFrom(source, i){ lbSource = source; lbIndex = i; showLightbox(); }
const lbPalette = document.getElementById("lbPalette");
function showLightbox(){
  const p = lbSource[lbIndex];
  lbImg.src = `assets/img/full/${p.id}.jpg`;
  lbCap.textContent = `${regionLabel(p)}${p.year? " · "+p.year:""}`;
  lbPalette.innerHTML = "";
  const pal = p.palette && p.palette.length ? p.palette : [{c:p.color, p:100}];
  pal.forEach(sw=>{
    const seg = document.createElement("div");
    seg.className = "swatch-seg";
    seg.style.background = sw.c;
    seg.style.flex = sw.p;
    seg.title = `${sw.c} · ${sw.p}%`;
    lbPalette.appendChild(seg);
  });
  lb.classList.add("open");
}
document.getElementById("lbClose").onclick = ()=> lb.classList.remove("open");
lb.addEventListener("click",(e)=>{ if(e.target===lb) lb.classList.remove("open"); });
document.getElementById("lbPrev").onclick = ()=>{ lbIndex=(lbIndex-1+lbSource.length)%lbSource.length; showLightbox(); };
document.getElementById("lbNext").onclick = ()=>{ lbIndex=(lbIndex+1)%lbSource.length; showLightbox(); };
document.addEventListener("keydown",(e)=>{
  if(!lb.classList.contains("open")) return;
  if(e.key==="Escape") lb.classList.remove("open");
  if(e.key==="ArrowLeft") document.getElementById("lbPrev").click();
  if(e.key==="ArrowRight") document.getElementById("lbNext").click();
});

/* ---------------- Video showcase ---------------- */
const VIDEOS = [
  {
    file: "1.mp4",
    title: {zh:"HBN广告", en:"HBN — Brand Film"},
    desc: {
      zh: "独立制作脚本与剪辑“HBN”宣传广告，以呼吸贯穿整个视频，以树叶的呼吸、小虫的呼吸等等引出“皮肤的呼吸”，通过自然场景变换以及自然概念传递品牌价值观，赋予女性“自然的力量”。",
      en: "Independently scripted and edited the HBN brand film. The video is threaded together by the idea of breath — the breathing of a leaf, an insect — building up to “the skin's breath.” Through shifting natural scenes and the concept of nature, it conveys the brand's values, giving women a sense of natural strength."
    }
  },
  {
    file: "2.mp4",
    title: {zh:"Mirror Lake", en:"Mirror Lake"},
    desc: {
      zh: "Mirror Lake 是一部原创AI动画短片，以童话叙事为载体，讲述一个孩子在镜中世界逐渐迷失自我、最终回归现实的故事。影片将经典童话元素与生成式AI时代的社会议题相结合，通过富有隐喻的角色、场景与视觉语言，探讨AI如何影响人类的情感认同、自我认知与现实判断。作品采用AI辅助动画制作流程，融合原创剧本、角色设计、场景构建与后期剪辑，呈现出兼具童话美学与现实批判的叙事体验。",
      en: "Mirror Lake is an original AI-animated short film told through a fairy-tale narrative: a child gradually loses themselves in a mirror world and eventually returns to reality. The film blends classic fairy-tale elements with the social questions of the generative-AI era, using metaphorical characters, settings and visual language to explore how AI affects human emotional identity, self-perception and judgment of reality. Made with an AI-assisted animation pipeline — original script, character design, scene building and post-production — it offers a narrative that is both fairy-tale aesthetic and real-world critique."
    }
  },
  {
    file: "3.mp4",
    title: {zh:"岩石时钟", en:"Rock Clock"},
    desc: {
      zh: "“岩石时钟”概念书籍设计：以地球46亿年的历史为基础，岩石的一天相当于人类的1259年。本书籍从岩石的“时间观念”看地球，从新的计数方式看世界，把地球时钟分为十二个刻度，图案化不同时期石头的自然属性和化学特点。展示自然之下，人类何其渺小。",
      en: "A concept book themed around Earth's 4.6-billion-year history: one “day” in rock time equals 1,259 human years. The book looks at Earth through the sense of time held by rocks, proposing a new way of measuring the world. It divides the Earth's clock into twelve markings, visualizing the natural and chemical properties of stones from different eras — a reminder of how small humanity is beneath nature."
    }
  },
  {
    file: "4.mp4",
    title: {zh:"电子孤岛", en:"Electronic Island"},
    desc: {
      zh: "科技发展初期，厚重的大电视承载着无数家庭的共同记忆。随着科技发展，电子产品越来越便携，人和人之间的距离也被网络和屏幕隔开。这样温情的家庭时刻，如同笨重的电视一样埋藏在一代人的记忆里，形成一个“电子孤岛”。",
      en: "In the early days of technology, the bulky television held the shared memories of countless families. As technology advanced and devices became portable, screens and networks placed distance between people. Those warm family moments, like the heavy old television itself, have been buried in a generation's memory — forming an “electronic island.”"
    }
  },
  {
    file: "5.mp4",
    title: {zh:"2022–2024 摄影合集", en:"2022–2024 Photo Compilation"},
    desc: {
      zh: "收集了自己2022-2024拍摄的作品再设计，重新剪辑，形成的一支视频。",
      en: "A collection of my own photography from 2022–2024, re-edited and reassembled into a video."
    }
  }
];

function makePanel(v,i){
  const panel = document.createElement("div");
  panel.className = "video-panel";
  panel.innerHTML = `
    <img src="assets/img/video_poster/${i+1}.jpg" alt="${v.title[LANG]}" loading="lazy" draggable="false">
    <div class="vp-overlay"><div class="vp-play"></div></div>
    <div class="vp-title">${v.title[LANG]}</div>`;
  panel.addEventListener("click", ()=> openVideoLightbox(i));
  return panel;
}
function buildVideoGrid(){
  const track = document.getElementById("videoCarouselTrack");
  if(!track) return;
  track.innerHTML = "";
  // duplicate the list once so the marquee can loop seamlessly (translateX -50%)
  VIDEOS.forEach((v,i)=> track.appendChild(makePanel(v,i)));
  VIDEOS.forEach((v,i)=> track.appendChild(makePanel(v,i)));
  measureVideoTrack();
}

// ---- auto-scroll + drag-to-scroll for the video marquee ----
let vTrackPos = 0;
let vHalfWidth = 0;
let vHoverPaused = false;
let vDragging = false;
let vDragMoved = false;
let vDragStartX = 0;
let vDragStartPos = 0;
const vAutoSpeed = 0.45;

function measureVideoTrack(){
  const track = document.getElementById("videoCarouselTrack");
  if(!track) return;
  vHalfWidth = track.scrollWidth / 2;
}
function applyVideoTrackPos(){
  const track = document.getElementById("videoCarouselTrack");
  if(!track || !vHalfWidth) return;
  if(vTrackPos <= -vHalfWidth) vTrackPos += vHalfWidth;
  if(vTrackPos > 0) vTrackPos -= vHalfWidth;
  track.style.transform = `translateX(${vTrackPos}px)`;
}
function startVideoMarquee(){
  const step = ()=>{
    if(!vDragging && !vHoverPaused && vHalfWidth){ vTrackPos -= vAutoSpeed; applyVideoTrackPos(); }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const videoStage = document.querySelector(".video-carousel-stage");
if(videoStage){
  videoStage.addEventListener("mouseenter", ()=> vHoverPaused = true);
  videoStage.addEventListener("mouseleave", ()=> vHoverPaused = false);
  videoStage.addEventListener("pointerdown", (e)=>{
    vDragging = true; vDragMoved = false;
    vDragStartX = e.clientX; vDragStartPos = vTrackPos;
    videoStage.classList.add("dragging");
    // don't capture the pointer here — capturing on every mousedown redirects the
    // later click event's target to videoStage instead of the panel that was
    // actually clicked, which silently breaks click-to-open on desktop.
  });
  videoStage.addEventListener("dragstart", (e)=> e.preventDefault());
  videoStage.addEventListener("pointermove", (e)=>{
    if(!vDragging) return;
    const dx = e.clientX - vDragStartX;
    if(Math.abs(dx) > 4){
      vDragMoved = true;
      e.preventDefault();
    }
    vTrackPos = vDragStartPos + dx;
    applyVideoTrackPos();
  });
  const endVideoDrag = ()=>{ vDragging = false; videoStage.classList.remove("dragging"); };
  videoStage.addEventListener("pointerup", endVideoDrag);
  videoStage.addEventListener("pointercancel", endVideoDrag);
  // suppress the click-to-open-lightbox when the pointerdown was actually a drag
  videoStage.addEventListener("click", (e)=>{ if(vDragMoved){ e.stopPropagation(); e.preventDefault(); } }, true);
  window.addEventListener("resize", measureVideoTrack);
}

function refreshVideoGrid(){
  const n = VIDEOS.length;
  document.querySelectorAll(".video-panel").forEach((panel,idx)=>{
    const v = VIDEOS[idx % n];
    if(!v) return;
    panel.querySelector(".vp-title").textContent = v.title[LANG];
    panel.querySelector("img").alt = v.title[LANG];
  });
}

const vlb = document.getElementById("videoLightbox");
function openVideoLightbox(i){
  const v = VIDEOS[i];
  document.getElementById("vlbTitle").textContent = v.title[LANG];
  document.getElementById("vlbDesc").textContent = v.desc[LANG];
  const player = document.getElementById("vlbPlayer");
  const src = `assets/video/${v.file}`;
  player.innerHTML = `<video controls autoplay playsinline preload="auto" src="${src}"></video>`;
  const vidEl = player.querySelector("video");
  vidEl.onerror = ()=>{
    player.innerHTML = `<div class="vlb-empty">${t("videoComingSoon")}</div>`;
  };
  vlb.classList.add("open");
  const playPromise = vidEl.play();
  if(playPromise && playPromise.catch){
    playPromise.catch(()=>{
      // autoplay with sound was blocked — retry muted so playback still starts
      vidEl.muted = true;
      vidEl.play().catch(()=>{});
    });
  }
}
document.getElementById("vlbClose").addEventListener("click", ()=> {
  vlb.classList.remove("open");
  document.getElementById("vlbPlayer").innerHTML = "";
});
vlb.addEventListener("click",(e)=>{ if(e.target===vlb){ vlb.classList.remove("open"); document.getElementById("vlbPlayer").innerHTML=""; } });

/* ---------------- Map (real landmass + collage-style photo pins) ---------------- */
let mapEntries = [];
let mapProjection = null;
const MAP_W = 960, MAP_H = 560;

function buildMap(){
  const svg = d3.select("#mapSvg").attr("viewBox", `0 0 ${MAP_W} ${MAP_H}`);

  // fixed whole-world projection — the full map always exists, we just start zoomed in
  const projection = d3.geoNaturalEarth1().fitSize([MAP_W, MAP_H], {type:"Sphere"});
  mapProjection = projection;
  const path = d3.geoPath(projection);

  const counts = {}, bestPhoto = {};
  PHOTOS.forEach(p=>{
    if(!REGION_GEO[p.region_cn]) return;
    counts[p.region_cn] = (counts[p.region_cn]||0)+1;
    if(!bestPhoto[p.region_cn] || (p.w*p.h) > (bestPhoto[p.region_cn].w*bestPhoto[p.region_cn].h)) bestPhoto[p.region_cn]=p;
  });
  mapEntries = Object.keys(counts).map(r=>({
    region:r, count:counts[r], coord:REGION_GEO[r], photo:bestPhoto[r]
  }));
  mapEntries.forEach(e=>{
    const px = projection(e.coord);
    e.px = px[0]; e.py = px[1];
    e.xPct = (px[0]/MAP_W)*100;
    e.yPct = (px[1]/MAP_H)*100;
  });

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world=>{
    const countries = topojson.feature(world, world.objects.countries);
    svg.append("g").selectAll("path.land")
      .data(countries.features).join("path")
      .attr("class","land").attr("d", path);
  }).catch(()=>{ /* map still works without landmass if this fails */ });

  renderMapPins();
  setupMapZoom();
}
function renderMapPins(){
  const container = document.getElementById("mapPins");
  container.innerHTML = "";
  mapEntries
    .sort((a,b)=> a.count-b.count)
    .forEach(e=>{
      const el = document.createElement("div");
      el.className = "map-pin";
      el.style.left = e.xPct + "%";
      el.style.top = e.yPct + "%";
      const label = LANG==="zh" ? e.region : (e.photo.region_en || e.region);
      el.innerHTML = `
        <div class="pin-photo">
          <img src="assets/img/thumb/${e.photo.id}.jpg" loading="lazy" alt="${label}">
          <div class="pin-badge">${e.count}</div>
        </div>
        <div class="pin-tail"></div>
        <div class="pin-label">${label}</div>`;
      el.addEventListener("click", ()=> setRegionFilter(e.region));
      container.appendChild(el);
    });
}
function refreshMapLabels(){
  if(mapEntries.length) renderMapPins();
}

/* ---------- Map zoom (real d3-zoom: wheel/drag + buttons, full world reachable) ---------- */
let mapZoomBehavior = null;
function setupMapZoom(){
  const containerSel = d3.select("#mapContainer");
  const inner = document.getElementById("mapInner");

  mapZoomBehavior = d3.zoom()
    .scaleExtent([1, 6])
    .on("zoom", (event)=>{
      const {x,y,k} = event.transform;
      inner.style.transform = `translate(${x}px,${y}px) scale(${k})`;
    });

  containerSel.call(mapZoomBehavior);

  // initial view: a broad overview showing every pin at once, not zoomed into a
  // cluster — user can still scroll/drag/use +/- to zoom in on any region
  if(mapEntries.length){
    const xs = mapEntries.map(e=>e.px), ys = mapEntries.map(e=>e.py);
    const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
    const pad = 110;
    const k = Math.max(1, Math.min(2.2,
      Math.min((MAP_W-2*pad)/Math.max(1,(maxX-minX)), (MAP_H-2*pad)/Math.max(1,(maxY-minY)))
    ));
    const cx = (minX+maxX)/2, cy = (minY+maxY)/2;
    const tx = MAP_W/2 - k*cx, ty = MAP_H/2 - k*cy;
    containerSel.call(mapZoomBehavior.transform, d3.zoomIdentity.translate(tx,ty).scale(k));
  }
}
document.getElementById("zoomIn").addEventListener("click", ()=>{
  d3.select("#mapContainer").transition().duration(220).call(mapZoomBehavior.scaleBy, 1.4);
});
document.getElementById("zoomOut").addEventListener("click", ()=>{
  d3.select("#mapContainer").transition().duration(220).call(mapZoomBehavior.scaleBy, 1/1.4);
});


/* ---------------- Init ---------------- */
buildCarousel();
startCarouselLoop();
buildMap();
buildVideoGrid();
startVideoMarquee();
applyI18n();
