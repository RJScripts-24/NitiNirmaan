import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Node, Edge } from 'reactflow';

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
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
}

export function useRealtime({ projectId, token, identity, onNodesChange, onEdgesChange }: UseRealtimeProps) {
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const channelRef = useRef<any>(null);
    const myId = useRef<string>(Math.random().toString(36).substring(7));

    // Store callbacks in refs to avoid re-subscription on callback change
    const onNodesChangeRef = useRef(onNodesChange);
    const onEdgesChangeRef = useRef(onEdgesChange);

    // Keep refs updated
    useEffect(() => {
        onNodesChangeRef.current = onNodesChange;
        onEdgesChangeRef.current = onEdgesChange;
    }, [onNodesChange, onEdgesChange]);

    // Main subscription effect
    useEffect(() => {
        if (!projectId) return;

        // Clean up previous subscription
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        console.log(`📡 [Realtime] Connecting to channel: project:${projectId}`);

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
            .on('broadcast', { event: 'nodes-update' }, (payload) => {
                // Receive full nodes array from another user
                if (payload.payload.senderId !== myId.current && onNodesChangeRef.current) {
                    console.log(`📥 [Realtime] Received nodes update from ${payload.payload.senderId}`);
                    onNodesChangeRef.current(payload.payload.nodes);
                }
            })
            .on('broadcast', { event: 'edges-update' }, (payload) => {
                // Receive full edges array from another user
                if (payload.payload.senderId !== myId.current && onEdgesChangeRef.current) {
                    console.log(`📥 [Realtime] Received edges update from ${payload.payload.senderId}`);
                    onEdgesChangeRef.current(payload.payload.edges);
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`✅ [Realtime] Subscribed to project:${projectId}`);
                    if (identity) {
                        // Track presence
                        channel.track({
                            user: identity.name,
                            online_at: new Date().toISOString(),
                        });
                    }
                } else {
                    console.log(`📡 [Realtime] Subscription status: ${status}`);
                }
            });

        channelRef.current = channel;

        return () => {
            console.log(`📡 [Realtime] Leaving channel: project:${projectId}`);
            supabase.removeChannel(channel);
        };
    }, [projectId, token, identity]); // Removed callback deps, using refs instead

    // Cleanup inactive cursors
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

    // Function to broadcast my cursor
    const broadcastCursor = useCallback((x: number, y: number) => {
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
    }, [identity]);

    // Function to broadcast nodes update
    const broadcastNodes = useCallback((nodes: Node[]) => {
        if (!channelRef.current) return;
        console.log(`📤 [Realtime] Broadcasting nodes update (${nodes.length} nodes)`);
        channelRef.current.send({
            type: 'broadcast',
            event: 'nodes-update',
            payload: {
                senderId: myId.current,
                nodes,
            },
        });
    }, []);

    // Function to broadcast edges update
    const broadcastEdges = useCallback((edges: Edge[]) => {
        if (!channelRef.current) return;
        console.log(`📤 [Realtime] Broadcasting edges update (${edges.length} edges)`);
        channelRef.current.send({
            type: 'broadcast',
            event: 'edges-update',
            payload: {
                senderId: myId.current,
                edges,
            },
        });
    }, []);

    return {
        cursors,
        broadcastCursor,
        broadcastNodes,
        broadcastEdges,
    };
}
