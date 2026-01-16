import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface Cursor {
    x: number;
    y: number;
    name: string;
    color: string;
    lastActive: number;
}

interface UseRealtimeProps {
    projectId: string;
    token?: string; // Share token for guests
    identity?: { name: string; color: string };
}

export function useRealtime({ projectId, token, identity }: UseRealtimeProps) {
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const channelRef = useRef<any>(null);
    const myId = useRef<string>(Math.random().toString(36).substring(7));

    useEffect(() => {
        if (!projectId) return;

        // Clean up previous subscription
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase.channel(`project:${projectId}`, {
            config: {
                presence: {
                    key: myId.current,
                },
            },
        });

        channel
            .on('broadcast', { event: 'cursor-move' }, (payload) => {
                // Update other user's cursor
                if (payload.payload.id !== myId.current) {
                    setCursors((prev) => ({
                        ...prev,
                        [payload.payload.id]: {
                            x: payload.payload.x,
                            y: payload.payload.y,
                            name: payload.payload.name,
                            color: payload.payload.color,
                            lastActive: Date.now(),
                        },
                    }));
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`📡 [Realtime] Subscribed to project:${projectId}`);
                    if (identity) {
                        // Track presence
                        channel.track({
                            user: identity.name,
                            online_at: new Date().toISOString(),
                        });
                    }
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, token]); // Re-subscribe if projectId or token changes

    // Function to broadcast my cursor
    const broadcastCursor = (x: number, y: number) => {
        if (!channelRef.current || !identity) return;

        channelRef.current.send({
            type: 'broadcast',
            event: 'cursor-move',
            payload: {
                id: myId.current,
                x,
                y,
                name: identity.name,
                color: identity.color,
            },
        });
    };

    // Cleanup inactive cursors (optional, every few seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setCursors(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(key => {
                    if (now - next[key].lastActive > 10000) { // 10s timeout
                        delete next[key];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return {
        cursors,
        broadcastCursor,
    };
}
