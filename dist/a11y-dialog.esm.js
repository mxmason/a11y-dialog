var focusableSelectors = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
];

const TAB_KEY = 'Tab';
const ESCAPE_KEY = 'Escape';
class A11yDialog {
    $el;
    id;
    listeners = {};
    openers = [];
    closers = [];
    previouslyFocused = null;
    shown = false;
    constructor(element) {
        this.$el = element;
        this.id = this.$el.getAttribute('data-a11y-dialog') || this.$el.id;
        this.create();
    }
    create = () => {
        console.log('create', this.$el);
        this.$el.setAttribute('aria-hidden', 'true');
        this.$el.setAttribute('aria-modal', 'true');
        this.$el.setAttribute('tabindex', '-1');
        if (!this.$el.hasAttribute('role')) {
            this.$el.setAttribute('role', 'dialog');
        }
        // Keep a collection of dialog openers, each of which will be bound a click
        // event listener to open the dialog
        this.openers = $$('[data-a11y-dialog-show="' + this.id + '"]');
        this.openers.forEach((opener) => {
            opener.addEventListener('click', this.show);
        });
        // Keep a collection of dialog closers, each of which will be bound a click
        // event listener to close the dialog
        this.closers = $$('[data-a11y-dialog-hide]', this.$el).concat($$('[data-a11y-dialog-hide="' + this.id + '"]'));
        this.closers.forEach((closer) => {
            closer.addEventListener('click', this.hide);
        });
        // Execute all callbacks registered for the `create` event
        this.fire('create');
        return this;
    };
    destroy = () => {
        // Hide the dialog to avoid destroying an open instance
        this.hide();
        // Remove the click event listener from all dialog openers
        this.openers.forEach((opener) => {
            opener.removeEventListener('click', this.show);
        });
        // Remove the click event listener from all dialog closers
        this.closers.forEach((closer) => {
            closer.removeEventListener('click', this.hide);
        });
        // Execute all callbacks registered for the `destroy` event
        this.fire('destroy');
        // Empty the listeners map
        this.listeners = {};
        return this;
    };
    hide = (event) => {
        // If the dialog is already closed, abort
        if (!this.shown) {
            return this;
        }
        this.shown = false;
        this.$el.setAttribute('aria-hidden', 'true');
        // If there was a focused element before the dialog was opened (and it has a
        // `focus` method), restore the focus back to it
        // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
        if (this.previouslyFocused && this.previouslyFocused.focus) {
            this.previouslyFocused.focus();
        }
        // Remove the focus event listener to the body element and stop listening
        // for specific key presses
        document.body.removeEventListener('focus', this.maintainFocus, true);
        document.removeEventListener('keydown', this.bindKeypress);
        // Execute all callbacks registered for the `hide` event
        this.fire('hide', event);
        return this;
    };
    show = (event) => {
        // If the dialog is already open, abort
        if (this.shown) {
            return this;
        }
        // Keep a reference to the currently focused element to be able to restore
        // it later
        this.previouslyFocused = document.activeElement;
        this.$el.removeAttribute('aria-hidden');
        this.shown = true;
        // Set the focus to the dialog element
        moveFocusToDialog(this.$el);
        // Bind a focus event listener to the body element to make sure the focus
        // stays trapped inside the dialog while open, and start listening for some
        // specific key presses (TAB and ESC)
        document.body.addEventListener('focus', this.maintainFocus, true);
        document.addEventListener('keydown', this.bindKeypress);
        // Execute all callbacks registered for the `show` event
        this.fire('show', event);
        return this;
    };
    on = (type, handler) => {
        if (typeof this.listeners[type] === 'undefined') {
            this.listeners[type] = [];
        }
        this.listeners[type].push(handler);
        return this;
    };
    off = (type, handler) => {
        const index = (this.listeners[type] || []).indexOf(handler);
        if (index > -1) {
            this.listeners[type].splice(index, 1);
        }
        return this;
    };
    fire = (type, event) => {
        const listeners = this.listeners[type] || [];
        const domEvent = new CustomEvent(type, { detail: event });
        this.$el.dispatchEvent(domEvent);
        listeners.forEach((listener) => {
            listener(this.$el, event);
        });
    };
    bindKeypress = (event) => {
        // This is an escape hatch in case there are nested dialogs, so the keypresses
        // are only reacted to for the most recent one
        if (!this.$el.contains(document.activeElement))
            return;
        // If the dialog is shown and the ESC key is pressed, prevent any further
        // effects from the ESC key and hide the dialog, unless its role is
        // `alertdialog`, which should be modal
        if (this.shown &&
            event.key === ESCAPE_KEY &&
            this.$el.getAttribute('role') !== 'alertdialog') {
            event.preventDefault();
            this.hide(event);
        }
        // If the dialog is shown and the TAB key is pressed, make sure the focus
        // stays trapped within the dialog element
        if (this.shown && event.key === TAB_KEY) {
            trapTabKey(this.$el, event);
        }
    };
    maintainFocus = (event) => {
        // If the dialog is shown and the focus is not within a dialog element
        // (either this one or another one in case of nested dialogs) or
        // attribute, move it back to the dialog container.
        // See: https://github.com/KittyGiraudel/a11y-dialog/issues/177
        if (this.shown) {
            const target = event.target;
            if (!target.closest('[aria-modal="true"]') &&
                !target.closest('[data-a11y-dialog-ignore-focus-trap]'))
                moveFocusToDialog(this.$el);
        }
    };
}
/**
 * Query the DOM for nodes matching the given selector, scoped to context (or
 * the whole document)
 */
function $$(selector, context = document) {
    return Array.prototype.slice.call(context.querySelectorAll(selector));
}
/**
 * Set the focus to the first element with `autofocus` with the element or the
 * element itself
 */
function moveFocusToDialog(node) {
    const focused = (node.querySelector('[autofocus]') || node);
    focused.focus();
}
/**
 * Get the focusable children of the given element
 */
function getFocusableChildren(node) {
    return $$(focusableSelectors.join(','), node).filter(function (child) {
        return !!(child.offsetWidth ||
            child.offsetHeight ||
            child.getClientRects().length);
    });
}
function trapTabKey(node, event) {
    const focusableChildren = getFocusableChildren(node);
    const focusedItemIndex = focusableChildren.indexOf(document.activeElement);
    // If the SHIFT key is pressed while tabbing (moving backwards) and the
    // currently focused item is the first one, move the focus to the last
    // focusable item from the dialog element
    if (event.shiftKey && focusedItemIndex === 0) {
        focusableChildren[focusableChildren.length - 1].focus();
        event.preventDefault();
        // If the SHIFT key is not pressed (moving forwards) and the currently
        // focused item is the last one, move the focus to the first focusable item
        // from the dialog element
    }
    else if (!event.shiftKey &&
        focusedItemIndex === focusableChildren.length - 1) {
        focusableChildren[0].focus();
        event.preventDefault();
    }
}
function instantiateDialogs() {
    $$('[data-a11y-dialog]').forEach(function (node) {
        new A11yDialog(node);
    });
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', instantiateDialogs);
    }
    else {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(instantiateDialogs);
        }
        else {
            window.setTimeout(instantiateDialogs, 16);
        }
    }
}

export { A11yDialog as default };
