import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function Sidebar({isSidebarVisible}:any) {
  // Control whether the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button - can be placed anywhere you want */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-[380px] bg-white shadow-lg border-r border-gray-200
          flex flex-col p-6
          transform
          transition-transform duration-300
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <h1 className="text-lg font-semibold text-gray-800">My App</h1>

        {/* User Profile Section */}
        <div className="mt-6">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverCard: "shadow-lg border border-gray-200",
                  userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-100",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
