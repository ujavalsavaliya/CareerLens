import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative z-10 bg-bg-dark border-t border-white/5 pt-20 pb-10 px-6">
            <div className="max-w-[1260px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-display font-black tracking-tight text-text-primary">
                                Career<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Lens</span>
                            </span>
                        </Link>
                        <p className="text-text-secondary leading-relaxed max-w-sm text-sm">
                            The AI-powered career platform designed for the modern job seeker and recruiter. 
                            Build your future with GPT-4o intelligence and real-time skill mapping.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:-translate-y-1 transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links - Platform */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link to="/jobs" className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">Browse Jobs <ArrowUpRight size={12} /></Link></li>
                            <li><Link to="/premium" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Premium Plans</Link></li>
                            <li><Link to="/ai-feedback" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">AI Feedback</Link></li>
                            <li><Link to="/signup?role=hr" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">For Employers</Link></li>
                        </ul>
                    </div>

                    {/* Links - Company */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">About Us</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Careers</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Blog</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Contact</a></li>
                        </ul>
                    </div>

                    {/* Links - Legal */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Privacy Policy</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Terms of Service</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Cookie Policy</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-start gap-6">
                    <p className="text-text-muted text-xs font-medium">
                        © {new Date().getFullYear()} CareerLens. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
