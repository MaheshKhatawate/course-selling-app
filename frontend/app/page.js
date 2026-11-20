"use client";

import { useEffect, useState } from "react";
import Hero from "./hero";
import { categories, Cover, Icon, Modal, money } from "./ui";

async function request(path, session, method = "GET", body) {
    const headers = {};
    if (session) headers.Authorization = "Bearer " + session.token;
    if (body) headers["Content-Type"] = "application/json";
    const res = await fetch("/api" + path, { method, headers, cache: "no-store", body: body && JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || "The API is unavailable. Please try again.");
        error.status = res.status;
        throw error;
    }
    return data;
}

export default function Home() {
    const [session, setSession] = useState(null);
    const [tab, setTab] = useState("Catalog");
    const [courses, setCourses] = useState([]);
    const [owned, setOwned] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [version, refresh] = useState(0);
    const [query, search] = useState("");
    const [category, filter] = useState("All courses");
    const [modal, setModal] = useState(null);
    const [role, setRole] = useState("user");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        try { setSession(JSON.parse(sessionStorage.getItem("fieldwork"))); } catch { sessionStorage.removeItem("fieldwork"); }
    }, []);
    function saveSession(value) {
        if (value) sessionStorage.setItem("fieldwork", JSON.stringify(value));
        else sessionStorage.removeItem("fieldwork");
        setSession(value);
    }
    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError("");
        async function load() {
            const [catalog, account] = await Promise.all([
                request("/course/preview"),
                session ? request(session.role === "admin" ? "/admin/course/bulk" : "/user/purchases", session) : null
            ]);
            if (!active) return;
            setCourses(catalog.courses);
            setOwned(account?.coursesData || account?.courses || []);
        }
        load().catch(err => {
            if (!active) return;
            if (err.status === 401 && session) {
                saveSession(null); setTab("Catalog"); setNotice("Your session expired. Sign in again.");
            } else setLoadError(err.message);
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [session, version]);

    function open(kind, course) { setModal({ kind, course }); setError(""); setNotice(""); }
    function navigate(next) { setTab(next); search(""); filter("All courses"); setNotice(""); }
    function close() { if (!busy) setModal(null); }
    async function act(fn) {
        setBusy(true); setError("");
        try { await fn(); }
        catch (err) { setError(err.message); }
        finally { setBusy(false); }
    }
    async function authenticate(e) {
        e.preventDefault();
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        await act(async () => {
            if (modal.kind === "signup") await request("/" + role + "/signup", null, "POST", fields);
            const data = await request("/" + role + "/signin", null, "POST", fields);
            saveSession({ ...data, role });
            navigate(role === "admin" ? "Studio" : "Catalog");
            setModal(modal.course && role === "user" ? { kind: "detail", course: modal.course } : null);
        });
    }
    async function purchase(course) {
        if (!session) { setRole("user"); open("signin", course); return; }
        await act(async () => {
            await request("/course/purchase", session, "POST", { courseId: course._id });
            navigate("Library"); setModal(null); refresh(v => v + 1); setNotice("Course added to your library.");
        });
    }
    async function saveCourse(e) {
        e.preventDefault();
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        fields.price = Number(fields.price);
        const id = modal.course?._id;
        if (id) fields.courseId = id;
        await act(async () => {
            await request(id ? "/admin/course" : "/admin/create", session, id ? "PUT" : "POST", fields);
            setModal(null); refresh(v => v + 1); setNotice(id ? "Changes saved." : "Course published.");
        });
    }
    async function archive(course) {
        await act(async () => {
            await request("/admin/course/" + course._id, session, "DELETE");
            setModal(null); refresh(v => v + 1); setNotice("Course removed from catalog.");
        });
    }

    const catalog = tab === "Catalog";
    const source = catalog ? courses : owned;
    const matches = source.filter(c => (category === "All courses" || (c.category || "Other") === category) &&
        (c.title + " " + c.description).toLowerCase().includes(query.trim().toLowerCase()));
    const activeCourse = modal?.course;
    const purchased = session?.role === "user" && owned.some(c => c._id === activeCourse?._id);
    const auth = modal?.kind === "signin" || modal?.kind === "signup";
    return <>
        <header><div className="bar"><a className="brand" href="#" onClick={() => navigate("Catalog")}><img alt="" src="/icon.svg"/>Fieldwork</a>
        <nav><button className={catalog ? "nav active" : "nav"} onClick={() => navigate("Catalog")}>Catalog</button>
        {session && <button className={!catalog ? "nav active" : "nav"} onClick={() => navigate(session.role === "admin" ? "Studio" : "Library")}>{session.role === "admin" ? "Instructor studio" : "My library"}</button>}</nav>
        <div className="account">{session ? <><span>{session.firstName}</span><button className="outline" onClick={() => { saveSession(null); setOwned([]); navigate("Catalog"); }}>Sign out</button></> :
        <><button className="plain" onClick={() => open("signin")}>Sign in</button><button className="dark" onClick={() => open("signup")}>Get started</button></>}</div></div></header>
        <main>{catalog && <Hero/>}
        <section id="collection" className="collection"><div className="sectionHead"><div>
        <div className="kicker"><Icon name="layers" size={16}/>{catalog ? "The collection" : tab === "Studio" ? "Instructor workspace" : "Your collection"}</div>
        <h2>{catalog ? "Course catalog" : tab === "Studio" ? "Instructor studio" : "My library"}</h2></div>
        {tab === "Studio" ? <button className="dark" onClick={() => open("edit")}>Create course</button> :
        <label className="search"><Icon name="search"/><input type="search" aria-label="Search courses" placeholder="Search courses" value={query} onChange={e => search(e.target.value)}/></label>}</div>
        {catalog && <div className="filters">{["All courses", ...categories.filter(c => c !== "Other" || courses.some(x => (x.category || "Other") === c))].map(c =>
            <button key={c} aria-pressed={category === c} onClick={() => filter(c)}>{c}</button>)}</div>}
        {notice && <p role="status" className="notice">{notice}</p>}
        {loading ? <p role="status">Loading courses…</p> : loadError ? <p role="alert">{loadError} <button className="outline" onClick={() => refresh(v => v + 1)}>Retry</button></p> :
        matches.length ? <div className="grid">{matches.map(c => <button key={c._id} className="card" onClick={() => open("detail", c)}>
            <div className="cover"><Cover course={c}/></div><div className="cardBody"><div className="meta"><span className={'tag ' + (c.category || "Other")}>{c.category || "Other"}</span><span className="price">{money(c.price)}</span></div>
            <h3>{c.title}</h3><p>{c.description}</p></div></button>)}</div> :
        <div className="empty"><Icon name="book" size={30}/><h3>{source.length ? "No matching courses" : tab === "Library" ? "Your library is ready" : "No courses yet"}</h3>
        <p>{source.length ? "Try a different search or category." : tab === "Library" ? "Explore the catalog to find your first course." : tab === "Studio" ? "Create your first course to publish it in the catalog." : "Published courses will appear here."}</p>{tab === "Library" && !source.length && <button className="dark" onClick={() => navigate("Catalog")}>Explore catalog</button>}</div>}
        </section></main>
        <footer><span className="footerBrand">Fieldwork</span><span>Independent course studio</span></footer>
        {modal && <Modal key={modal.kind} close={close} title={auth ? modal.kind === "signup" ? "Create your account" : "Welcome back" : modal.kind === "edit" ? activeCourse ? "Edit course" : "Create course" : modal.kind === "archive" ? "Remove course?" : activeCourse.title}>
        {auth ? <form onSubmit={authenticate}><label>Account type<select value={role} onChange={e => setRole(e.target.value)}><option value="user">Learner</option><option value="admin">Instructor</option></select></label>
        {modal.kind === "signup" && <div className="pair"><label>First name<input required name="firstName" autoComplete="given-name" maxLength={80}/></label><label>Last name<input required name="lastName" autoComplete="family-name" maxLength={80}/></label></div>}
        <label>Email<input required type="email" name="email" autoComplete="email"/></label><label>Password<input required type="password" name="password" minLength={modal.kind === "signup" ? 8 : 1} autoComplete={modal.kind === "signup" ? "new-password" : "current-password"}/></label>
        <button disabled={busy} className="dark">{modal.kind === "signup" ? "Create account" : "Sign in"}</button><button type="button" className="textBtn" disabled={busy} onClick={() => open(modal.kind === "signup" ? "signin" : "signup", activeCourse)}>{modal.kind === "signup" ? "Already registered? Sign in" : "New to Fieldwork? Create an account"}</button></form> :
        modal.kind === "edit" ? <form onSubmit={saveCourse}><label>Title<input name="title" required maxLength={140} defaultValue={activeCourse?.title}/></label><label>Description<textarea name="description" required maxLength={4000} rows={4} defaultValue={activeCourse?.description}/></label>
        <div className="pair"><label>Category<select name="category" defaultValue={activeCourse?.category || "Development"}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Price (USD)<input type="number" min="0" max="1000000" step=".01" required name="price" defaultValue={activeCourse?.price}/></label></div>
        <label>Cover URL (optional)<input type="url" name="imageUrl" defaultValue={activeCourse?.imageUrl} placeholder="https://…"/></label>
        <button className="dark" disabled={busy}>{activeCourse ? "Save changes" : "Publish course"}</button></form> :
        modal.kind === "archive" ? <><p>Remove “{activeCourse.title}” from the catalog? Enrolled learners will keep it in their libraries.</p><button className="dark" disabled={busy} onClick={() => archive(activeCourse)}>Remove from catalog</button></> :
        <><div className="detailArt"><Cover course={activeCourse}/></div><div className="meta"><span className="tag">{activeCourse.category || "Other"}</span><b>{money(activeCourse.price)}</b></div><p className="description">{activeCourse.description}</p>
        {tab === "Studio" ? <div className="actions"><button className="dark" onClick={() => open("edit", activeCourse)}>Edit course</button><button className="outline" onClick={() => open("archive", activeCourse)}>Remove course</button></div> :
        purchased ? <p className="notice">In your library</p> : session?.role !== "admin" && <><p className="muted">Demo purchase · No payment required</p><button className="dark" disabled={busy} onClick={() => purchase(activeCourse)}>{session ? "Confirm enrollment" : "Sign in to enroll"}</button></>}</>}
        {error && <p className="error" role="alert">{error}</p>}</Modal>}
    </>;
}
