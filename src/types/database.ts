/**
 * Database Type Definitions
 * These types represent the database schema
 *
 * TODO: Generate these automatically using Supabase CLI:
 * npx supabase gen types typescript --project-id dogzgbppyiokvipvsgln > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
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
      };
      users: {
        Row: {
          id: string;
          email: string;
          email_confirmed: boolean;
          google_provider_id: string | null;
          org_id: string;
          role: 'owner' | 'coordinator' | 'technician';
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          email_confirmed?: boolean;
          google_provider_id?: string | null;
          org_id: string;
          role: 'owner' | 'coordinator' | 'technician';
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          email_confirmed?: boolean;
          google_provider_id?: string | null;
          org_id?: string;
          role?: 'owner' | 'coordinator' | 'technician';
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          scheduled_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          client_id?: string | null;
          site_id?: string | null;
          asset_id?: string | null;
          title: string;
          description?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string | null;
          site_id?: string | null;
          asset_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more table types as needed...
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
}
