// Server-rendered markdown for walkthroughs and primers, styled to match the
// roadmap (no typography plugin), with build-time highlighted code blocks.
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlight } from "@/libs/highlight";

export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_"'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const textOf = (children) =>
  Array.isArray(children)
    ? children.map(textOf).join("")
    : typeof children === "object" && children?.props
      ? textOf(children.props.children)
      : String(children ?? "");

async function CodeBlock({ code, lang }) {
  const html = await highlight(code, lang);
  return (
    <div
      className="code-block my-5 overflow-hidden rounded-lg border border-white/10 text-[13px] leading-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const components = {
  h2: ({ children }) => (
    <h2
      id={slugifyHeading(textOf(children))}
      className="mt-12 scroll-mt-24 text-xl font-black text-white md:text-2xl"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg font-black text-emerald-100">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 leading-7 text-white/80">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-white/80 marker:text-emerald-300/70">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-white/80 marker:font-bold marker:text-emerald-300/80">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-white/90">{children}</em>,
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="font-semibold text-emerald-300 underline-offset-4 hover:underline">
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 underline-offset-4 hover:underline">
        {children}
      </a>
    ),
  blockquote: ({ children }) => (
    <blockquote className="mt-5 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.06] px-4 py-1 pb-4 text-emerald-50/90 [&_p]:text-emerald-50/90">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-5 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.05] text-white">{children}</thead>,
  th: ({ children }) => <th className="whitespace-nowrap px-3 py-2.5 font-bold">{children}</th>,
  td: ({ children }) => <td className="border-t border-white/10 px-3 py-2.5 align-top text-white/80">{children}</td>,
  code: ({ children }) => (
    <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.88em] text-emerald-100">{children}</code>
  ),
  pre: ({ node }) => {
    const codeNode = node?.children?.[0];
    const className = codeNode?.properties?.className?.[0] || "";
    const lang = className.replace("language-", "") || "text";
    const code = (codeNode?.children || []).map((c) => c.value || "").join("").replace(/\n$/, "");
    return <CodeBlock code={code} lang={lang} />;
  },
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}

// Level-2 headings, for the "On this page" list
export function headingsOf(markdown) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((m) => {
    const text = m[1].replace(/[`*]/g, "");
    return { text, id: slugifyHeading(text) };
  });
}
