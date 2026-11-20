// Shared 1200×630 social preview card for opengraph-image routes
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const ogSize = { width: 1200, height: 630 };

export async function renderOgImage({ eyebrow, title, subtitle }) {
  const frog = await readFile(path.join(process.cwd(), "public/froggo-thinks.png"));
  const frogSrc = `data:image/png;base64,${frog.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#181818",
          padding: "72px",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(5,150,105,0.35)",
            filter: "blur(80px)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#34d399", fontWeight: 700 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ fontSize: 30, color: "#a3a3a3", marginTop: 24, lineHeight: 1.3 }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            froggo.codes
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img alt="" src={frogSrc} width={260} height={260} style={{ alignSelf: "center", borderRadius: 48 }} />
      </div>
    ),
    ogSize
  );
}
