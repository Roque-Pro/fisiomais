import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // 1. Evitar rodar em rotas estáticas ou de API pública imediatamente
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/api/public')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        }
      }
    }
  );

  // Somente rodar getUser se estiver em rota protegida ou de auth
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/cadastro');
  const isAppRoute = 
    url.pathname !== '/' && 
    !isAuthRoute && 
    !url.pathname.startsWith('/api');

  if (isAppRoute || isAuthRoute) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && isAppRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)']
};
