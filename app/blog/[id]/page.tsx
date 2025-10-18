import { getAllPostIds, getPostData } from '../../../lib/posts';
import type { Metadata } from 'next';

type Params = {
  id: string;
};

export async function generateStaticParams(): Promise<Params[]> {
  const paths = getAllPostIds();
  return paths;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const postData = await getPostData(params.id);
  return {
    title: postData.title,
  };
}

export default async function Post({ params }: { params: Params }) {
  const postData = await getPostData(params.id);
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