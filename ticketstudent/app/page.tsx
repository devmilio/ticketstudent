"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          La solution de billetterie idéale pour votre événement EDM / Techno
        </h1>
        <p className="text-lg text-gray-600">
          Proposez la meilleure expérience à vos participants avec nos solutions de billetterie en ligne, contrôle d’accès, cashless.
        </p>
      </header>

      {/* Email Form */}
      <SignedOut>
        <div className="w-full max-w-md flex flex-col md:flex-row items-center gap-2 mb-8">
          <input
            type="email"
            placeholder="Votre email"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => router.push("/sign-up")} // redirects to Clerk signup
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Commencer maintenant
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 text-center">
        ✅ Adapté à tous types d'événements, grands ou petits. ✅ Inscription gratuite et sans engagement.
        </div>
      </SignedOut>

      <SignedIn>
        {/* Auth Buttons */}
        <div className="mt-12 flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-green-600 hover:underline"
            >
              Aller au tableau de bord
            </button>
        </div>
      </SignedIn>

      {/* Divider */}
      <div className="h-px w-full max-w-2xl bg-gray-300 my-12"></div>

      {/* Illustration or Placeholder */}
      <div className="flex flex-col items-center">
        {/* French-Canadian label */}
        <div className="mt-4 text-xs text-gray-400">
          🇨🇦 Une Compagnie Canadienne depuis 2025
        </div>
      </div>
    </main>
  );
}