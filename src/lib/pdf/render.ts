import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Server-only helper. Renders a react-pdf Document element to a binary Buffer. */
export async function renderPdf(
  element: ReactElement<DocumentProps>,
): Promise<Buffer> {
  return renderToBuffer(element);
}

const safeChars = /[^a-zA-Z0-9._-]/g;
export const safeFilename = (s: string) => s.replace(safeChars, "_");
