import Link from "next/link";

const footerLinks = ["About", "Privacy", "Terms", "Contact", "Help"];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link className="text-lg font-semibold tracking-[0.24em]" href="/">
            LuxeStore
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-300">
            Curated luxury fashion, polished essentials, and refined seasonal edits.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a className="text-sm text-neutral-300 transition hover:text-white" href="#" key={link}>
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
