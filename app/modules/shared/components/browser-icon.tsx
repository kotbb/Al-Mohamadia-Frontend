import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export async function createBrowserIcon(size: { width: number; height: number }) {
  const mark = await readFile(join(process.cwd(), "public/images/icon-mark.png"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${mark.toString("base64")}`} alt="" width={size.width} height={size.height} />
    </div>,
    size,
  );
}
