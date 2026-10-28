"use client";

import { useMutation } from "@apollo/client/react";
import { useId, useState, type SubmitEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { TaskQuery } from "@/gql/graphql";
import { formatDate, timeAgo } from "@/lib/format";
import { AddCommentMutation, TaskQuery as TaskDocument } from "./graphql";

type CommentsProps = { taskId: string; comments: TaskQuery["task"]["comments"] };

export function Comments({ taskId, comments }: CommentsProps) {
  const headingId = useId();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [addComment, { loading }] = useMutation(AddCommentMutation, {
    update(cache, { data }) {
      if (!data) return;
      cache.updateQuery({ query: TaskDocument, variables: { id: taskId } }, (prev) =>
        prev
          ? { task: { ...prev.task, comments: [...prev.task.comments, data.addComment] } }
          : prev,
      );
    },
  });

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return setError("Write a comment first");
    // Clear up front: the list updates before the mutation resolves, so a later clear could wipe new typing.
    setBody("");
    setError(undefined);
    try {
      await addComment({ variables: { input: { taskId, body: text } } });
    } catch (err) {
      setBody(text);
      setError(err instanceof Error ? err.message : "Couldn't post the comment. Try again.");
    }
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-section font-semibold">
        Comments <span className="font-normal text-graphite">{comments.length}</span>
      </h2>
      {comments.length > 0 ? (
        <ol className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar name={comment.author.name} decorative />
              <div className="min-w-0 flex-1">
                <p className="text-meta">
                  <span className="font-semibold">{comment.author.name}</span>{" "}
                  <time
                    dateTime={comment.createdAt}
                    title={formatDate(comment.createdAt)}
                    className="text-graphite"
                  >
                    {timeAgo(comment.createdAt)}
                  </time>
                </p>
                <p className="mt-0.5 break-words whitespace-pre-wrap">{comment.body}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-graphite">No comments yet.</p>
      )}
      <form noValidate onSubmit={handleSubmit} className="flex flex-col items-start gap-3">
        <div className="w-full">
          <Textarea
            label="Add a comment"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            rows={3}
            error={error}
          />
        </div>
        <Button type="submit" disabled={loading}>
          Post comment
        </Button>
      </form>
    </section>
  );
}
