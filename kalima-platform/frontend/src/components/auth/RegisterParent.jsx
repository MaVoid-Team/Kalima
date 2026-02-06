import CommonRegisterForm from "./CommonRegisterForm";

export default function RegisterParent({ onBack }) {
    return (
        <CommonRegisterForm role="parent" onBack={onBack}>
            {/* No specific fields for parent yet */}
        </CommonRegisterForm>
    );
}
