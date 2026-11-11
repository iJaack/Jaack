const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/beeline-skin.js', 'utf8');

test('after definition, skin appends one style per shadow root and only touches shadow DOM', async () => {
  let resolveDefinition;
  const definition = new Promise(resolve => { resolveDefinition = resolve; });
  const roots = [[], []];
  const buttons = roots.map(children => Object.freeze({ shadowRoot: {
    querySelector(selector) {
      assert.equal(selector, 'style[data-jaack-beeline-skin]');
      return children.find(style => style.attrs['data-jaack-beeline-skin'] === '');
    },
    appendChild(style) { children.push(style); }
  } }));
  buttons.push(Object.freeze({ shadowRoot: null }));
  const context = vm.createContext({
    customElements: { whenDefined(name) { assert.equal(name, 'beeline-button'); return definition; } },
    document: {
      querySelectorAll(selector) { assert.equal(selector, 'beeline-button'); return buttons; },
      createElement(tag) {
        assert.equal(tag, 'style');
        return { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } };
      }
    }
  });
  vm.runInContext(source, context);
  assert.ok(roots.every(children => children.length === 0));
  resolveDefinition(); await definition;
  vm.runInContext(source, context); await definition;
  for (const children of roots) {
    assert.equal(children.length, 1);
    const css = children[0].textContent;
    assert.match(css, /var\(--jk-ink-2\)/);
    assert.match(css, /var\(--jk-hair-2\)/);
    assert.doesNotMatch(css, /#[a-f\d]{3,8}\b/i);
    assert.match(css, /svg\.trigger g > path:first-child\s*\{ fill: none; stroke:/);
    assert.match(css, /stroke-width: 1\.5px; vector-effect: non-scaling-stroke;/);
    assert.match(css, /path\[fill="\\23 1c7df9"\]/);
    assert.match(css, /path\[fill="\\23 fff"\]/);
  }
});
