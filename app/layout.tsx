import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const display = localFont({src: [
  {path:'../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2',weight:'400',style:'normal'},
  {path:'../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2',weight:'400',style:'italic'},
],variable:'--font-display',display:'swap'});
const body = localFont({src:'../node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2',variable:'--font-body',display:'swap'});
export const metadata: Metadata = {title:'DHAMNA — A slower state of being',description:'An imagined coastal hideaway. Explore warm spaces, unhurried days, and a little closer to yourself.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>}
