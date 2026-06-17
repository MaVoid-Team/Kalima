import SharedRoleForm from "./SharedRoleForm";
import useRegister from "@/hooks/auth/useRegister";

export default function RegisterLecturer({ onBack, redirectTo }) {
    const { registerLecturer, registerFirebaseLecturer } = useRegister();
    return (
        <SharedRoleForm
            role="lecturer"
            onBack={onBack}
            registerFn={registerLecturer}
            registerFirebaseFn={registerFirebaseLecturer}
            redirectTo={redirectTo}
        />
    );
}
