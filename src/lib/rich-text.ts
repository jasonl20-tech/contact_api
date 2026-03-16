import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS, INLINES, type Document } from "@contentful/rich-text-types";

const renderOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: any, next: any) =>
      `<p class="mb-4 leading-relaxed text-slate-600">${next(_node.content)}</p>`,
    [BLOCKS.HEADING_1]: (_node: any, next: any) =>
      `<h1 class="mb-4 mt-10 text-3xl font-extrabold text-slate-900">${next(_node.content)}</h1>`,
    [BLOCKS.HEADING_2]: (_node: any, next: any) =>
      `<h2 class="mb-3 mt-8 text-2xl font-extrabold text-slate-900">${next(_node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (_node: any, next: any) =>
      `<h3 class="mb-2 mt-6 text-xl font-bold text-slate-900">${next(_node.content)}</h3>`,
    [BLOCKS.UL_LIST]: (_node: any, next: any) =>
      `<ul class="mb-4 list-disc space-y-1.5 pl-6 text-slate-600">${next(_node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (_node: any, next: any) =>
      `<ol class="mb-4 list-decimal space-y-1.5 pl-6 text-slate-600">${next(_node.content)}</ol>`,
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { title, file } = node.data.target.fields;
      return `<img src="https:${file.url}" alt="${title || ""}" class="my-8 rounded-xl shadow-lg" loading="lazy" />`;
    },
    [INLINES.HYPERLINK]: (node: any, next: any) =>
      `<a href="${node.data.uri}" class="text-amber-600 hover:underline" target="_blank" rel="noopener">${next(node.content)}</a>`,
  },
};

export function renderRichText(document: Document): string {
  return documentToHtmlString(document, renderOptions);
}
