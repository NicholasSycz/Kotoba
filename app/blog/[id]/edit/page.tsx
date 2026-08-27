import type { Metadata } from "next";

import { EditPost } from "@/components/EditPost";

export const metadata: Metadata = {
  title: "Edit Post — Kotoba",
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  return <EditPost id={id} />;
}
