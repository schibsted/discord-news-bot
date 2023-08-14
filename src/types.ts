export interface DefaultProps {
  newsValue: number;
  published: number;
  title: string;
  tag: string;
  url: string;
}

export interface Article extends DefaultProps {
  type: "article";
  id: string;
  description: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

export interface Video extends DefaultProps {
  type: "video";
  id: number;
  description: string;
  images: {
    main: string;
    front: string | null;
    snapshots: string | null;
    featured: string | null;
  };
}

export interface LiveBlog extends DefaultProps {
  type: "direkte";
  id: string;
}

export type Item = Article | Video | LiveBlog;
