import A11yDialog, { type A11yDialogInstance } from '../../src/a11y-dialog'

declare global {
  interface Window {
    instance: A11yDialogInstance
    A11yDialog: typeof A11yDialog
  }

  namespace Cypress {
    interface Chainer<Subject> {
      /**
       * Custom Chai assertion to check if a subject is an HTML element.
       * @example
       * cy.get('button').should('be.element')
       * cy.get('button').should('be.element', 'button')
       */
      isElement(localName?: string): Chainer<Subject>

      /**
       * Custom Chai assertion to check if a subject is focusable.
       * @example
       * cy.get('button').should('be.focusable')
       */
      isFocusable(): Chainer<Subject>

      /**
       * Custom Chai assertion to check if a subject is within a shadow DOM.
       * @example
       * cy.get('button').should('be.withinShadowRoot')
       * cy.get('button').should('not.be.withinShadowRoot')
       */
      isWithinShadowRoot(): Chainer<Subject>

      /**
       * Custom Chai assertion to check if a subject is a shadow root.
       * @example
       * cy.get('button').should('be.shadowRoot')
       * cy.get('button').should('not.be.shadowRoot')
       */
      isShadowRoot(): Chainer<Subject>
    }

    interface Chainable {
      aliasFocusableEdges({
        skipAliases,
      }?: {
        skipAliases: boolean
      }): Chainable<JQuery<HTMLElement>>
      runExample({
        html,
        test,
      }: {
        html: string
        test: string
      }): Chainable<JQuery<HTMLElement>>
    }

    interface dom {
      isWithinShadowRoot(el: HTMLElement): boolean
    }
  }
}
