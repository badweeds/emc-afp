import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    // Added a fallback just in case the user prop is ever missing
    const user = usePage().props.auth?.user || { name: 'Commander' };

    return (
        <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
            {/* 1. Sidebar is now fixed and pinned to the left */}
            <Sidebar />

            {/* 2. Content area starts 64 units (256px) from the left */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sticky top-0 z-40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-end">
                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    {user.name}
                                                    <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            {/* Safely removed the profile route to stop the Ziggy crash */}
                                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-100">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 font-bold text-slate-800">
                            {header}
                        </div>
                    </header>
                )}

                <main className="p-6 lg:p-10 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}