import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        );
      },
    },
  });

  // Important: getUser() must be called to verify authenticity of token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const path = url.pathname;

  // 0. Setup Guard — if no OWNER exists and user is not on /setup, redirect there
  //    This ensures the pharmacy owner can self-onboard without developer intervention.
  if (path !== '/setup' && !path.startsWith('/api') && !path.startsWith('/_next')) {
    try {
      const { data: ownerRows } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'OWNER')
        .limit(1);

      // No owner found — redirect everyone to setup wizard (except if already on /setup)
      if (ownerRows !== null && ownerRows.length === 0) {
        return NextResponse.redirect(new URL('/setup', request.url));
      }
    } catch {
      // If DB is unavailable or table doesn't exist, allow request to proceed
      // The setup page itself handles this gracefully
    }
  }

  // Prevent access to /setup once an owner exists
  if (path === '/setup') {
    try {
      const { data: ownerRows } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'OWNER')
        .limit(1);

      if (ownerRows && ownerRows.length > 0) {
        // Owner already exists — setup is complete, redirect to login or dashboard
        return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url));
      }
    } catch {
      // Allow setup page to proceed if DB is unavailable
    }
    return response;
  }

  // 1. Protect Dashboard (Staff/Admin access only)
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check from public profile
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['OWNER', 'MANAGER', 'STAFF'].includes(profile.role)) {
      // Customers or unknown profiles redirected back to storefront homepage
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Protect Account Portal (Customer access only)
  if (path.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Handle Logged-In User Redirects away from Login page
  if (path === '/login' && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (['OWNER', 'MANAGER', 'STAFF'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All images/icons (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
