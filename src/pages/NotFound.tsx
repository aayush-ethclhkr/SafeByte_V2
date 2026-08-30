import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldAlert, ArrowLeft, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
      <div className="text-center max-w-md p-8 rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-md">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 dark:text-red-400 mx-auto mb-6">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" /> ERROR CODE: 404_ROUTE_NOT_FOUND
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Resource Non-Existent</h1>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-mono">
          The requested endpoint <span className="text-primary font-bold">{location.pathname}</span> is not mapped within the SafeByte security perimeter.
        </p>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-2 shadow-md" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Return to Command Overview
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
