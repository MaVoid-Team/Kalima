import { useTranslation } from 'react-i18next';
import useApiMutation from '../useApiMutation';

const useRegister = () => {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('auth');

    const handleRegister = async (endpoint, data) => {
        const responseData = await mutate({
            endpoint,
            data,
            defaultSuccessMessage: t('signup.success', 'Registration successful! Please check your email for verification instructions.'),
        });
        return responseData;
    };

    const registerTeacher = (data) => handleRegister('/auth/register/teacher', data);
    const registerStudent = (data) => handleRegister('/auth/register/student', data);
    const registerParent = (data) => handleRegister('/auth/register/parent', data);
    const registerLecturer = (data) => handleRegister('/auth/register/lecturer', data);

    const registerFirebaseTeacher = (data) => handleRegister('/auth/register/teacher/firebase', data);
    const registerFirebaseStudent = (data) => handleRegister('/auth/register/student/firebase', data);
    const registerFirebaseParent = (data) => handleRegister('/auth/register/parent/firebase', data);
    const registerFirebaseLecturer = (data) => handleRegister('/auth/register/lecturer/firebase', data);

    return {
        registerTeacher,
        registerStudent,
        registerParent,
        registerLecturer,
        registerFirebaseTeacher,
        registerFirebaseStudent,
        registerFirebaseParent,
        registerFirebaseLecturer,
        loading,
        error
    };
};

export default useRegister;
