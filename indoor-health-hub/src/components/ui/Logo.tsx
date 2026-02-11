import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-10 h-10 text-cyan-400", className)}
        >
            {/* House Outline - Modern & Minimal */}
            <path
                d="M50 10 L85 40 V90 H15 V40 L50 10Z"
                className="stroke-cyan-500/50 fill-cyan-900/10"
                strokeWidth="3"
            />

            {/* Lungs - Stylized Tech */}
            {/* Left Lung */}
            <path d="M35 45 C25 45 20 55 20 70 C20 80 28 85 35 85 C42 85 45 75 45 65 L45 55 Z" className="stroke-cyan-400 fill-cyan-400/20" />
            {/* Right Lung */}
            <path d="M65 45 C75 45 80 55 80 70 C80 80 72 85 65 85 C58 85 55 75 55 65 L55 55 Z" className="stroke-cyan-400 fill-cyan-400/20" />

            {/* Trachea */}
            <path d="M50 45 V35" className="stroke-cyan-300" strokeWidth="3" />

            {/* Circuit Nodes/Traces inside Lungs - Representing Intelligence */}
            <circle cx="35" cy="65" r="2" className="fill-cyan-200 animate-pulse" />
            <circle cx="65" cy="65" r="2" className="fill-cyan-200 animate-pulse" />
            <path d="M35 65 L28 75" className="stroke-cyan-500/60" strokeWidth="1" />
            <path d="M65 65 L72 75" className="stroke-cyan-500/60" strokeWidth="1" />
            <path d="M35 55 L40 60" className="stroke-cyan-500/60" strokeWidth="1" />
            <path d="M65 55 L60 60" className="stroke-cyan-500/60" strokeWidth="1" />

            {/* Small floating icons (simulated) */}
            <circle cx="85" cy="25" r="3" className="fill-green-400/80" /> {/* Nature/Leaf node */}
            <circle cx="15" cy="25" r="3" className="fill-red-400/80" />   {/* Health/Heart node */}
        </svg>
    );
};
