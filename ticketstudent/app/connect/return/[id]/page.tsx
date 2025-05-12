"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Return() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Compte connecté !</h2>
            <p className="text-green-100">
            Votre compte Stripe a été connecté avec succès
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-1">
                Compte connecté !
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Vous pouvez désormais créer et vendre des billets pour des événements</li>
                  <li>
                    • Les paiements seront traités via votre compte Stripe
                  </li>
                  <li>• Les fonds seront transférés automatiquement</li>
                </ul>
              </div>

              <Link
                href="/seller"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Accédez au tableau de bord du vendeur
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
