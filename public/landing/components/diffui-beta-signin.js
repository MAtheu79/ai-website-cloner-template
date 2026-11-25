import '../../app/components/diffui-button.js';
import '../../app/components/diffui-signin-modal.js';
import { extractLoginError } from '../../login-error.js';

// The sign-in entrance: provider buttons for new accounts, and the same buttons
// under "Log in" for existing members. The landing header shows it in a dialog
// when someone presses Sign in.
const template = document.createElement('template');
template.innerHTML = `<style>
  :host{display:block;color:var(--text);font-family:var(--font)}
  .brand{display:flex;align-items:center;justify-content:center;gap:10px;font:36px Georgia,serif;margin-bottom:28px}.brand img{width:30px}
  h1{font-size:22px;font-weight:500;text-align:center;margin:0 0 12px;color:var(--heading,var(--text))}
  p{font-size:14px;line-height:1.5;text-align:center;color:var(--muted);margin:0}
  input{display:block;width:100%;box-sizing:border-box;margin:24px 0 16px;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--panel);font:inherit;color:var(--text)}
  input::placeholder{color:var(--muted)}
  input:focus-visible,a:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
  diffui-signin-modal{margin-top:20px}
  .switch{margin:22px 0 0;font-size:13px}.switch a{color:var(--gold);text-decoration:underline}
  .localLogin input{margin:16px 0 0}
  footer{text-align:center;margin-top:24px;font-size:11px;color:var(--muted)}a{color:inherit}
  [hidden]{display:none!important}
</style>
<div class="brand"><img src="/landing/assets/linen-brand-icon.svg" alt="">linen</div>
<h1 id="betaTitle">Create your account</h1><p class="intro">Choose how you’d like to sign up.</p>
<diffui-signin-modal inline></diffui-signin-modal>
<form class="localLogin" hidden><input type="email" placeholder="Local dev email" autocomplete="username" aria-label="Local dev email"></form>
<p class="switch"><span>Already have an account? </span><a href="?login=1">Log in</a></p>
<footer>By continuing, you agree to our <a href="/tos">Terms</a> and <a href="/privacy">Privacy Policy</a>.</footer>`;

const isLocalHost = () => ['localhost', '127.0.0.1', '::1'].includes(location.hostname);

export class DiffuiBetaSignin extends HTMLElement {
  constructor() {
    super();
    // Read before the inner provider list consumes the OAuth error params.
    this.hasLoginError = !!extractLoginError(location.search);
    this._signup = true;
    const root = this.attachShadow({mode: 'open'});
    root.append(template.content.cloneNode(true));
    this._providers = root.querySelector('diffui-signin-modal');
    this._link = root.querySelector('.switch a');
    this._wire();
    this.showSignup();
  }

  showSignup() { this.showProviders(true); }

  showLogin() { this.showProviders(false); }

  showProviders(signup) {
    const root = this.shadowRoot;
    this._signup = signup;
    root.querySelector('.localLogin').hidden = !isLocalHost();
    root.querySelector('h1').textContent = signup ? 'Create your account' : 'Welcome back';
    const intro = root.querySelector('.intro');
    intro.textContent = signup ? 'Choose how you’d like to sign up.' : 'Sign in to your Linen account.';
    root.querySelector('.switch span').textContent = signup ? 'Already have an account? ' : 'New to Linen? ';
    this._link.textContent = signup ? 'Log in' : 'Create an account';
    this._link.href = signup ? '?login=1' : '?';
  }

  focus() {
    this._providers.shadowRoot?.querySelector('#providersInline diffui-button')?.focus();
  }

  _wire() {
    const root = this.shadowRoot;
    this._link.addEventListener('click', event => {
      event.preventDefault();
      if (this._signup) this.showLogin();
      else this.showSignup();
      this.focus();
    });
    root.querySelector('.localLogin').addEventListener('submit', event => {
      event.preventDefault();
      const email = event.currentTarget.querySelector('input').value.trim();
      if (email) this.dispatchEvent(new CustomEvent('diffui-signin-local', {detail: {email}, bubbles: true, composed: true}));
    });
    root.addEventListener('diffui-signin-select', event => {
      event.stopPropagation();
      const url = new URL(`/api/auth/${event.detail.provider}/start`, location.origin);
      url.searchParams.set('return', location.pathname.startsWith('/app') ? location.pathname + location.search + location.hash : '/app');
      location.assign(url);
    });
  }
}

if (!customElements.get('diffui-beta-signin')) customElements.define('diffui-beta-signin', DiffuiBetaSignin);
