import { useState, useEffect } from 'react';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-surface-950 text-surface-0' : 'bg-surface-0 text-surface-900'} transition-colors duration-300`}>
            <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
                            } transition-colors`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-3 rounded-full transition-colors ${darkMode
                            ? 'bg-surface-800 text-yellow-400 hover:bg-surface-700'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                            }`}
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Hero Section */}
                <div className="max-w-3xl mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-6">
                        About Jamie, Look That Up
                    </h1>
                    <p className={`text-xl leading-relaxed ${darkMode ? 'text-surface-300' : 'text-surface-600'}`}>
                        The ultimate conversation wingman. Say "Jamie, Look That Up" to search on command,
                        or let Jamie passively monitor and push relevant facts, sources, and citations in real-time.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* How It Works */}
                    <div className={`p-8 rounded-2xl ${darkMode ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-surface-100' : 'text-surface-800'}`}>
                            How It Works
                        </h2>
                        <ul className="space-y-4">
                            {[
                                { title: 'Voice Transcription', desc: 'Speak naturally and Jamie transcribes in real-time' },
                                { title: 'Keyword Extraction', desc: 'Key concepts are automatically identified for deeper research' },
                                { title: 'AI Analysis', desc: 'Get instant insights, connections, and thematic analysis' },
                                { title: 'Source Citations', desc: 'Explore authoritative references from .edu, .gov, and academic sources' },
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-600'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className={`font-semibold ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
                                            {item.title}
                                        </h3>
                                        <p className={`text-sm ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Built With */}
                    <div className={`p-8 rounded-2xl ${darkMode ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-surface-100' : 'text-surface-800'}`}>
                            Built With
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
                                    AI & Backend
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Google Gemini', 'Firebase', 'Cloud Functions'].map((tech) => (
                                        <span key={tech} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-surface-800 text-surface-300' : 'bg-surface-100 text-surface-600'
                                            }`}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
                                    Frontend
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'].map((tech) => (
                                        <span key={tech} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-surface-800 text-surface-300' : 'bg-surface-100 text-surface-600'
                                            }`}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
                                    Search
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Google Custom Search API', 'Web Speech API'].map((tech) => (
                                        <span key={tech} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-surface-800 text-surface-300' : 'bg-surface-100 text-surface-600'
                                            }`}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`text-center pt-8 border-t ${darkMode ? 'border-surface-800' : 'border-surface-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
                        © {new Date().getFullYear()} Jamie, Look That Up. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
