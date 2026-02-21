import useApiMutation from '../useApiMutation';
import useAuth from './useAuth';

const useRegister = () => {
    const { loginSuccess } = useAuth();
    const { mutate, loading, error } = useApiMutation();

    const handleRegister = async (endpoint, data) => {
        const responseData = await mutate({
            endpoint,
            data,
            defaultSuccessMessage: 'Registration successful! Please check your email to verify your account.'
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
