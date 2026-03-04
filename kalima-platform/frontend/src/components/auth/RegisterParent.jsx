import SharedRoleForm from "./SharedRoleForm";
import useRegister from "@/hooks/auth/useRegister";

export default function RegisterParent({ onBack, redirectTo }) {
    const { registerParent, registerFirebaseParent } = useRegister();
    return (
        <SharedRoleForm
            role="parent"
            onBack={onBack}
            registerFn={registerParent}
            registerFirebaseFn={registerFirebaseParent}
            redirectTo={redirectTo}
        />
    );
}
