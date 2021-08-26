export class Event {
  protected cancelled = false;

  public isCancelled(): boolean {
    return this.cancelled;
  }

  public cancel(): void {
    this.cancelled = true;
  }

  public restore(): void {
    this.cancelled = false;
  }
}
