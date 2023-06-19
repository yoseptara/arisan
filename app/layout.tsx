import Nav from './nav';
import ToastComponent from '../components/ToastComponent';
import { Web3ContextProvider } from '../contexts/Web3Context';

import 'react-toastify/dist/ReactToastify.css';

import './globals.css';
import '../configuration';

export const metadata = {
  title: 'Aplikasi Arisan Online Terdesentralisasi',
  description: 'Aplikasi arisan online yang terintegrasi dengan smart contract'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full" suppressHydrationWarning={true}>
        <Web3ContextProvider>
          {/* <Suspense fallback="..."> */}
          {/* @ts-expect-error Server Component */}
          <Nav />
          {/* </Suspense> */}
          {children}

          <ToastComponent />

          {/* <Toast /> */}
        </Web3ContextProvider>
      </body>
    </html>
  );
}
