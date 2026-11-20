import "./style.css";

export const metadata = { title: "Fieldwork — Course catalog", description: "Practical courses for creative minds." };

export default function Layout({ children }) {
    return <html lang="en"><body>{children}</body></html>;
}
