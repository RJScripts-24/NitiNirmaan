import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Initialize Response (we might modify this with new cookies)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Create Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Pass updated cookies to the request AND response
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 3. Refresh Session
  // This will update the cookies if the token is expired but valid refresh token exists
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Route Protection Logic
  const path = request.nextUrl.pathname;

  // Define Protected Routes
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/builder') || 
    path.startsWith('/settings');

  // Define Auth Routes (Login/Signup)
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');

  // SCENARIO A: Unauthenticated User tries to access Dashboard -> Redirect to Login
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // redirectUrl.searchParams.set('next', path); // Optional: Remember where they wanted to go
    return NextResponse.redirect(redirectUrl);
  }

  // SCENARIO B: Authenticated User tries to access Login -> Redirect to Dashboard
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// 5. Config: Apply Middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, icons)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};