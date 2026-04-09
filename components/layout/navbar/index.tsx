import Link from "next/link";

const portfolioLinks = [
  { title: "Home", path: "/" },
  { title: "Projects", path: "/projects" },
];

export async function Navbar() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200/60 bg-white/80 p-4 backdrop-blur-lg lg:px-6 dark:border-neutral-800/60 dark:bg-neutral-900/80">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              NT
            </span>
            <span className="ml-2 hidden rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline-block">
              Portfolio
            </span>
          </Link>
          <ul className="flex items-center gap-6 text-sm">
            {portfolioLinks.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline dark:text-neutral-300 dark:hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:nacho.tsvetkov@gmail.com"
            className="hidden text-neutral-500 transition-colors hover:text-neutral-900 sm:block dark:text-neutral-400 dark:hover:text-white"
            aria-label="Email"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
              <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/nachotsvetkov"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-neutral-500 transition-colors hover:text-neutral-900 sm:block dark:text-neutral-400 dark:hover:text-white"
            aria-label="LinkedIn"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </a>
          <a
            href="https://x.com/nachotsvetkov"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-neutral-500 transition-colors hover:text-neutral-900 sm:block dark:text-neutral-400 dark:hover:text-white"
            aria-label="X"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
