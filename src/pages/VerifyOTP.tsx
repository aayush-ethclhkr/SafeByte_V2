import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [status, setStatus]   = useState<"checking" | "need-email" | "verifying" | "success" | "error">("checking");
  const [email, setEmail]     = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const saved = window.localStorage.getItem("emailForSignIn");
      if (saved) {
        verifyLink(saved);
      } else {
        setStatus("need-email");
      }
    } else {
      // Not a magic link URL — redirect to login
      navigate("/login");
    }
  }, []);

  const verifyLink = async (emailAddr: string) => {
    setStatus("verifying");
    try {
      await signInWithEmailLink(auth, emailAddr, window.location.href);
      window.localStorage.removeItem("emailForSignIn");
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      if (typeof err === "object" && err !== null && "message" in err) {
        setErrorMsg((err as { message: string }).message);
      } else {
        setErrorMsg("Verification failed. The link may have expired.");
      }
    }
  };

  const handleManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) verifyLink(email);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">SafeByte</span>
        </Link>

        <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-8 shadow-2xl">

          {/* Checking / Verifying */}
          {(status === "checking" || status === "verifying") && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold">Verifying magic link…</h2>
              <p className="text-sm text-muted-foreground">Please wait while we sign you in.</p>
            </div>
          )}

          {/* Need email */}
          {status === "need-email" && (
            <div className="space-y-5">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Confirm your email</h2>
              <p className="text-sm text-muted-foreground">
                For security, please re-enter the email address you used to request the magic link.
              </p>
              <form onSubmit={handleManualEmail} className="space-y-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full" disabled={!email}>
                  Confirm & Sign In
                </Button>
              </form>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-emerald-400">Signed in successfully!</h2>
              <p className="text-sm text-muted-foreground">Redirecting you to the dashboard…</p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-5">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-400">Verification Failed</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button asChild className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
