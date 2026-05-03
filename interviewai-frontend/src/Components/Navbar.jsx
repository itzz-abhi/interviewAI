import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { RiRobot3Fill } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../Redux/userSlice";
import AuthModel from "./AuthModel";

function Navbar(){
    const {userData} = useSelector((state)=>state.user)
    const [showUser,setShowUser] = useState(false);
    const [showAuth,setShowAuth] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [userData?.image]);

    const handleLogout = async()=>{
        try {
           await axios.post(serverUrl + "/api/auth/logout", {},
            {withCredentials:true})
            dispatch(setUserData(null))
            setShowUser(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div className="bg-gray-950 flex justify-center px-4 pt-6 relative z-50">
            <motion.div
            initial={{opacity:0, y:-40}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.5}}
            className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-[24px] px-8 py-4 flex justify-between items-center relative">

                {/* Logo */}
                <div onClick={()=>navigate("/")} className="flex items-center gap-3 cursor-pointer">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <RiRobot3Fill size={18} />
                    </div>
                    <h1 className="font-semibold hidden md:block text-lg text-white">InterviewAI</h1>
                </div>

                <div className="flex items-center gap-4 relative">
                    {/* User */}
                    <div className="relative">
                        <motion.button
                        whileHover={{scale:1.05}}
                        whileTap={{scale:0.95}}
                        onClick={()=>{
                            if(!userData){ setShowAuth(true); return; }
                            setShowUser(!showUser)
                        }}
                        className="w-10 h-10 bg-gray-800 border border-gray-700 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer hover:border-blue-500 transition">
                           {!userData ? (
                            <FcGoogle size={20} />
                           ) : userData?.image && !avatarLoadFailed ? (
                            <img
                                src={userData.image}
                                alt={userData?.name || "User avatar"}
                                onError={() => setAvatarLoadFailed(true)}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                           ):(
                             <span className="text-white font-bold">
                             {userData?.name?.slice(0,1).toUpperCase()}
                             </span>
                           )}
                        </motion.button>

                        {showUser && (
                            <motion.div
                            initial={{opacity:0, y:-10}}
                            animate={{opacity:1, y:0}}
                            className="absolute right-0 mt-3 w-52 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl p-4 z-50">
                                <p className="text-sm text-white font-bold mb-3 border-b border-gray-700 pb-2">{userData?.name}</p>
                                <motion.button
                                whileHover={{x:4}}
                                onClick={()=>navigate("/history")}
                                className="w-full text-left text-sm py-2 text-gray-400 hover:text-white cursor-pointer transition">
                                    📜 Interview History
                                </motion.button>
                                <motion.button
                                whileHover={{x:4}}
                                onClick={handleLogout}
                                className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer transition">
                                    <MdLogout size={16} />
                                    Logout
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {showAuth && <AuthModel onClose={()=>setShowAuth(false)} />}
        </div>
    )
}

export default Navbar;