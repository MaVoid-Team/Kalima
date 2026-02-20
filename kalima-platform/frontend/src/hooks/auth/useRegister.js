import { useState } from 'react';
import axios from '../../api/axios';
import useAuth from './useAuth';
import { toast } from 'sonner';

const useRegister = () => {
    const { loginSuccess } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const registerUser = async (endpoint, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(endpoint, data);
            const { user, tokens } = response.data.data;

            loginSuccess(user, tokens);
            toast.success('Registration successful!');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerTeacher = (data) => registerUser('/auth/register/teacher', data);
    const registerStudent = (data) => registerUser('/auth/register/student', data);
    const registerParent = (data) => registerUser('/auth/register/parent', data);
    const registerLecturer = (data) => registerUser('/auth/register/lecturer', data);

    return {
        registerTeacher,
        registerStudent,
        registerParent,
        registerLecturer,
        loading,
        error
    };
};

export default useRegister;
