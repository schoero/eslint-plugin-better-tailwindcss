export type Async<Fn extends (...args: any[]) => any> = (...params: Parameters<Fn>) => Promise<ReturnType<Fn>>;

export interface Warning<Options extends Record<string, any> = Record<string, any>> {
  option: keyof Options & string;
  title: string;
  url?: string;
}
