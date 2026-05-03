import { RiRobot3Fill } from "react-icons/ri";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

function Footer(){
    return(
        <div className="bg-gray-950 flex justify-center px-4 py-12">
            <motion.div
            initial={{opacity:0,y:20}}
            whileInView={{opacity:1,y:0}}
            viewport={{once:true}}
            transition={{duration:0.5}}
            className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-[28px] py-10 px-10 md:px-20">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                            <RiRobot3Fill size={20} />
                        </div>
                        <h2 className="font-semibold text-lg text-white">Interview.AI</h2>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="hover:text-white cursor-pointer transition">Home</span>
                        <span className="hover:text-white cursor-pointer transition">Interview</span>
                        <span className="hover:text-white cursor-pointer transition">Coding</span>
                        <span className="hover:text-white cursor-pointer transition">History</span>
                    </div>

                    {/* Social */}
                    <div className="flex items-center gap-4 text-gray-400">
                        <motion.div whileHover={{scale:1.2, color:"#fff"}} className="cursor-pointer">
                            <FaGithub size={20} />
                        </motion.div>
                        <motion.div whileHover={{scale:1.2, color:"#1d9bf0"}} className="cursor-pointer">
                            <FaTwitter size={20} />
                        </motion.div>
                        <motion.div whileHover={{scale:1.2, color:"#0a66c2"}} className="cursor-pointer">
                            <FaLinkedin size={20} />
                        </motion.div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        © 2024 Interview.AI — Helping developers ace their interviews with AI-powered practice.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Footer;