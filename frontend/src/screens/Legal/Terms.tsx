import React from "react";
import { Link } from "../../router";

const Terms: React.FC = () => {
    return (
        <div className="h-screen bg-dark-950 text-light flex flex-col items-center justify-start p-8 overflow-y-auto no-scrollbar">
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="max-w-3xl w-full bg-dark-900/50 backdrop-blur-sm border border-accent-green/30 rounded-2xl p-10 shadow-[0_0_40px_rgba(183,242,114,0.1)]">
                <h1 className="font-questrial text-4xl text-accent-green mb-8">Terms of Service</h1>

                <div className="space-y-6 font-questrial text-light/80">
                    <p>Last updated: January 29, 2026</p>

                    <h2 className="text-2xl text-light mt-6">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using PongRush ("the Service"), you agree to comply with and be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our Service.
                    </p>

                    <h2 className="text-2xl text-light mt-6">2. User Conduct</h2>
                    <p>
                        You agree not to misuse the Service or help anyone else do so. You agree not to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Probe, scan, or test the vulnerability of any system or network.</li>
                        <li>Breach or otherwise circumvent any security or authentication measures.</li>
                        <li>Interfere with or disrupt any user, host, or network, for example by sending a virus, overloading, flooding, spamming, or mail-bombing any part of the Service.</li>
                    </ul>

                    <h2 className="text-2xl text-light mt-6">3. Accounts</h2>
                    <p>
                        You are responsible for safeguarding your account credential and for any activity resulting from the use of your account.
                    </p>

                    <h2 className="text-2xl text-light mt-6">4. Termination</h2>
                    <p>
                        We may suspend or terminate your access to the Service at any time, with or without cause or notice.
                    </p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                    <Link to="/signup" className="text-accent-green hover:text-accent-green/80 transition-colors font-semibold">
                        Back to Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
