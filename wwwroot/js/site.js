(function () {
    'use strict';

    const MODAL_SELECTOR = '#projectModal';
    let lastFocused = null;
    let domObserver = null;

    function visibleModal() {
        const modal = document.querySelector(MODAL_SELECTOR);
        return modal && !modal.classList.contains('hidden') ? modal : null;
    }

    function focusableItems(root) {
        return Array.from(root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(el => el.offsetParent !== null || el === document.activeElement);
    }

    const modalObserver = new MutationObserver(() => {
        const modal = visibleModal();
        if (modal && lastFocused === null) {
            lastFocused = document.activeElement;
            modal.setAttribute('tabindex', '-1');
            modal.focus({ preventScroll: true });
        } else if (!modal && lastFocused !== null) {
            if (document.contains(lastFocused)) {
                lastFocused.focus({ preventScroll: true });
            }
            lastFocused = null;
        }
    });

    function watchModal(modal) {
        modalObserver.disconnect();
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
        if (domObserver) {
            domObserver.disconnect();
            domObserver = null;
        }
    }

    function observeModal() {
        const modal = document.querySelector(MODAL_SELECTOR);
        if (modal) {
            watchModal(modal);
            return;
        }

        // In WebAssembly the modal is created after boot, so watch for it.
        if (!domObserver) {
            domObserver = new MutationObserver(() => {
                const found = document.querySelector(MODAL_SELECTOR);
                if (found) {
                    watchModal(found);
                }
            });
            domObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
    }

    document.addEventListener('keydown', function (event) {
        const modal = visibleModal();
        if (!modal) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            const closeButton = modal.querySelector('[aria-label="Close modal"]');
            if (closeButton) closeButton.click();
            return;
        }

        if (event.key === 'Tab') {
            const items = focusableItems(modal);
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];
            const outside = !modal.contains(document.activeElement);

            if (event.shiftKey && (document.activeElement === first || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeModal);
    } else {
        observeModal();
    }

    window.shipSharp = {
        focusModal() {
            const modal = visibleModal();
            if (!modal) return;
            observeModal();
            if (lastFocused === null) {
                lastFocused = document.activeElement;
            }
            modal.setAttribute('tabindex', '-1');
            modal.focus({ preventScroll: true });
        }
    };
})();
