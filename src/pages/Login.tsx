import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white px-6 flex flex-col justify-center pb-20">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-green-600" size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">AgroShield</h1>
        <p className="text-gray-500 max-w-[240px] mx-auto text-sm leading-relaxed">
          Verifying your identity to protect your farm data.
        </p>
      </div>

      <div className="max-w-xs mx-auto w-full">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : "Receive OTP"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl mb-2">
                <p className="text-xs text-green-700 font-medium leading-relaxed text-center">
                  We've sent a 6-digit code to <br/><span className="font-bold">{email}</span>
                </p>
              </div>
              
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="000000"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>

              <button 
                disabled={loading || otp.length !== 6}
                className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : "Verify & Login"}
              </button>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                >
                  Resend Code
                </button>
                <button 
                  type="button"
                  onClick={() => { setSent(false); setOtp(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Change Email
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
          Secure Multi-Channel Authentication<br/>Powered by Supabase
        </p>
      </div>
    </div>
  );
}
