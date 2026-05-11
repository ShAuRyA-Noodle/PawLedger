import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { POSTS } from "@/lib/blog-posts";

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS[slug as keyof typeof POSTS];
  if (!p) return { title: "Post" };
  return { title: p.title, description: p.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug as keyof typeof POSTS];
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <Link href="/blog" className="text-sm text-slate hover:text-ink">← All posts</Link>
      <div className="mt-6 mb-8">
        <p className="text-xs text-muted font-mono mb-3">{post.date} · {post.minutes} min read · by {post.author}</p>
        <h1 className="font-display text-5xl tracking-tight leading-[1.05]">{post.title}</h1>
        <p className="mt-4 text-lg text-slate">{post.excerpt}</p>
      </div>
      <div className="prose prose-lg max-w-none text-slate leading-relaxed [&_h2]:font-display [&_h2]:text-3xl [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-ink [&_p]:my-5 [&_a]:text-marigold-deep [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-marigold [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-line/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_li]:my-2">
        {post.body.split("\n\n").map((para, i) => {
          if (para.startsWith("## ")) return <h2 key={i}>{para.slice(3)}</h2>;
          if (para.startsWith("> ")) return <blockquote key={i}>{para.slice(2)}</blockquote>;
          if (para.startsWith("- ")) return <ul key={i}>{para.split("\n").map((li, j) => <li key={j}>{li.slice(2)}</li>)}</ul>;
          return <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>').replace(/`(.+?)`/g, "<code>$1</code>") }} />;
        })}
      </div>
      <hr className="my-12 border-line" />
      <Badge variant="outline">PawLedger</Badge>
      <p className="mt-3 text-sm text-slate">Want monthly impact stories in your inbox? Subscribe in the footer.</p>
    </article>
  );
}
