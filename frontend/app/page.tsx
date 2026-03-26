"use client";

import {useState} from "react";

/*main function */
export default function LoginPage() {
    const [email, setEmail] = useState("");   /* stores email */
    const [password, setPassword] = useState(""); /* stores password */

    /* function when login button is clicked */
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); 
        alert(`Email: ${email}\nPassword: ${password}`);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

                <h1 className="text-2xl font-bold mb-6 text-center">DegreePath Login</h1>

                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input 
                        type="email"
                        placeholder="Enter your email"
                        className="w-full border px-3 py-2 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                    </div>
                   
                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input 
                        type="password"
                        placeholder="Enter your password"
                        className="w-full border px-3 py-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        />
                    </div>
                    
                    <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        Login 
                        </button>
                </form>

                <p className="text-sm text-center mt-4"> Don't have an account? Sign up</p>
            </div>
        </div>
    );
}

