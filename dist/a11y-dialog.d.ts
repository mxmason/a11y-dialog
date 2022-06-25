export declare type A11yDialogEvent = 'show' | 'hide' | 'destroy' | 'create';
export declare type EventHandler = (node: Element, event?: Event) => void;
export default class A11yDialog {
    private $el;
    private id;
    private listeners;
    private openers;
    private closers;
    private previouslyFocused;
    private shown;
    constructor(element: HTMLElement);
    create: () => A11yDialog;
    destroy: () => A11yDialog;
    /**
     * Show the dialog element, trap the current focus within it, listen for some
     * specific key presses and fire all registered callbacks for `show` event
     */
    show: (event?: Event) => A11yDialog;
    /**
     * Hide the dialog element, restore the focus to the previously
     * active element, stop listening for some specific key presses
     * and fire all registered callbacks for `hide` event.
     */
    hide: (event?: Event) => A11yDialog;
    /**
     * Register a new callback for the given event type
     */
    on: (type: A11yDialogEvent, handler: EventHandler) => A11yDialog;
    /**
     * Unregister an existing callback for the given event type
     */
    off: (type: A11yDialogEvent, handler: EventHandler) => A11yDialog;
    /**
     * Iterate over all registered handlers for given type and call them all with
     * the dialog element as first argument, event as second argument (if any).
     * Also dispatch a custom event on the DOM element itself to make it
     * possible to react to the lifecycle of auto-instantiated dialogs.
     */
    private fire;
    /**
     * Private event handler used when listening to some specific key presses
     * (namely ESC and TAB)
     */
    private bindKeypress;
    private maintainFocus;
}
