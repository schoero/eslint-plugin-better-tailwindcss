export type Async<Request, Response> = (request: Request) => Response;

export interface Warning<Options extends Record<string, any> = Record<string, any>> {
  option: keyof Options & string;
  title: string;
  url?: string;
}
