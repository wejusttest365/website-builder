/** Shared carousel initializer for canvas preview and exported sites. */
export const WTO_CAROUSEL_RUNTIME = `
(function(){
  function initWtoCarousels(root){
    try {
      var scope = root && root.querySelectorAll ? root : document;
      scope.querySelectorAll('[data-wto-carousel="1"]').forEach(function(carousel){
        if (carousel.getAttribute('data-wto-carousel-ready') === '1') return;
        carousel.setAttribute('data-wto-carousel-ready', '1');

        var track = carousel.querySelector('[data-carousel-track]');
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
        var prevBtn = carousel.querySelector('[data-carousel-prev]');
        var nextBtn = carousel.querySelector('[data-carousel-next]');
        if (!track || !slides.length) return;

        var autoplay = carousel.getAttribute('data-autoplay') === '1';
        var delay = Math.max(500, Number(carousel.getAttribute('data-autoplay-delay') || 5000) || 5000);
        var loop = carousel.getAttribute('data-loop') !== '0';
        var pauseHover = carousel.getAttribute('data-pause-hover') !== '0';
        var duration = Math.max(0, Number(carousel.getAttribute('data-transition') || 500) || 500);
        var keyboard = carousel.getAttribute('data-keyboard') !== '0';
        var swipe = carousel.getAttribute('data-swipe') !== '0';
        var startIndex = Math.max(0, Math.min(slides.length - 1, Number(carousel.getAttribute('data-start-index') || 0) || 0));
        var index = startIndex;
        var timer = null;
        var hovering = false;
        var touchStartX = null;
        var touchDeltaX = 0;

        track.style.transitionDuration = duration + 'ms';

        function update(){
          track.style.transform = 'translate3d(' + (-index * 100) + '%,0,0)';
          dots.forEach(function(dot, i){
            var active = i === index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
          });
          slides.forEach(function(slide, i){
            slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
          });
          if (prevBtn) {
            var prevDisabled = !loop && index <= 0;
            prevBtn.disabled = prevDisabled;
            prevBtn.setAttribute('aria-disabled', prevDisabled ? 'true' : 'false');
            prevBtn.classList.toggle('is-disabled', prevDisabled);
          }
          if (nextBtn) {
            var nextDisabled = !loop && index >= slides.length - 1;
            nextBtn.disabled = nextDisabled;
            nextBtn.setAttribute('aria-disabled', nextDisabled ? 'true' : 'false');
            nextBtn.classList.toggle('is-disabled', nextDisabled);
          }
        }

        function goTo(next){
          if (!slides.length) return;
          if (loop) {
            index = ((next % slides.length) + slides.length) % slides.length;
          } else {
            index = Math.max(0, Math.min(slides.length - 1, next));
          }
          update();
        }

        function next(){ goTo(index + 1); }
        function prev(){ goTo(index - 1); }

        function stopAutoplay(){
          if (timer) { clearInterval(timer); timer = null; }
        }

        function startAutoplay(){
          stopAutoplay();
          if (!autoplay || slides.length < 2) return;
          if (pauseHover && hovering) return;
          timer = setInterval(function(){
            if (!loop && index >= slides.length - 1) { stopAutoplay(); return; }
            next();
          }, delay);
        }

        if (prevBtn) prevBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); prev(); startAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); next(); startAutoplay(); });
        dots.forEach(function(dot){
          dot.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            var i = Number(dot.getAttribute('data-index') || 0);
            goTo(i);
            startAutoplay();
          });
        });

        if (pauseHover) {
          carousel.addEventListener('mouseenter', function(){ hovering = true; stopAutoplay(); });
          carousel.addEventListener('mouseleave', function(){ hovering = false; startAutoplay(); });
        }

        if (keyboard) {
          carousel.setAttribute('tabindex', '0');
          carousel.addEventListener('keydown', function(e){
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); startAutoplay(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); next(); startAutoplay(); }
          });
        }

        if (swipe) {
          var onStart = function(clientX){ touchStartX = clientX; touchDeltaX = 0; };
          var onMove = function(clientX){ if (touchStartX == null) return; touchDeltaX = clientX - touchStartX; };
          var onEnd = function(){
            if (touchStartX == null) return;
            if (Math.abs(touchDeltaX) > 40) {
              if (touchDeltaX < 0) next(); else prev();
              startAutoplay();
            }
            touchStartX = null;
            touchDeltaX = 0;
          };
          carousel.addEventListener('touchstart', function(e){ if (e.touches && e.touches[0]) onStart(e.touches[0].clientX); }, { passive: true });
          carousel.addEventListener('touchmove', function(e){ if (e.touches && e.touches[0]) onMove(e.touches[0].clientX); }, { passive: true });
          carousel.addEventListener('touchend', onEnd);
          carousel.addEventListener('mousedown', function(e){ onStart(e.clientX); });
          carousel.addEventListener('mousemove', function(e){ if (touchStartX != null) onMove(e.clientX); });
          carousel.addEventListener('mouseup', onEnd);
          carousel.addEventListener('mouseleave', function(){ if (touchStartX != null) onEnd(); });
        }

        update();
        startAutoplay();
      });
    } catch (err) {
      console.error('Carousel init failed', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ initWtoCarousels(document); });
  } else {
    initWtoCarousels(document);
  }
  window.__wtoInitCarousels = initWtoCarousels;
})();
`;
