const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    primaryNav.classList.toggle('is-open', !isOpen);
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Открыть меню');
      primaryNav.classList.remove('is-open');
    });
  });
}

const productCards = [...document.querySelectorAll('.product-card')];
const filterTabs = [...document.querySelectorAll('.filter-tab')];
const pcdFilter = document.querySelector('#pcd-filter');
const filterStatus = document.querySelector('#filter-status');
const emptyState = document.querySelector('#empty-state');
let activeKind = 'all';

function applyCatalogFilters() {
  const pcd = pcdFilter?.value ?? 'all';
  let visibleCount = 0;

  productCards.forEach((card) => {
    const matchesKind = activeKind === 'all' || card.dataset.kind === activeKind;
    const matchesPcd = pcd === 'all' || card.dataset.pcd === pcd;
    const isVisible = matchesKind && matchesPcd;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (emptyState) emptyState.hidden = visibleCount !== 0;
  if (filterStatus) {
    if (visibleCount === 0) {
      filterStatus.textContent = 'Моделей не найдено. Измените тип диска или разболтовку.';
    } else if (pcd !== 'all' || activeKind !== 'all') {
      const remainder = visibleCount % 10;
      const lastTwoDigits = visibleCount % 100;
      const countLabel = visibleCount === 1 || lastTwoDigits === 1
        ? 'модель'
        : remainder >= 2 && remainder <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
          ? 'модели'
          : 'моделей';
      filterStatus.textContent = `Показано: ${visibleCount} ${countLabel}. Точную совместимость нужно подтвердить по автомобилю.`;
    } else {
      filterStatus.textContent = '';
    }
  }
}

filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeKind = tab.dataset.kind ?? 'all';
    filterTabs.forEach((otherTab) => {
      const isActive = otherTab === tab;
      otherTab.classList.toggle('is-active', isActive);
      otherTab.setAttribute('aria-pressed', String(isActive));
    });
    applyCatalogFilters();
  });
});

pcdFilter?.addEventListener('change', applyCatalogFilters);

const fitmentDialog = document.querySelector('#fitment-dialog');
const requestedProduct = document.querySelector('#requested-product');
const fitmentForm = document.querySelector('#fitment-form');
const fitmentStatus = document.querySelector('#fitment-status');
const fitmentBrand = document.querySelector('#fitment-brand');
const fitmentPhone = document.querySelector('#fitment-phone');

function showFormStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function openFitmentDialog(productName = '') {
  if (!fitmentDialog?.showModal) {
    document.querySelector('#contacts')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (requestedProduct) requestedProduct.value = productName;
  showFormStatus(fitmentStatus, '');
  fitmentDialog.showModal();
  window.requestAnimationFrame(() => fitmentBrand?.focus());
}

document.querySelectorAll('[data-open-fitment]').forEach((button) => {
  button.addEventListener('click', () => openFitmentDialog(button.dataset.product ?? ''));
});

document.querySelector('.dialog-close')?.addEventListener('click', () => fitmentDialog?.close());

fitmentDialog?.addEventListener('click', (event) => {
  if (event.target === fitmentDialog) fitmentDialog.close();
});

fitmentDialog?.addEventListener('close', () => {
  fitmentForm?.reset();
  showFormStatus(fitmentStatus, '');
});

fitmentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!fitmentForm.checkValidity()) {
    showFormStatus(fitmentStatus, 'Проверьте марку, модель и телефон — обязательные поля отмечены звёздочкой.', true);
    fitmentForm.reportValidity();
    return;
  }

  const product = requestedProduct?.value;
  const productNote = product ? ` для ${product}` : '';
  showFormStatus(fitmentStatus, `Данные проверены${productNote}. Это учебный макет: заявка никуда не отправлена.`);
});

const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    showFormStatus(contactStatus, 'Заполните обязательные поля и отметьте согласие.', true);
    contactForm.reportValidity();
    return;
  }

  showFormStatus(contactStatus, 'Поля проверены. Это учебный макет: сообщение не было отправлено.');
});

document.querySelectorAll('.product-visual img, .hero-wheel').forEach((image) => {
  const showFallback = () => image.closest('.product-visual, .hero-wheel-wrap')?.classList.add('is-error');
  image.addEventListener('error', showFallback);
  if (image.complete && image.naturalWidth === 0) showFallback();
});
