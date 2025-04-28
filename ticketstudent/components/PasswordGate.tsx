"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Loader2 } from "lucide-react";

type PasswordGateProps = {
  children: React.ReactNode;
};

const LOCAL_STORAGE_KEY = "authenticated";

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [input, setInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkPassword = useMutation(api.checkPassword.checkPassword);

  useEffect(() => {
    const isAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isCorrect = await checkPassword({ password: input });
      if (isCorrect) {
        setIsAuthenticated(true);
        localStorage.setItem(LOCAL_STORAGE_KEY, "true");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Error checking password:", error);
      setError("An unexpected error occurred.");
    }

    setLoading(false);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Entrez le mot de passe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mot de passe"
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || input.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Vérification..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;

