import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Worknoon chat",
  description: "Frontend  project",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster/>
        {children}</body>
    </html>
  );
}
