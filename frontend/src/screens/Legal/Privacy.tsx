import React from "react";
import { Link } from "../../router";

const Privacy: React.FC = () => {
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
                <h1 className="font-questrial text-4xl text-accent-green mb-8">Privacy Policy</h1>

                <div className="space-y-6 font-questrial text-light/80">
                    <p>Last updated: January 29, 2026</p>

                    <h2 className="text-2xl text-light mt-6">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, profile picture, and other information you choose to provide.
                    </p>

                    <h2 className="text-2xl text-light mt-6">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, such as to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Facilitate the creation of and secure your account.</li>
                        <li>Process your requests and transactions.</li>
                        <li>Perform internal operations, including to preventing fraud and abuse of our Services.</li>
                        <li>Send you communications we think will be of interest to you.</li>
                    </ul>

                    <h2 className="text-2xl text-light mt-6">3. Sharing of Information</h2>
                    <p>
                        We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>With third party service providers to provide the necessary hardware, software, networking, storage, and related technology required to run the Service.</li>
                        <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.</li>
                    </ul>

                    <h2 className="text-2xl text-light mt-6">4. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
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

export default Privacy;
