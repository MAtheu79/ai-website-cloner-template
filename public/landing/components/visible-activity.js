/** A component-local clock that advances only while its content is being viewed.
 * Pending work is retained across scrolling, tab switches, and reconnects, with
 * no timers or animation frames scheduled while paused. */
export class VisibleActivity {
  constructor(host, onVisible = () => {}, target = host) {
    this.host = host;
    this.target = target;
    this.onVisible = onVisible;
    this.active = false;
    this._elapsed = 0;
    this._jobs = new Set();
    this._visibilityChanged = () => this._sync();
    if (host.shadowRoot) {
      const style = document.createElement("style");
      style.textContent = ':host([data-activity-paused]) *, :host([data-activity-paused]) *::before, :host([data-activity-paused]) *::after { animation-play-state: paused !important; }';
      host.shadowRoot.appendChild(style);
    }
  }

  connect() {
    if (this._observer) return;
    this.host.toggleAttribute("data-activity-paused", true);
    this._intersecting = false;
    this._observer = new IntersectionObserver(([entry]) => {
      this._intersecting = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      this._sync();
    });
    this._observer.observe(this.target);
    document.addEventListener("visibilitychange", this._visibilityChanged);
  }

  /** Re-check visibility now. Call after the target's size or position was
   *  changed by script: a target that first reported a zero-area intersection
   *  can grow into view without the observer firing again. */
  refresh() {
    if (!this._observer) return;
    this._observer.unobserve(this.target);
    this._observer.observe(this.target);
  }

  disconnect() {
    this._observer?.disconnect();
    this._observer = null;
    this._intersecting = false;
    document.removeEventListener("visibilitychange", this._visibilityChanged);
    this._sync();
  }

  now() {
    return this._elapsed + (this.active ? performance.now() - this._startedAt : 0);
  }

  _sync() {
    const active = this.host.isConnected && this._intersecting && !document.hidden;
    if (active === this.active) return;
    this._elapsed = this.now();
    this.active = active;
    this.host.toggleAttribute("data-activity-paused", !active);
    if (active) this._startedAt = performance.now();
    for (const job of this._jobs) {
      if (active) this._schedule(job);
      else this._cancel(job);
    }
    if (active) this.onVisible();
  }

  setTimeout(callback, delay = 0) {
    const job = { callback, due: this.now() + delay, frame: false, id: null };
    this._jobs.add(job);
    this._schedule(job);
    return job;
  }

  clearTimeout(job) {
    if (!job) return;
    this._cancel(job);
    this._jobs.delete(job);
  }

  wait(delay) {
    return new Promise((resolve) => this.setTimeout(resolve, delay));
  }

  requestAnimationFrame(callback) {
    const job = { callback, frame: true, id: null };
    this._jobs.add(job);
    this._schedule(job);
    return job;
  }

  _cancel(job) {
    if (job.id === null) return;
    if (job.frame) cancelAnimationFrame(job.id);
    else clearTimeout(job.id);
    job.id = null;
  }

  _schedule(job) {
    if (!this.active || job.id !== null) return;
    const run = () => {
      job.id = null;
      if (!this.active) return;
      this._jobs.delete(job);
      job.callback(this.now());
    };
    job.id = job.frame
      ? requestAnimationFrame(run)
      : setTimeout(run, Math.max(0, job.due - this.now()));
  }
}
