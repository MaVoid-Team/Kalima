import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";

export default function AcceptEBookletInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { acceptInvite } = useStudentEBooklets();
  const [state, setState] = useState({ status: "loading", message: "" });

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const response = await acceptInvite(token);
        const instanceId = response?.data?.bookletInstanceId;
        if (!active) return;
        if (instanceId) {
          setState({ status: "success", message: "Access granted." });
          navigate(`/student/e-booklets/${instanceId}`, { replace: true });
        } else {
          setState({ status: "success", message: "Invite accepted." });
        }
      } catch (error) {
        if (!active) return;
        setState({
          status: "error",
          message:
            error?.response?.data?.message ||
            "This e-booklet invite cannot be accepted.",
        });
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [acceptInvite, navigate, token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <BookOpenCheck className="h-12 w-12 text-primary" />
      <h1 className="mt-4 text-2xl font-bold">E-Booklet Invite</h1>
      {state.status === "loading" ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validating invite and quota...
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
          <Button asChild className="mt-5">
            <Link to="/student/e-booklets">Open My E-Booklets</Link>
          </Button>
        </>
      )}
    </div>
  );
}
