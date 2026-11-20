"use client";
import { useEffect, useRef } from "react";

export const categories = ["Development", "Design", "Branding", "Other"];
const defaults = { Development: "creative-coding", Design: "interface-design", Branding: "visual-identity" };
export const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);

export function Cover({ course }) {
    const fallback = "/covers/" + (defaults[course.category] || "creative-coding") + ".jpg";
    return <img src={course.imageUrl || fallback} alt="" onError={e => { if (e.currentTarget.getAttribute("src") !== fallback) e.currentTarget.src = fallback; }} />;
}

export function Icon({ name, size = 18 }) {
    const paths = {
        book: <><path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1z"/><path d="M12 6v14"/></>,
        search: <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></>,
        close: <path d="m6 6 12 12M18 6 6 18"/>,
        layers: <><path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
        ticket: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 8v8"/></>
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Modal({ title, close, children }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        el.showModal();
        return () => el.close();
    }, []);
    return <dialog ref={ref} aria-label={title} onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}>
        <div className="modal"><div className="modalTop"><h2>{title}</h2><button className="iconBtn" aria-label="Close dialog" onClick={close}><Icon name="close"/></button></div>{children}</div>
    </dialog>;
}
