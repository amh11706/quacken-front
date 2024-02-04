interface Job {
  f: (() => PromiseLike<void>) | (() => void); cancellable: boolean;
}

export class JobQueue {
  private jobs: Job[] = [];
  private restart?: () => void;
  done = new Promise<void>(resolve => this._done = resolve);
  private _done?: () => void;
  private cancel?: () => void;
  private cancelPromise = new Promise<void>(resolve => this.cancel = resolve);

  constructor(private jobTimeout = 0) {
    void this.doJobs();
  }

  addJob(f: (() => PromiseLike<void>) | (() => void), cancellable = true): Promise<void> {
    this.jobs.push({ f, cancellable });
    this.restart?.();
    delete this.restart;
    return this.done;
  }

  clearJobs(): void {
    this.jobs = this.jobs.filter(job => !job.cancellable);
    if (this.jobs.length) console.log('saved', this.jobs.length, 'jobs');
    this.done = new Promise(resolve => this._done = resolve);
    this.cancel?.();
    this.cancelPromise = new Promise(resolve => this.cancel = resolve);
  }

  private async getJob(): Promise<Job> {
    if (!this.jobs.length) await new Promise<void>(resolve => this.restart = resolve);
    return this.jobs.shift() as Job;
  }

  private async doJobs() {
    while (true) {
      const job = await this.getJob();
      const promises = [job.f(), this.cancelPromise];

      if (this.jobTimeout > 0) {
        promises.push(new Promise(resolve => setTimeout(resolve, this.jobTimeout)));
      }
      await Promise.race(promises);
      if (!this.jobs.length) {
        this._done?.();
        this.done = new Promise<void>(resolve => this._done = resolve);
      }
    }
  }
}
