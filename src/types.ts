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

export interface AIResponseType {
  metadata: Metadata;
  score: number;
  text: string;
}
export interface Metadata {
  authors?: (string)[] | null;
  has_paywall: string | boolean;
  id: string;
  newsroom: string;
  published_at: string;
  section: string;
  section_lvl2: string;
  source: string;
  tags?: (string)[] | null;
  title: string;
}
