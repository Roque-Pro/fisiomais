declare module '@supabase/ssr' {
  // Minimal shims so the project type-checks even without the package's
  // shipped declarations. Runtime behavior comes from the JS module.
  export type CookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none' | boolean;
    secure?: boolean;
  };

  export type CookieMethods = {
    get(name: string): string | undefined;
    set(name: string, value: string, options: CookieOptions): void;
    remove(name: string, options: CookieOptions): void;
  };

  export function createBrowserClient(url: string, anonKey: string, options?: any): any;
  export function createServerClient(
    url: string,
    anonKey: string,
    options: { cookies: CookieMethods }
  ): any;
}
