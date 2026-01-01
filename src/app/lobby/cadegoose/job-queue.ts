interface JobContext { active: boolean; }

interface Job {
  f: ((ctx: JobContext) => PromiseLike<void>) | ((ctx: JobContext) => void); cancellable: boolean;
}

export class JobQueue {
  private jobs: Job[] = [];
  private restart?: () => void;
  private done: Promise<void>;
  private _done?: () => void;
  private cancel?: () => void;
  private cancelPromise: Promise<void>;

  constructor(private jobTimeout = 0) {
    this.done = new Promise<void>(resolve => { this._done = resolve; });
    this.cancelPromise = new Promise<void>(resolve => { this.cancel = resolve; });
    void this.doJobs();
  }

  addJob(f: Job['f'], cancellable = true): Promise<void> {
    this.jobs.push({ f, cancellable });
    this.restart?.();
    delete this.restart;
    return this.done;
  }

  clearJobs(): void {
    this.jobs = this.jobs.filter(job => !job.cancellable);
    if (this.jobs.length) console.log('saved', this.jobs.length, 'jobs');
    this.done = new Promise(resolve => { this._done = resolve; });
    this.cancel?.();
    this.cancelPromise = new Promise(resolve => { this.cancel = resolve; });
  }

  private async getJob(): Promise<Job> {
    if (!this.jobs.length) await new Promise<void>(resolve => { this.restart = resolve; });
    return this.jobs.shift() as Job;
  }

  private async doJobs() {
    while (true) {
      const job = await this.getJob();
      const ctx = { active: true };
      const promises = [job.f(ctx), this.cancelPromise];

      if (this.jobTimeout > 0) {
        promises.push(new Promise(resolve => setTimeout(resolve, this.jobTimeout)));
      }
      await Promise.race(promises);
      ctx.active = false;
      if (!this.jobs.length) {
        this._done?.();
        this.done = new Promise<void>(resolve => { this._done = resolve; });
      }
    }
  }
}
