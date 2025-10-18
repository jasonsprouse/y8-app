import Link from 'next/link';
import { getSortedPostsData } from '../../lib/posts';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function Blog() {
  const allPostsData = getSortedPostsData();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <ul className="space-y-4">
        {allPostsData.map(({ id, date, title }) => (
          <li key={id}>
            <Link href={`/blog/${id}`} className="text-2xl font-bold text-blue-600 hover:underline">
              {title}
            </Link>
            <br />
            <small className="text-gray-500">{date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}