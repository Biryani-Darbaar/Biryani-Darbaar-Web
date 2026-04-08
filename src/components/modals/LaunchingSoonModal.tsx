import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';

const LaunchingSoonModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen || showRegister || showLogin) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, showRegister, showLogin]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSignUp = () => {
        setIsOpen(false);
        setShowRegister(true);
    };

    const handleExploreMenu = () => {
        setIsOpen(false);
        navigate('/Menu');
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-top flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative overflow-hidden"
                    >
                        {/* Red accent strip at the very top */}
                        <div className="h-1.5 w-full bg-primary" />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            aria-label="Close"
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
                        >
                            <X size={22} />
                        </button>

                        {/* Body */}
                        <div className="px-8 pt-7 pb-8">
                            {/* Badge — top left */}
                            <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                                {/* Ping dot */}
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryYellow opacity-90" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primaryYellow" />
                                </span>
                                Launching Soon in Adelaide
                            </div>

                            {/* Logo */}
                            <div className="flex justify-center my-1">
                                <img
                                    src="/assets/images/logo.png"
                                    alt="Biryani Darbaar"
                                    className="h-36 w-auto object-contain"
                                />
                            </div>

                            {/* Headline */}
                            <h2 className="text-4xl font-bold text-neutral-900 text-center leading-snug mb-3">
                                Adelaide's Finest Biryani is{' '}
                                <span className="text-primary">Almost Here</span>
                            </h2>

                            {/* Sub-copy */}
                            <p className="text-md text-neutral-500 text-center leading-relaxed mb-7">
                                Sign up now to unlock exclusive offers and early access before
                                we launch. Be the first to taste perfection.
                            </p>

                            {/* Divider */}
                            <div className="h-px bg-neutral-200 w-full mb-7" />

                            {/* CTAs */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSignUp}
                                    className="w-full bg-primary hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide"
                                >
                                    Sign Up for Early Access
                                </button>
                                <button
                                    onClick={handleExploreMenu}
                                    className="w-full bg-red-50 hover:bg-red-100 text-primary active:scale-[0.98] font-semibold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide"
                                >
                                    Explore the Menu
                                </button>
                            </div>

                            <p className="text-xs text-neutral-400 text-center mt-4">
                                Opening soon · Athol Park, Adelaide
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        <RegisterModal 
            isOpen={showRegister} 
            onClose={() => setShowRegister(false)} 
            onSwitchToLogin={() => {
                setShowRegister(false);
                setShowLogin(true);
            }} 
        />
        <LoginModal 
            isOpen={showLogin} 
            onClose={() => setShowLogin(false)} 
            onSwitchToRegister={() => {
                setShowLogin(false);
                setShowRegister(true);
            }} 
        />
        </>
    );
};

export default LaunchingSoonModal;
