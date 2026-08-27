import type { Metadata } from "next";

import { PostDetail } from "@/components/PostDetail";

export const metadata: Metadata = {
  title: "Post — Kotoba",
};

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;

  return <PostDetail id={id} />;
}
