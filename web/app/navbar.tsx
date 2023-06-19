'use client';

import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Web3Button } from '../components/Web3Button';

// const navigation = [
//   { name: 'Dashboard', href: '/' },
//   { name: 'Playground', href: '/playground' }
// ];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  return (
    <Disclosure as="nav" className="bg-white shadow-sm relative">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="flex h-16 justify-between items-center">
              {/* Title - positioned absolutely */}
              <p
                className="text-gray-900 absolute left-0 right-0 px-1 text-xl font-medium"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                Aplikasi Arisan Online
              </p>
              {/* Web3Button */}
              <div className="ml-auto flex items-center">
                <Web3Button />
              </div>
              {/* Hamburger Menu */}
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
