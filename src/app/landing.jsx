"use client"
import Link from "next/link";
import News from './CyberSecurityNewsSlider';
import { useState, useEffect, useRef } from "react";

export default function Landing() {
    const [isVisible, setIsVisible] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'system', content: 'Welcome to VanishHive Support! Ask me any cybersecurity questions.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    
    // Auto-scroll for chat
    useEffect(() => {
        if (isVisible) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isVisible]);
    
    const toggleIsVisible = () => {
        setIsVisible(!isVisible);
    }

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        
        // Add user message to chat
        const newMessage = { role: 'user', content: userInput };
        setChatMessages(prev => [...prev, newMessage]);
        setUserInput('');
        setIsLoading(true);
        
        try {
            // Call Groq API
            const GROQ_API_KEY = "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";
            
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful cybersecurity expert providing concise guidance about email security, phishing, and online safety. Keep answers brief and clear for browser extension users."
                        },
                        ...chatMessages.filter(msg => msg.role !== 'system'),
                        newMessage
                    ],
                    temperature: 0.2
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const responseData = await response.json();
            const aiResponse = { 
                role: 'system', 
                content: responseData.choices[0]?.message?.content || "Sorry, I couldn't process your request." 
            };
            
            setChatMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error fetching from Groq API:", error);
            setChatMessages(prev => [...prev, { 
                role: 'system', 
                content: "Sorry, I encountered an error while processing your question. Please try again later." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <main className="min-h-screen flex flex-col place-items-center text-gray-200 bg-gray-900">
                <div className="text-center flex flex-col justify-center place-items-center pt-40 pb-20">
                    <h1 className="text-8xl font-bold">Welcome to <br /> Vanish<span className="text-amber-400">Hive!</span></h1>
                    <p className="text-2xl py-4">Your place to stay safe on the web</p>
                    <div>
                        <a href="#tools" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-400 transition-all hover:bg-amber-400 hover:text-gray-900 hover:border-amber-400 mx-2" >Try it out</a>
                        <a href="https://github.com/BudzioT/BKIhack/releases/tag/extension" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-400 transition-all hover:bg-amber-400 hover:text-gray-900 hover:border-amber-400 mx-2" >Get browser extension</a>
                    </div>
                </div>
                <div className="flex flex-col justify-center place-items-center w-4/5">
                    <h2 className="text-3xl font-semibold underline pb-10">Our goal</h2>
                    <div className="w-4/5 border-2 border-amber-500 h-fit rounded-xl text-justify">
                        <p className="text-gray-200 font-semibold py-6 px-12 font-xl">In a world where your digital footprint can feel like a shadow you can't escape, VanishHive is here to light the way. We believe that staying safe online isn't just about protection – it's about empowerment. With the right tools and knowledge, you can take control of your digital life, one step at a time. Our goal? To make cybersecurity not just a necessity, but a superpower.</p>
                    </div>
                </div>
                <News />
                <div className="w-4/5 mx-auto">
                    <h2 className="text-4xl font-semibold underline pt-5 pb-5 text-center" id="tools">Tools</h2>
                    <div className="h-50 w-4/5 rounded-xl border-3 border-amber-400 flex justify-between my-5 mx-auto p-5">
                        <div>
                            <h3 className="text-2xl font-semibold">Metadata removal</h3>
                            <p className="">See metadata associated with a file you upload and delete it</p>
                            <Link href="/metadata">
                                <input type="button" value="Try it out" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-600 transition-all hover:bg-amber-600 hover:text-gray-900 hover:border-amber-600 mx-2 my-8" />
                            </Link>
                        </div>
                        <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/6d8bcb31446bbf8300cbb1168279d4acf6b94e67_image.png" alt="" className="rounded-lg" />
                    </div>
                    <div className="h-50 w-4/5 rounded-xl border-3 border-amber-400 flex justify-between my-5 mx-auto p-5">
                        <div>
                            <h3 className="text-2xl font-semibold">AI cybersecurity training</h3>
                            <p className="">Get cybersecurity advice and assistance from our AI helper</p>
                            <Link href="https://github.com/BudzioT/BKIhack/releases/tag/extension">
                                <input type="button" value="Get browser extension" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-600 transition-all hover:bg-amber-600 hover:text-gray-900 hover:border-amber-600 mx-2 my-8" />
                            </Link>
                        </div>
                        <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/ff56aab2ef26dfd42aaad1d5aff9b44feaf4bd17_image__3_.png" alt="" className="rounded-lg" />
                    </div>
                    <div className="h-50 w-4/5 rounded-xl border-3 border-amber-400 flex justify-between my-5 mx-auto p-5">
                        <div>
                            <h3 className="text-2xl font-semibold">Virus scanner</h3>
                            <p className="">Protect yourself by checking files and urls for viruses</p>
                            <Link href="/virustotal">
                            <input type="button" value="Try it out" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-600 transition-all hover:bg-amber-600 hover:text-gray-900 hover:border-amber-600 mx-2 my-8" />
                            </Link>
                        </div>
                        <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/62fbd1500d63a7c28b44c110a3b2a611b7858995_image.png" alt="" className="rounded-lg" />
                    </div>
                    <div className="h-50 w-4/5 rounded-xl border-3 border-amber-400 flex justify-between my-5 mx-auto p-5">
                        <div>
                            <h3 className="text-2xl font-semibold">E-mail checker</h3>
                            <p className="">Check e-mail for hamfull or spam contents</p>
                            <Link href="https://github.com/BudzioT/BKIhack/releases/tag/extension">
                                <input type="button" value="Get browser extension" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-600 transition-all hover:bg-amber-600 hover:text-gray-900 hover:border-amber-600 mx-2 my-8" />
                            </Link>
                        </div>
                        <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/a5692dc7162ff6718068e2c4eb7657db93034539_image__4_.png" alt="" className="rounded-lg" />
                    </div>
                    <div className="h-50 w-4/5 rounded-xl border-3 border-amber-400 flex justify-between my-5 mx-auto p-5">
                        <div>
                            <h3 className="text-2xl font-semibold">Password strengh checker and generator</h3>
                            <p className="">Check the strength of your password and generate new ones</p>
                            <Link href="/pass">
                            <input type="button" value="Try it out" className="w-fit px-4 py-2 rounded-4xl border-2 font-semibold bg-gray-900 cursor-pointer text-amber-600 transition-all hover:bg-amber-600 hover:text-gray-900 hover:border-amber-600 mx-2 my-8" />
                            </Link>
                        </div>
                        <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/74fa205892d759a0275d77d2197919a34d73597a_image.png" alt="" className="rounded-lg" />
                    </div>
                </div>
            </main>
            
            {isVisible && 
                <div className="fixed right-6 bottom-1/5 mb-5 bg-gray-800 h-2/3 w-1/3 sm:w-96 rounded-xl shadow-lg border-2 border-amber-400 overflow-hidden flex flex-col z-2">
                    <div className="bg-amber-500 text-white p-3 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">VanishHive AI Assistant</h2>
                        <button 
                            onClick={toggleIsVisible}
                            className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="flex-1 bg-gray-700 p-3 overflow-y-auto">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-lg max-w-3/4 ${
                                    msg.role === 'user' ? 'bg-gray-600 text-white' : 'bg-amber-400 text-gray-900'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-center py-2">
                                <span className="text-gray-300">Thinking...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-2 bg-gray-800 border-t border-gray-700">
                        <div className="flex">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask about cybersecurity..."
                                className="flex-1 p-2 rounded-l-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-amber-400"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !userInput.trim()}
                                className={`px-4 py-2 rounded-r-lg ${
                                    isLoading || !userInput.trim() 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
                                } text-white`}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            }
            
            <div className="artboard">
                <div className="beeShadow">
                    <div className="beeContainer cursor-pointer" onClick={toggleIsVisible}>
                        <div className="cross c1"></div>
                        <div className="cross c2"></div>
                        <div className="circle c1"></div>
                        <div className="circle c2"></div>
                        <div className="circle c3"></div>
                        <div className="circle c4"></div>
                        <div className="circle c5"></div>
                        <div className="circle c6"></div>
                        <div className="beeBody">
                            <div className="beeEyes"></div>
                            <div className="beeMouth">
                                <div className="beeTongue"></div>
                            </div>
                            <div className="beeStrips"></div>
                        </div>
                        <div className="beeAntenna1"></div>
                        <div className="beeAntenna2"></div>
                        <div className="beeWings1"></div>
                        <div className="beeWings2"></div>
                        <div className="beeTail"></div>
                    </div>
                </div>
            </div>
        </>
    );
}