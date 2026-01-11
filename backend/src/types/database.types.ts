export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    email: string
                    full_name: string | null
                    org_name: string | null
                    avatar_url: string | null
                    gamification_level: string // e.g., "Level 1: Novice"
                    xp: number
                }
                Insert: {
                    id: string
                    created_at?: string
                    email: string
                    full_name?: string | null
                    org_name?: string | null
                    avatar_url?: string | null
                    gamification_level?: string
                    xp?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    org_name?: string | null
                    avatar_url?: string | null
                    gamification_level?: string
                    xp?: number
                }
            }
            projects: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    user_id: string
                    title: string
                    description: string | null
                    theme: 'FLN' | 'CAREER' | 'STEM' | 'GENERAL' // The domain context
                    status: 'draft' | 'published' | 'exported'
                    location: string | null
                    logic_health_score: number // 0-100 score from Simulation
                    thumbnail_url: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    user_id: string
                    title: string
                    description?: string | null
                    theme?: 'FLN' | 'CAREER' | 'STEM' | 'GENERAL'
                    status?: 'draft' | 'published' | 'exported'
                    location?: string | null
                    logic_health_score?: number
                    thumbnail_url?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    theme?: 'FLN' | 'CAREER' | 'STEM' | 'GENERAL'
                    status?: 'draft' | 'published' | 'exported'
                    location?: string | null
                    logic_health_score?: number
                    thumbnail_url?: string | null
                }
            }
            nodes: {
                Row: {
                    id: string
                    project_id: string
                    created_at: string
                    type: string // 'stakeholder', 'intervention', 'outcome', etc.
                    label: string
                    position_x: number
                    position_y: number
                    data: Json // Stores bandwidth, cost, complexity, etc.
                }
                Insert: {
                    id?: string
                    project_id: string
                    created_at?: string
                    type: string
                    label: string
                    position_x: number
                    position_y: number
                    data?: Json
                }
                Update: {
                    id?: string
                    project_id?: string
                    created_at?: string
                    type?: string
                    label?: string
                    position_x?: number
                    position_y?: number
                    data?: Json
                }
            }
            edges: {
                Row: {
                    id: string
                    project_id: string
                    source_node_id: string
                    target_node_id: string
                    interaction_type: string // 'delivers', 'monitors'
                    indicators: Json // Array of { label, unit } objects
                }
                Insert: {
                    id: string
                    project_id: string
                    source_node_id: string
                    target_node_id: string
                    interaction_type?: string
                    indicators?: Json
                }
                Update: {
                    id?: string
                    project_id?: string
                    source_node_id?: string
                    target_node_id?: string
                    interaction_type?: string
                    indicators?: Json
                }
            }
            templates: {
                Row: {
                    id: string
                    title: string
                    description: string
                    domain: string // 'FLN', 'CAREER'
                    difficulty: string // 'Beginner', 'Advanced'
                    author_org: string // e.g., 'Pratham', 'Kaivalya'
                    embedding: string // pgvector string representation
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    domain: string
                    difficulty: string
                    author_org: string
                    embedding?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    domain?: string
                    difficulty?: string
                    author_org?: string
                    embedding?: string
                }
            }
            knowledge_docs: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    content_chunk: string
                    embedding: number[]
                    category: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    content_chunk: string
                    embedding: number[]
                    category?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    content_chunk?: string
                    embedding?: number[]
                    category?: string
                }
            }
            project_members: {
                Row: {
                    id: string
                    project_id: string
                    user_id: string
                    role: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_id: string
                    role?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_id?: string
                    role?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            match_templates: {
                Args: {
                    query_embedding: string // vector(384)
                    match_threshold: number
                    match_count: number
                }
                Returns: {
                    id: string
                    title: string
                    description: string
                    domain: string
                    similarity: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
