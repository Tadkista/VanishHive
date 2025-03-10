import Footer from "./footer";
import Landing from "./landing";
import Navbar from "./navbar";
import { useEffect } from 'react';
 if (typeof window !== 'undefined') {
localStorage.setItem("virusTotalApiKey", "ebc3aa96b22e1cb1c1223acb0c72ddc09f766720cdfc580f0b514ec136161b5a")
 }
export default function Home() {
  return (
    <>
    <Navbar/>
    <Landing />
    <Footer />
    </>
  );
}
