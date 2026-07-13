/** Framework-wide error type so commands can catch/report consistently. */
export class AiraError extends Error {
  constructor(
    message: string,
    public readonly code: string = "AIRA_ERROR",
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "AiraError";
  }
}
