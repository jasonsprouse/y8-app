import { getAllPostIds, getPostData } from '../../../lib/posts';
import type { Metadata, Viewport } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const postData = await getPostData(params.id);
  return {
    title: postData.title,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(path => ({ id: path.id }));
}

export default async function Post({ params }: { params: { id: string } }) {
  const postData = await getPostData(params.id);
  return (
    <div className="container mx-auto px-4 py-8">
      <article>
        <h1 className="text-4xl font-bold mb-4">{postData.title}</h1>
        <div className="text-gray-500 mb-8">{postData.date}</div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}