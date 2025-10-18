import { getSortedPostsData } from '../../lib/posts';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function Blog() {
  const allPostsData = getSortedPostsData();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-6">
        {allPostsData.map(({ id, date, title }) => (
          <article key={id} className="border-b pb-6">
            <Link href={`/blog/${id}`} className="group">
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {title}
              </h2>
            </Link>
            <time className="text-gray-500 text-sm">{date}</time>
          </article>
        ))}
      </div>
    </div>
  );
}