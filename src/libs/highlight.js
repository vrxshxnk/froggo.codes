// Build-time syntax highlighting (runs only in server components)
import { createHighlighter } from "shiki";

let highlighterPromise;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["github-dark-default"],
    langs: ["python", "cpp", "java", "javascript", "text"],
  });
  return highlighterPromise;
}

export async function highlight(code, lang = "text") {
  const highlighter = await getHighlighter();
  const language = highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
  return highlighter.codeToHtml(code, { lang: language, theme: "github-dark-default" });
}
