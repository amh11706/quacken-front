interface Job {
  f: (() => PromiseLike<void>) | (() => void); cancellable: boolean;
}

export class JobQueue {
  private jobs: Job[] = [];
  private restart?: () => void;
  done = new Promise<void>(resolve => this._done = resolve);
  private _done?: () => void;

  constructor(private jobTimeout = 3000) {
    this.doJobs();
  }

  addJob(f: (() => PromiseLike<void>) | (() => void), cancellable = true) {
    this.jobs.push({ f, cancellable });
    this.restart?.();
    delete this.restart;
    return this.done;
  }

  clearJobs() {
    this.jobs = this.jobs.filter(job => !job.cancellable);
    if (this.jobs.length) console.log('saved', this.jobs.length, 'jobs');
    this.done = new Promise<void>(resolve => this._done = resolve);
  }

  private async getJob(): Promise<Job> {
    if (!this.jobs.length) await new Promise<void>(resolve => this.restart = resolve);
    return this.jobs.shift() as Job;
  }

  private async doJobs() {
    while (true) {
      const job = await this.getJob();
      await Promise.race([
        job.f(),
        // new Promise<void>(resolve => setTimeout(resolve, this.jobTimeout)),
      ]);
      if (!this.jobs.length) {
        this._done?.();
        this.done = new Promise<void>(resolve => this._done = resolve);
      }
    }
  }

}
