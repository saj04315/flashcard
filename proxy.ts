import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/login(.*)', '/api/clerk-webhook(.*)']);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        const session = await auth();
        if (!session.userId) {
            return (await auth()).redirectToSignIn({ returnBackUrl: request.url });
        }
    }

    // Set the current pathname in a header so layout can see it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', new URL(request.url).pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
