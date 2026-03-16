import { createClient, type EntryFieldTypes, type Entry, type EntrySkeletonType } from "contentful";

const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN,
});

const previewClient = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_PREVIEW_TOKEN,
  host: "preview.contentful.com",
});

function getClient(preview = false) {
  return preview ? previewClient : client;
}

interface PageFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  description: EntryFieldTypes.Text;
  body: EntryFieldTypes.RichText;
  seoTitle?: EntryFieldTypes.Text;
  seoDescription?: EntryFieldTypes.Text;
}

interface BlogPostFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  excerpt: EntryFieldTypes.Text;
  body: EntryFieldTypes.RichText;
  publishedDate: EntryFieldTypes.Date;
  author?: EntryFieldTypes.Text;
  featuredImage?: EntryFieldTypes.AssetLink;
  seoTitle?: EntryFieldTypes.Text;
  seoDescription?: EntryFieldTypes.Text;
}

export type PageSkeleton = EntrySkeletonType<PageFields, "page">;
export type BlogPostSkeleton = EntrySkeletonType<BlogPostFields, "blogPost">;

export type PageEntry = Entry<PageSkeleton, undefined, string>;
export type BlogPostEntry = Entry<BlogPostSkeleton, undefined, string>;

export async function getPages(preview = false): Promise<PageEntry[]> {
  const entries = await getClient(preview).getEntries<PageSkeleton>({
    content_type: "page",
    order: ["sys.createdAt"],
  });
  return entries.items;
}

export async function getPageBySlug(
  slug: string,
  preview = false
): Promise<PageEntry | undefined> {
  const entries = await getClient(preview).getEntries<PageSkeleton>({
    content_type: "page",
    "fields.slug": slug,
    limit: 1,
  } as any);
  return entries.items[0];
}

export async function getBlogPosts(preview = false): Promise<BlogPostEntry[]> {
  const entries = await getClient(preview).getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishedDate"],
  });
  return entries.items;
}

export async function getBlogPostBySlug(
  slug: string,
  preview = false
): Promise<BlogPostEntry | undefined> {
  const entries = await getClient(preview).getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  } as any);
  return entries.items[0];
}
