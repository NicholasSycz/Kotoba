"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { postSchema, type PostFormValues } from "@/lib/schemas/post";
import { CATEGORIES, CATEGORY_LABELS, type Post } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { createPost, updatePost } from "@/store/slices/postsSlice";

interface PostFormProps {
  mode: "create" | "edit";
  post?: Post;
}

const FIELD_CLASS =
  "mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-accent";

export function PostForm({ mode, post }: PostFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: "onChange",
    defaultValues: {
      title: post?.title ?? "",
      body: post?.body ?? "",
      category: post?.category ?? "history",
    },
  });

  const onSubmit = (values: PostFormValues) => {
    if (mode === "edit" && post) {
      dispatch(updatePost(post.id, values));
      router.push(`/blog/${post.id}`);
      return;
    }

    const action = createPost(values, {
      name: "You",
      avatar: "",
    });
    dispatch(action);
    router.push(`/blog/${action.payload.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="title" className="text-sm font-medium text-ink">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Give your post a clear title"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={FIELD_CLASS}
          {...register("title")}
        />
        {errors.title ? (
          <p id="title-error" className="mt-2 text-sm text-red-700">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium text-ink">
          Category
        </label>
        <select
          id="category"
          aria-invalid={errors.category ? "true" : "false"}
          className={FIELD_CLASS}
          {...register("category")}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="body" className="text-sm font-medium text-ink">
          Body
        </label>
        <textarea
          id="body"
          rows={12}
          placeholder="Write the full post..."
          aria-invalid={errors.body ? "true" : "false"}
          aria-describedby={errors.body ? "body-error" : undefined}
          className={`${FIELD_CLASS} resize-y leading-6`}
          {...register("body")}
        />
        {errors.body ? (
          <p id="body-error" className="mt-2 text-sm text-red-700">
            {errors.body.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "edit" ? "Save changes" : "Publish post"}
        </button>
        <Link
          href={post ? `/blog/${post.id}` : "/blog"}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
