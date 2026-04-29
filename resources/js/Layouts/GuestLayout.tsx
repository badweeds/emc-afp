import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen w-full flex bg-[#F8FAFC]">
            {/* LEFT PANEL - Branding (Visible on Desktop) */}
            <div className="hidden lg:flex w-1/2 bg-[#1e293b] relative flex-col items-center justify-center p-12 overflow-hidden border-r-4 border-[#7B1E1E]">
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a] opacity-95"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    
                    {/* THE FIX: Swapped the icon for your actual EMC Logo image */}
                    <div className="size-62 bg-white p-1.5 rounded-full border-4 border-yellow-500 mb-8 flex items-center justify-center shadow-2xl overflow-hidden relative z-20">
                        <img 
                            src="/images/emc-logo.png"
                            alt="EMC Logo" 
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                                // Fallback just in case the browser can't find the image due to spaces in the name
                                (e.target as HTMLImageElement).src = '/images/EMC%20Logo.jpg';
                            }}
                        />
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-yellow-500 tracking-widest uppercase mb-2">
                        Armed Forces of the Philippines
                    </h2>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6 uppercase">
                        Eastern Mindanao <br/> Command
                    </h1>

                    <div className="h-1.5 w-24 bg-yellow-500 rounded-full mb-6 shadow-lg"></div>

                    <p className="text-lg text-slate-300 font-medium max-w-md">
                        Centralized Daily News Monitoring Dashboard
                    </p>
                </div>

                {/* Subtle Decorative Element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30"></div>
            </div>

            {/* RIGHT PANEL - Content Area (Login/Register Forms) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 p-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}