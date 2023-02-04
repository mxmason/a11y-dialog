import 'cypress-real-events/support'
import '@cypress/fiddle'
import { getFocusableEdges } from '../fixtures/dom-utils'

Cypress.Commands.add(
  'aliasFocusableEdges',
  { prevSubject: true },
  (subject: JQuery<HTMLElement>, { skipAliases = false } = {}) => {
    cy.wrap(subject, { log: false })
      .then(subject => getFocusableEdges(subject.get(0)))
      .as('edges')
      .should('have.length', 2)

    if (!skipAliases) {
      // We cannot use `.first()` and `.last()` here because they operate on jQuery
      // collections and not on any iterable.
      cy.get('@edges', { log: false }).its('0', { log: false }).as('first')
      cy.get('@edges', { log: false }).its('1', { log: false }).as('last')
    }
  }
)

chai.use(_chai => {
  _chai.Assertion.addMethod('element', function isElement(localName) {
    const el = this._obj
    if (localName) {
      const actual = el.localName
      const expected = localName
      this.assert(
        el.localName === localName,
        `expected #{this} to be an element with localName "${localName}"`,
        `expected #{this} not to be an element with localName "${localName}"`,
        expected,
        actual
      )
    }
    const expected = true
    const actual = Cypress.dom.isElement(el)
    this.assert(
      actual,
      `expected #{this} to be an element`,
      `expected #{this} not to be an element`,
      expected,
      actual
    )
  })

  _chai.Assertion.addMethod('focusable', function isFocusable() {
    const el = this._obj
    const expected = true
    const actual = Cypress.dom.isFocusable(el)

    this.assert(
      actual,
      `expected #{this} to be focusable`,
      `expected #{this} not to be focusable`,
      expected,
      actual
    )
  })

  _chai.Assertion.addMethod('withinShadowRoot', function isWithinShadowRoot() {
    const expected = true
    // @ts-ignore: this method exists; it's just not in the type definition
    const actual = Cypress.dom.isWithinShadowRoot(this._obj)
    this.assert(
      actual,
      `expected #{this} to be in shadow DOM`,
      `expected #{this} not to be in shadow DOM`,
      expected,
      actual
    )
  })

  // See: https://github.com/cypress-io/cypress/blob/develop/packages/driver/src/dom/elements/shadow.ts#L4
  _chai.Assertion.addMethod('shadowRoot', function isShadowRoot() {
    const el = this._obj
    const actual = el.shadowRoot?.toString()
    const expected = '[object ShadowRoot]'

    this.assert(
      actual === expected,
      `expected #{this} to have a shadow root`,
      `expected #{this} not to have a shadow root`,
      expected,
      actual
    )
  })
})
