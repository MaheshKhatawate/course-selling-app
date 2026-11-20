"use client";
import { useEffect, useRef } from "react";

export default function Hero() {
    const ref = useRef(null);
    useEffect(() => {
        const ctx = ref.current.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, 960, 590);
        for (let row = 0; row < 110; row++) {
            const h = row / 109;
            ctx.beginPath();
            for (let step = 0; step <= 240; step++) {
                const t = step / 240 * 2 * Math.PI;
                const r = 174 + 45 * Math.cos(3 * t + h * 4.5) + 37 * Math.sin(h * Math.PI * 2);
                const x = 478 + r * 1.37 * Math.cos(t) + 100 * (h - .5);
                const y = 146 + r * .47 * Math.sin(t) + h * 292 - (x - 478) * .32;
                if (!step) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(195,238,136,' + (.47 + .42 * h) + ')';
            ctx.lineWidth = 1.35;
            ctx.stroke();
        }
    }, []);
    return <section className="hero">
        <div className="heroCopy"><div className="eyebrow"><i/> Independent course studio</div>
        <h1>Learn by <em>making.</em></h1>
        <p>Hands-on courses in code, design, and visual identity for people who learn by doing.</p>
        <a className="lime button" href="#collection"><span>Explore courses</span><IconBook/></a></div>
        <div className="heroArt"><canvas aria-hidden="true" width="960" height="590" ref={ref}/></div>
    </section>;
}
function IconBook() {
    return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14"/></svg>;
}
