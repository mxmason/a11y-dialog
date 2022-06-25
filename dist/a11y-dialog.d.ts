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
    hide: (event?: Event) => A11yDialog;
    show: (event: Event) => A11yDialog;
    on: (type: A11yDialogEvent, handler: EventHandler) => A11yDialog;
    off: (type: A11yDialogEvent, handler: EventHandler) => A11yDialog;
    private fire;
    private bindKeypress;
    private maintainFocus;
}
