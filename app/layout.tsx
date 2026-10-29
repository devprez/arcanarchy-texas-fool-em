import type {Metadata} from 'next';
import './globals.css';
import './rendered-scene.css';
import AudioRuntime from '../components/audio-runtime';
export const metadata:Metadata={title:'Arcanarchy: Texas Fool ’Em',description:'Play your hand. Make a fool of fate. A free multiplayer tarot poker rebellion for 2–4 players.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AudioRuntime/>{children}</body></html>}
