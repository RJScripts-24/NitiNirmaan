import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Network, Play, ShieldAlert } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* NAVBAR */}
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link className="flex items-center justify-center font-bold text-xl" href="#">
                    <Network className="h-6 w-6 mr-2 text-primary" />
                    NitiNirmaan
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        How it Works
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        The Common LFA
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        Success Stories
                    </Link>
                </nav>
                <div className="ml-4 flex gap-2">
                    <Button variant="ghost" size="sm">Log In</Button>
                    <Button size="sm">Start Building</Button>
                </div>
            </header>

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-grid-slate-50 relative overflow-hidden">
                    <div className="container px-4 md:px-6 z-10 relative">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Stop Writing Documents.<br />Start Building Systems.
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                    The first gamified Logical Framework Architect for the Shikshagraha network.
                                    Turn your program design into a living, breathing simulation.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button size="lg" className="px-8">
                                    Enter The Simulator <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="lg">
                                    Watch Demo
                                </Button>
                            </div>
                        </div>
                        {/* Visual Asset Placeholder - Replicating the "Infinite Canvas" vibe */}
                        <div className="mt-14 mx-auto max-w-5xl aspect-video bg-slate-100 rounded-xl border shadow-2xl flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                            {/* Mock Nodes */}
                            <div className="absolute top-1/3 left-1/4 bg-white p-4 rounded shadow-lg border-2 border-blue-500 animate-pulse">
                                <div className="font-bold text-sm">Teacher Training</div>
                                <div className="text-xs text-gray-500">Input: High Cost</div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 bg-white p-4 rounded shadow-lg border-2 border-green-500">
                                <div className="font-bold text-sm">Improved Pedagogy</div>
                                <div className="text-xs text-gray-500">Outcome: Practice Change</div>
                            </div>
                            {/* Connection Line */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <path d="M 300 200 C 400 200, 400 300, 500 300" stroke="#94a3b8" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            </svg>
                            <div className="text-slate-400 font-medium z-10 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                Interactive Impact Canvas Preview
                            </div>
                        </div>
                    </div>
                </section>

                {/* KEY FEATURES */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Gamified Program Design</h2>
                                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                    We replaced the boring checklist with a city-builder style engine.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <Card className="h-full border-2 border-slate-100 hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg">
                                <CardHeader>
                                    <Network className="h-10 w-10 text-blue-600 mb-2" />
                                    <CardTitle>Visual Logic Builder</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500">
                                        Drag-and-drop Stakeholders and Interventions. Connect them to see the flow of impact physically, not just conceptually.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="h-full border-2 border-slate-100 hover:border-green-500 transition-all cursor-pointer hover:shadow-lg">
                                <CardHeader>
                                    <Play className="h-10 w-10 text-green-600 mb-2" />
                                    <CardTitle>Pre-Mortem Simulator</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500">
                                        Run the "Boss Battle" before you export. The system stresses your design: "Teacher Burnout Detected! Simulation Failed."
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="h-full border-2 border-slate-100 hover:border-purple-500 transition-all cursor-pointer hover:shadow-lg">
                                <CardHeader>
                                    <Bot className="h-10 w-10 text-purple-600 mb-2" />
                                    <CardTitle>AI Socratic Coach</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500">
                                        Our AI doesn't write for you. It challenges you. "You connected Activity to Outcome—where is the Practice Change?"
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* SOCIAL PROOF */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
                    <div className="container px-4 md:px-6">
                        <h3 className="text-center text-xl font-bold text-slate-400 mb-8 tracking-widest uppercase">
                            Trusted by 150+ Organizations
                        </h3>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholders for Partner Logos */}
                            <div className="flex items-center space-x-2 font-bold text-2xl">
                                <div className="h-8 w-8 bg-black rounded-full"></div>
                                <span>Shikshagraha</span>
                            </div>
                            <div className="flex items-center space-x-2 font-bold text-2xl">
                                <div className="h-8 w-8 bg-red-600 rounded-full"></div>
                                <span>Pratham</span>
                            </div>
                            <div className="flex items-center space-x-2 font-bold text-2xl">
                                <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
                                <span>Akshara</span>
                            </div>
                            <div className="flex items-center space-x-2 font-bold text-2xl">
                                <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
                                <span>Kaivalya</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 NitiNirmaan. Built for Shikshagraha.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
                </nav>
            </footer>
        </div>
    );
}
