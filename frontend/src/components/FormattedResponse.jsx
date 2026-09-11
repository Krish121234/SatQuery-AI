import React from "react";

/**
 * Helper to render inline formatting (bold, italic, code, percentages)
 */
function renderInlineText(text) {
  if (!text) return null;

  // Pattern matching: code (`...`), bold (**...** or __...__), italic (*...* or _..._), percentages (59.4%)
  // We tokenize the string cleanly
  const tokens = [];
  let remaining = text;

  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|\b\d+(?:\.\d+)?%)/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchStr = match[0];

    // Text before match
    if (matchIndex > lastIndex) {
      tokens.push({
        type: "text",
        value: text.substring(lastIndex, matchIndex),
      });
    }

    if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
      tokens.push({
        type: "code",
        value: matchStr.slice(1, -1),
      });
    } else if (
      (matchStr.startsWith("**") && matchStr.endsWith("**")) ||
      (matchStr.startsWith("__") && matchStr.endsWith("__"))
    ) {
      tokens.push({
        type: "bold",
        value: matchStr.slice(2, -2),
      });
    } else if (
      (matchStr.startsWith("*") && matchStr.endsWith("*")) ||
      (matchStr.startsWith("_") && matchStr.endsWith("_"))
    ) {
      tokens.push({
        type: "italic",
        value: matchStr.slice(1, -1),
      });
    } else if (/\b\d+(?:\.\d+)?%/.test(matchStr)) {
      tokens.push({
        type: "pct",
        value: matchStr,
      });
    } else {
      tokens.push({
        type: "text",
        value: matchStr,
      });
    }

    lastIndex = matchIndex + matchStr.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.substring(lastIndex),
    });
  }

  return tokens.map((token, index) => {
    switch (token.type) {
      case "bold":
        return (
          <strong key={index} className="font-semibold text-[#313647]">
            {token.value}
          </strong>
        );
      case "italic":
        return (
          <em key={index} className="italic text-[#435663]/90">
            {token.value}
          </em>
        );
      case "code":
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-[#e2e0d6]/50 text-[#313647] font-mono text-xs font-semibold"
          >
            {token.value}
          </code>
        );
      case "pct":
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#A3B087]/15 text-[#303c1c] font-mono text-[0.88em] font-bold mx-0.5 align-baseline"
          >
            {token.value}
          </span>
        );
      default:
        return <span key={index}>{token.value}</span>;
    }
  });
}

/**
 * FormattedResponse — converts markdown & AI telemetry reports into
 * clean, readable, executive Earth Observation reports with high visual hierarchy.
 */
export default function FormattedResponse({ text, className = "" }) {
  if (!text) return null;

  const cleanText = text.trim();
  const blocks = cleanText.split(/\n\s*\n/);

  return (
    <div className={`space-y-3 text-[#435663] text-xs sm:text-sm leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // Code Block Check (e.g. ```asciigrid / json / coordinates)
        if (trimmedBlock.startsWith("```") && trimmedBlock.endsWith("```")) {
          const codeContent = trimmedBlock
            .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
            .replace(/\n?```$/, "");
          return (
            <div
              key={bIdx}
              className="my-2.5 rounded-lg bg-[#242b35] p-3 text-[#c2cfb4] font-mono text-xs overflow-x-auto border border-[#374151] shadow-inner"
            >
              <pre className="leading-relaxed whitespace-pre font-mono">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Horizontal Rule
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmedBlock)) {
          return (
            <hr
              key={bIdx}
              className="my-3 border-t border-[#e2e0d6] opacity-70"
            />
          );
        }

        const rawLines = trimmedBlock.split("\n");
        const lines = rawLines.map((l) => l.trim()).filter(Boolean);

        // Header Check (### 1. Title or **Title**:)
        if (
          lines.length === 1 &&
          (trimmedBlock.startsWith("###") ||
            trimmedBlock.startsWith("##") ||
            (trimmedBlock.startsWith("**") &&
              trimmedBlock.endsWith("**:") &&
              trimmedBlock.length < 90) ||
            (trimmedBlock.startsWith("**") &&
              trimmedBlock.endsWith("**") &&
              trimmedBlock.length < 80))
        ) {
          const title = trimmedBlock
            .replace(/^#+\s*/, "")
            .replace(/^\*\*/, "")
            .replace(/\*\*:?$/, "");

          return (
            <div
              key={bIdx}
              className="flex items-center gap-2 pt-2 pb-1 border-b border-[#e2e0d6]"
            >
              <span className="h-2 w-2 rounded-full bg-[#A3B087]" />
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#313647]">
                {title}
              </h5>
            </div>
          );
        }

        // List Check: lines with bullet markers or numbers
        const hasListItems = lines.some((l) =>
          /^([•\-\*]|\d+[\.\)])\s+/.test(l)
        );

        if (hasListItems) {
          return (
            <div key={bIdx} className="space-y-1.5">
              {rawLines.map((rawLine, lIdx) => {
                const line = rawLine.trim();
                if (!line) return null;

                const isNested = /^\s{2,}/.test(rawLine);
                const isBullet = /^([•\-\*]|\d+[\.\)])\s+/.test(line);

                if (isBullet) {
                  const content = line.replace(/^([•\-\*]|\d+[\.\)])\s+/, "");
                  return (
                    <div
                      key={lIdx}
                      className={`flex items-start gap-2.5 ${
                        isNested ? "pl-5 text-xs" : "pl-1"
                      }`}
                    >
                      <span
                        className={`rounded-full bg-[#A3B087] flex-shrink-0 ${
                          isNested
                            ? "mt-2 h-1 w-1 bg-[#A3B087]/70"
                            : "mt-1.5 h-1.5 w-1.5"
                        }`}
                      />
                      <div className="flex-1 text-[#435663]">
                        {renderInlineText(content)}
                      </div>
                    </div>
                  );
                }

                // Subheader inside mixed block
                if (
                  line.startsWith("**") &&
                  (line.endsWith("**:") || line.endsWith("**:"))
                ) {
                  const subTitle = line.replace(/\*\*/g, "").replace(/:$/, "");
                  return (
                    <div
                      key={lIdx}
                      className="flex items-center gap-2 pt-2 pb-0.5 border-b border-[#e2e0d6]/70"
                    >
                      <span className="h-1.5 w-1.5 rounded-sm bg-[#A3B087]" />
                      <h6 className="font-mono text-xs font-bold uppercase tracking-wider text-[#313647]">
                        {subTitle}
                      </h6>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="text-[#435663]">
                    {renderInlineText(line)}
                  </p>
                );
              })}
            </div>
          );
        }

        // Default Paragraph
        return (
          <p key={bIdx} className="text-[#435663]">
            {renderInlineText(trimmedBlock)}
          </p>
        );
      })}
    </div>
  );
}
