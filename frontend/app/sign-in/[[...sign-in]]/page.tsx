import { SignIn } from '@clerk/nextjs';
import { Brain } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-xl mb-4 shadow-lg shadow-slate-200 hover:scale-105 transition-transform">
            <Brain size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bon retour parmi nous.</h1>
          <p className="text-slate-500 mt-2">Prêt à apprendre quelque chose de nouveau ?</p>
        </div>

        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            {/* Clerk component wrapped perfectly */}
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 w-full p-6",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        formButtonPrimary: "bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-sm font-bold shadow-md transition-all active:scale-95",
                        formFieldInput: "rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 bg-slate-50",
                        footerActionLink: "text-blue-600 hover:text-blue-700 font-bold",
                        identityPreviewText: "text-slate-600 font-bold",
                        formFieldLabel: "text-slate-600 font-bold text-xs uppercase tracking-wide"
                    }
                }}
            />
        </div>
      </div>
    </div>
  );
}