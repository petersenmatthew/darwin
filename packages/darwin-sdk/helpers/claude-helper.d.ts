export interface StreamOptions {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export declare function runClaude(instruction: string, cwd: string, streamOptions?: StreamOptions): Promise<unknown>;
