import { RiRobot3Fill } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth, provider } from "../Utils/firebase";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../Redux/userSlice";
import { useEffect } from "react";

function Auth({isModel = false}){
    const dispatch = useDispatch()
    const apiBaseUrl = serverUrl || "http://localhost:5000"

    const syncUserWithBackend = async (firebaseUser) => {
        const name = firebaseUser?.displayName
        const email = firebaseUser?.email
        const image = firebaseUser?.photoURL

        if (!email) {
            throw new Error("Google account email not found.")
        }

        const result = await axios.post(
            apiBaseUrl + "/api/auth/google",
            { name, email, image },
            { withCredentials: true }
        )
        dispatch(setUserData(result.data.user))
    }

    useEffect(() => {
        const completeRedirectSignIn = async () => {
            try {
                const result = await getRedirectResult(auth)
                if (result?.user) {
                    await syncUserWithBackend(result.user)
                }
            } catch (error) {
                console.log(error)
                dispatch(setUserData(null))
            }
        }

        completeRedirectSignIn()
    }, [dispatch])

    const handleGoogleAuth = async ()=>{
        try {
           const response = await signInWithPopup(auth, provider);
           await syncUserWithBackend(response.user)
        } catch (error) {
            console.log(error);
            dispatch(setUserData(null))
            // Popup-related failures are common in browsers with stricter settings.
            if (
                error?.code === "auth/popup-blocked" ||
                error?.code === "auth/cancelled-popup-request" ||
                error?.code === "auth/popup-closed-by-user"
            ) {
                try {
                    await signInWithRedirect(auth, provider)
                    return
                } catch (redirectError) {
                    console.log(redirectError)
                }
            }

            if (error?.code === "auth/unauthorized-domain") {
                alert("Google auth blocked: add this domain in Firebase Authorized domains.")
            } else if (error?.message === "Network Error") {
                alert("Network error: backend server/CORS issue. Ensure backend is running on port 5000 and app is opened on localhost.")
            } else {
                alert(error?.message || "Google sign-in failed. Please try again.")
            }
        }
    }

    return(
        <div className={`w-full ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}`}>
        <motion.div
        initial={{opacity:0, y:-50}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.2}}
        className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"} bg-white shadow-2xl border border-gray-200`}>
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-black text-white p-2 rounded-lg">
                    <RiRobot3Fill size={14} />
                </div>
                <h2 className="font-semibold text-lg">Interview.AI</h2>
            </div>
            <h1 className="text-sm md:text-3xl font-semibold text-center leading-snug mb-4">
                Continue with {" "}
                <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full inline-flex items-center gap-2">
                    Mock AI Interview
                </span>
            </h1>
            <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
                Sign in to access your AI Interview Dashboard and continue your personalized interview experience.
            </p>
            <motion.button
            onClick={handleGoogleAuth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md cursor-pointer">
                <FcGoogle size={20} />
                Continue With Google
            </motion.button>
        </motion.div>
        </div>
    )
}

export default Auth;