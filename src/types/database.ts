/**
 * Database Type Definitions
 * These types represent the database schema
 *
 * TODO: Generate these automatically using Supabase CLI:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ContactTopic =
  | 'pricing'
  | 'features'
  | 'technical'
  | 'demo'
  | 'partnership'
  | 'other';

type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'archived';

type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          org_id: string;
          site_id: string;
          asset_type: string;
          model: string | null;
          serial_number: string | null;
          install_date: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          site_id: string;
          asset_type: string;
          model?: string | null;
          serial_number?: string | null;
          install_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          site_id?: string;
          asset_type?: string;
          model?: string | null;
          serial_number?: string | null;
          install_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          category: string | null;
          tags: string[] | null;
          author_name: string | null;
          cover_image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          published: boolean;
          published_at: string | null;
          updated_at: string | null;
          view_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          category?: string | null;
          tags?: string[] | null;
          author_name?: string | null;
          cover_image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          category?: string | null;
          tags?: string[] | null;
          author_name?: string | null;
          cover_image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          company: string;
          country_code: string;
          phone: string;
          email: string | null;
          topic: ContactTopic | null;
          message: string | null;
          status: ContactStatus;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          company: string;
          country_code: string;
          phone: string;
          email?: string | null;
          topic?: ContactTopic | null;
          message?: string | null;
          status?: ContactStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string;
          country_code?: string;
          phone?: string;
          email?: string | null;
          topic?: ContactTopic | null;
          message?: string | null;
          status?: ContactStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          org_id: string;
          item_name: string;
          category: string;
          sku: string | null;
          unit_of_measure: string;
          quantity_available: number | null;
          reorder_level: number | null;
          unit_cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          item_name: string;
          category: string;
          sku?: string | null;
          unit_of_measure: string;
          quantity_available?: number | null;
          reorder_level?: number | null;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          item_name?: string;
          category?: string;
          sku?: string | null;
          unit_of_measure?: string;
          quantity_available?: number | null;
          reorder_level?: number | null;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          org_id: string;
          item_name: string;
          category: string;
          sku: string | null;
          unit_of_measure: string;
          quantity_available: number | null;
          reorder_level: number | null;
          unit_cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          item_name: string;
          category: string;
          sku?: string | null;
          unit_of_measure: string;
          quantity_available?: number | null;
          reorder_level?: number | null;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          item_name?: string;
          category?: string;
          sku?: string | null;
          unit_of_measure?: string;
          quantity_available?: number | null;
          reorder_level?: number | null;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      job_assignments: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          created_at: string;
          updated_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      job_tasks: {
        Row: {
          id: string;
          job_id: string;
          org_id: string;
          title: string;
          description: string | null;
          is_completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          org_id: string;
          title: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          org_id?: string;
          title?: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          org_id: string;
          client_id: string | null;
          site_id: string | null;
          asset_id: string | null;
          title: string;
          description: string | null;
          status: JobStatus;
          priority: JobPriority;
          scheduled_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          client_id?: string | null;
          site_id?: string | null;
          asset_id?: string | null;
          title: string;
          description?: string | null;
          status?: JobStatus;
          priority?: JobPriority;
          scheduled_at: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string | null;
          site_id?: string | null;
          asset_id?: string | null;
          title?: string;
          description?: string | null;
          status?: JobStatus;
          priority?: JobPriority;
          scheduled_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      preorders: {
        Row: {
          id: string;
          org_name: string | null;
          contact_name: string | null;
          email: string;
          phone: string;
          tech_count: number | null;
          city: string | null;
          plan_interest: string | null;
          payment_status: string;
          amount_paid: number;
          email_confirmed: boolean;
          confirmation_token: string | null;
          token_expires_at: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          referrer: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          org_name?: string | null;
          contact_name?: string | null;
          email: string;
          phone: string;
          tech_count?: number | null;
          city?: string | null;
          plan_interest?: string | null;
          payment_status?: string;
          amount_paid?: number;
          email_confirmed?: boolean;
          confirmation_token?: string | null;
          token_expires_at?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          referrer?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          org_name?: string | null;
          contact_name?: string | null;
          email?: string;
          phone?: string;
          tech_count?: number | null;
          city?: string | null;
          plan_interest?: string | null;
          payment_status?: string;
          amount_paid?: number;
          email_confirmed?: boolean;
          confirmation_token?: string | null;
          token_expires_at?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          referrer?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sites: {
        Row: {
          id: string;
          org_id: string;
          client_id: string;
          name: string;
          address: string;
          gps_lat: string | null;
          gps_lng: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          client_id: string;
          name: string;
          address: string;
          gps_lat?: string | null;
          gps_lng?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string;
          name?: string;
          address?: string;
          gps_lat?: string | null;
          gps_lng?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          email_confirmed: boolean;
          google_provider_id: string | null;
          org_id: string | null;
          role: 'owner' | 'coordinator' | 'technician' | null;
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          email_confirmed?: boolean;
          google_provider_id?: string | null;
          org_id?: string | null;
          role?: 'owner' | 'coordinator' | 'technician' | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          email_confirmed?: boolean;
          google_provider_id?: string | null;
          org_id?: string | null;
          role?: 'owner' | 'coordinator' | 'technician' | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_invites: {
        Row: {
          id: string;
          org_id: string;
          invited_by: string;
          name: string;
          contact: string;
          contact_type: 'phone' | 'email';
          role: 'technician' | 'coordinator';
          invite_code: string;
          invite_token: string;
          status: 'pending' | 'accepted' | 'cancelled' | 'expired';
          expires_at: string;
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          invited_by: string;
          name: string;
          contact: string;
          contact_type: 'phone' | 'email';
          role: 'technician' | 'coordinator';
          invite_code: string;
          invite_token: string;
          status?: 'pending' | 'accepted' | 'cancelled' | 'expired';
          expires_at: string;
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          invited_by?: string;
          name?: string;
          contact?: string;
          contact_type?: 'phone' | 'email';
          role?: 'technician' | 'coordinator';
          invite_code?: string;
          invite_token?: string;
          status?: 'pending' | 'accepted' | 'cancelled' | 'expired';
          expires_at?: string;
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_invites_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_invites_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_invites_accepted_by_fkey';
            columns: ['accepted_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
