/**
 * FAQ export/runtime helper.
 * Primary open/close behavior uses Bootstrap 5 Collapse attributes in the markup.
 * This script only keeps accessibility + visual `is-open` state in sync.
 */
export const WTO_FAQ_RUNTIME = `
(function(){
  function syncFaqItem(item){
    if (!item) return;
    var panel = item.querySelector('[data-faq-panel]');
    var trigger = item.querySelector('[data-faq-trigger]');
    if (!panel) return;
    var open = panel.classList.contains('show');
    item.classList.toggle('is-open', open);
    if (trigger) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function initWtoFaqs(root){
    try {
      var scope = root && root.querySelectorAll ? root : document;
      scope.querySelectorAll('[data-wto-faq="1"]').forEach(function(faq){
        faq.querySelectorAll('[data-faq-item]').forEach(syncFaqItem);
        if (faq.getAttribute('data-wto-faq-ready') === '1') return;
        faq.setAttribute('data-wto-faq-ready', '1');
        faq.addEventListener('shown.bs.collapse', function(e){
          var panel = e.target;
          if (!panel || !panel.matches || !panel.matches('[data-faq-panel]')) return;
          syncFaqItem(panel.closest('[data-faq-item]'));
        });
        faq.addEventListener('hidden.bs.collapse', function(e){
          var panel = e.target;
          if (!panel || !panel.matches || !panel.matches('[data-faq-panel]')) return;
          syncFaqItem(panel.closest('[data-faq-item]'));
        });
      });
    } catch (err) {
      console.error('FAQ init failed', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ initWtoFaqs(document); });
  } else {
    initWtoFaqs(document);
  }
  window.__wtoInitFaqs = initWtoFaqs;
})();
`;
