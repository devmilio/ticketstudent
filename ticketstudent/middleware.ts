import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Définir les routes prives
const isPrivateRoute = createRouteMatcher([
  '/dashboard',  // Seul le chemin "/dashboard" sera protégé
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Si l'utilisateur n'est pas authentifié et tente d'accéder à /dashboard, redirection vers la page d'accueil (/)
  if (!userId && isPrivateRoute(req)) {
    const landingUrl = new URL('/', req.url);  // Redirige vers la page de connexion (landing)
    return Response.redirect(landingUrl.toString());
  }

  // Si l'utilisateur est authentifié et tente d'accéder à la page de connexion ou d'inscription, redirection vers /dashboard
  if (userId && (req.url === '/sign-in' || req.url === '/sign-up')) {
    const dashboardUrl = new URL('/dashboard', req.url);  // Redirige vers le tableau de bord
    return Response.redirect(dashboardUrl.toString());
  }

  // Sinon, continue normalement pour toutes les autres pages
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',  // Si vous utilisez API ou trpc, assurez-vous que cela soit inclus
  ],
};
