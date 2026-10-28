import { NextResponse, type NextRequest } from "next/server";

// Optimistic check on cookie presence only. The API verifies the token.
export function proxy(request: NextRequest) {
  const authed = request.cookies.has("token");
  const onLogin = request.nextUrl.pathname === "/login";

  if (!authed && !onLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authed && onLogin) {
    return NextResponse.redirect(new URL("/boards", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!graphql|_next/static|_next/image|favicon.ico).*)"],
};
