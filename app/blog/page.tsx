import { getPostData } from '../../lib/posts';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function Blog() {
  const postData = await getPostData('npe-manager-guide');
  return (
    <div className="container mx-auto px-4 py-8">
      <article>
        <h1 className="text-4xl font-bold mb-4">{postData.title}</h1>
        <div className="text-gray-500 mb-8">{postData.date}</div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}