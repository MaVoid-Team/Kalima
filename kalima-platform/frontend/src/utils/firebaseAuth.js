import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

/**
 * Initiates Firebase Google OAuth flow and returns the ID token
 * @returns {Promise<string>} - Firebase ID token
 */
export async function getFirebaseIdToken() {
    try {
        // Use popup for OAuth flow
        const result = await signInWithPopup(auth, googleProvider);
        
        // Get the ID token from the user credential
        const user = result.user;
        const idToken = await user.getIdToken();
        
        return idToken;
    } catch (error) {
        console.error('Firebase OAuth error:', error);
        throw new Error('Failed to authenticate with Google. Please try again.');
    }
}

/**
 * Signs out from Firebase (useful for cleanup)
 * @returns {Promise<void>}
 */
export async function signOutFromFirebase() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Firebase sign out error:', error);
    }
}
