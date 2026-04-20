import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    
    const { url, props } = usePage<any>();
    const user = props.auth?.user || { name: 'Commander' };

    return (
        <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
            {/* 1. Sidebar is now fixed and pinned to the left */}
            <Sidebar />

            {/* 2. Content area starts 64 units (256px) from the left */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
                
                {/* Fixed Top Navbar */}
                <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80 sticky top-0 z-40">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-end">
                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm font-bold leading-4 text-slate-600 transition duration-150 ease-in-out hover:text-[#1A237E] hover:bg-slate-100 focus:outline-none"
                                                >
                                                    {/* User Avatar Circle */}
                                                    <div className="size-6 bg-[#1A237E] text-white rounded-full flex items-center justify-center text-xs uppercase">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    {user.name}
                                                    <svg className="-me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('logout')} method="post" as="button" className="font-semibold text-red-600 hover:text-red-700">
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Optional Header Banner */}
                {header && (
                    <header className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-100">
                        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8 font-bold text-slate-800">
                            {header}
                        </div>
                    </header>
                )}

                {/* THE FIX: Main Content Area wrapped in Framer Motion */}
                <main className="p-6 lg:p-10 flex-1 overflow-x-hidden">
                    {/* AnimatePresence allows for exit animations, key={url} forces a re-animation on every page change */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={url}
                            initial={{ opacity: 0, y: 15 }} // Starts slightly lower and invisible
                            animate={{ opacity: 1, y: 0 }}  // Fades in and slides up to resting position
                            exit={{ opacity: 0, y: -15 }}   // Fades out and slides up when leaving
                            transition={{ duration: 0.3, ease: "easeOut" }} // Snappy and responsive timing
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
}