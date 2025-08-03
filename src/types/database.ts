export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string
          avatar_url: string | null
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          avatar_url?: string | null
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          avatar_url?: string | null
          full_name?: string | null
        }
      }
      articles: {
        Row: {
          id: string
          created_at: string
          title: string
          slug: string
          description: string | null
          content: string
          pub_date: string
          author_id: string
          hero_image_url: string | null
          tags: string[] | null
          category: string | null
          is_published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          slug: string
          description?: string | null
          content: string
          pub_date: string
          author_id: string
          hero_image_url?: string | null
          tags?: string[] | null
          category?: string | null
          is_published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          slug?: string
          description?: string | null
          content?: string
          pub_date?: string
          author_id?: string
          hero_image_url?: string | null
          tags?: string[] | null
          category?: string | null
          is_published?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          article_id: string
          user_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          article_id: string
          user_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          article_id?: string
          user_id?: string
          content?: string
        }
      }
      likes: {
        Row: {
          id: string
          created_at: string
          article_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          article_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          article_id?: string
          user_id?: string
        }
      }
    }
  }
}