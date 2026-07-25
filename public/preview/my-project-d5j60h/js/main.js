// Global JS


(function(){
  var io = new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('wto-in'); }
    else if(e.target.getAttribute('data-anim-repeat')==='1'){ e.target.classList.remove('wto-in'); }
  });},{threshold:.15});
  document.querySelectorAll('[data-anim]').forEach(function(el){io.observe(el);});
  
  var getPageSlug=function(){
    var path=window.location.pathname;
    var match=path.match(/([^\/]+)\.html?$/);
    return match?match[1]:'index';
  };
  var currentSlug=getPageSlug();
  var scrollTopBtn=document.createElement('button');
  scrollTopBtn.type='button';
  scrollTopBtn.setAttribute('aria-label','Scroll to top');
  scrollTopBtn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  scrollTopBtn.style.cssText='position:fixed;right:20px;bottom:20px;z-index:10005;display:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:9999px;background:#0f172a;color:#fff;box-shadow:0 10px 24px rgba(15,23,42,.25);cursor:pointer;';
  scrollTopBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  document.body.appendChild(scrollTopBtn);
  var toggleScrollTopBtn=function(){var shouldShow=window.scrollY>240;scrollTopBtn.style.display=shouldShow?'flex':'none';};
  toggleScrollTopBtn();
  window.addEventListener('scroll',toggleScrollTopBtn,{passive:true});
  var scrollToHash=function(href,e){
    if(!href||!href.startsWith('#')) return false;
    var hash=href.slice(1);
    var target=document.getElementById(hash);
    if(!target) return false;
    if(e) e.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  };
  
  document.querySelectorAll('[data-wto-nav]').forEach(function(nav){
    var btn=nav.querySelector('[data-wto-nav-btn]');
    var menu=nav.querySelector('[data-wto-nav-menu]');
    if(!btn||!menu)return;
    
    var setActiveLink=function(slug){
      menu.querySelectorAll('a').forEach(function(a){
        var href=a.getAttribute('href');
        var linkSlug=href?href.replace(/\.html$/,''):'index';
        if(linkSlug===slug){a.classList.add('active');}
        else{a.classList.remove('active');}
      });
    };
    setActiveLink(currentSlug);
    
    var toggleMenu=function(){
      var open=menu.classList.toggle('wto-nav-open');
      menu.classList.toggle('hidden', !open);
      menu.style.display=open?'flex':'none';
    };
    var closeMenu=function(){
      if(!window.matchMedia('(max-width: 767px)').matches) return;
      menu.classList.remove('wto-nav-open');
      menu.classList.add('hidden');
      menu.style.display='none';
    };
    btn.addEventListener('click',function(e){e.stopPropagation();toggleMenu();});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(e){
      e.stopPropagation();
      var href=a.getAttribute('href')||'';
      if (href.startsWith('#')) {
        e.preventDefault();
        if (scrollToHash(href,e)) {
          closeMenu();
          return;
        }
        closeMenu();
        return;
      }
      if (scrollToHash(href,e)) {
        closeMenu();
        return;
      }
      closeMenu();
    });});
    document.addEventListener('click',function(e){if(!nav.contains(e.target)&&menu.classList.contains('wto-nav-open')){closeMenu();}});
  });
  document.addEventListener('click',function(e){
    try {
      var target = e.target;
      while (target && target.nodeName !== 'A') { target = target.parentElement; }
      if (!target || target.nodeName !== 'A') return;
      var href = target.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:')) {
        if (href === '#') e.preventDefault();
        return;
      }
      if (href.startsWith('#')) {
        scrollToHash(href,e);
      }
    } catch (_) {}
  });
})();
