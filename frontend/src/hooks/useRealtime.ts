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
    token?: string;
    identity?: { name: string; color: string };
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
}

export function useRealtime({ projectId, token, identity, onNodesChange, onEdgesChange }: UseRealtimeProps) {
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const [isSubscribed, setIsSubscribed] = useState(false);
    const channelRef = useRef<any>(null);
    const myId = useRef<string>(Math.random().toString(36).substring(7));

    // Store callbacks in refs to avoid re-subscription on callback change
    const onNodesChangeRef = useRef(onNodesChange);
    const onEdgesChangeRef = useRef(onEdgesChange);

    useEffect(() => {
        onNodesChangeRef.current = onNodesChange;
        onEdgesChangeRef.current = onEdgesChange;
    }, [onNodesChange, onEdgesChange]);

    // Main subscription effect
    useEffect(() => {
        if (!projectId) {
            console.log('📡 [Realtime] No projectId, skipping subscription');
            return;
        }

        // Clean up previous subscription
        if (channelRef.current) {
            console.log('📡 [Realtime] Cleaning up previous channel');
            supabase.removeChannel(channelRef.current);
            setIsSubscribed(false);
        }

        console.log(`📡 [Realtime] Creating channel: project:${projectId} (myId: ${myId.current})`);

        const channel = supabase.channel(`project:${projectId}`, {
            config: {
                broadcast: { self: false }, // Don't receive own broadcasts
                presence: {
                    key: myId.current,
                },
            },
        });

        channel
            .on('broadcast', { event: 'cursor-move' }, (payload) => {
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
            })
            .on('broadcast', { event: 'nodes-update' }, (payload) => {
                console.log(`📥 [Realtime] Received nodes-update from ${payload.payload.senderId} (I am ${myId.current})`);
                if (onNodesChangeRef.current) {
                    onNodesChangeRef.current(payload.payload.nodes);
                }
            })
            .on('broadcast', { event: 'edges-update' }, (payload) => {
                console.log(`📥 [Realtime] Received edges-update from ${payload.payload.senderId} (I am ${myId.current})`);
                if (onEdgesChangeRef.current) {
                    onEdgesChangeRef.current(payload.payload.edges);
                }
            })
            .subscribe(async (status) => {
                console.log(`📡 [Realtime] Subscription status: ${status}`);
                if (status === 'SUBSCRIBED') {
                    setIsSubscribed(true);
                    console.log(`✅ [Realtime] Successfully subscribed to project:${projectId}`);
                    if (identity) {
                        await channel.track({
                            user: identity.name,
                            online_at: new Date().toISOString(),
                        });
                    }
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setIsSubscribed(false);
                    console.error(`❌ [Realtime] Channel error or timeout: ${status}`);
                }
            });

        channelRef.current = channel;

        return () => {
            console.log(`📡 [Realtime] Leaving channel: project:${projectId}`);
            setIsSubscribed(false);
            supabase.removeChannel(channel);
        };
    }, [projectId, token, identity]);

    // Cleanup inactive cursors
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setCursors(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(key => {
                    if (now - next[key].lastActive > 10000) {
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
        if (!channelRef.current || !identity || !isSubscribed) return;

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
    }, [identity, isSubscribed]);

    // Function to broadcast nodes update
    const broadcastNodes = useCallback((nodes: Node[]) => {
        if (!channelRef.current || !isSubscribed) {
            console.warn(`⚠️ [Realtime] Cannot broadcast nodes - channel not ready (subscribed: ${isSubscribed})`);
            return;
        }
        console.log(`📤 [Realtime] Sending nodes-update (${nodes.length} nodes, senderId: ${myId.current})`);
        channelRef.current.send({
            type: 'broadcast',
            event: 'nodes-update',
            payload: {
                senderId: myId.current,
                nodes,
            },
        });
    }, [isSubscribed]);

    // Function to broadcast edges update
    const broadcastEdges = useCallback((edges: Edge[]) => {
        if (!channelRef.current || !isSubscribed) {
            console.warn(`⚠️ [Realtime] Cannot broadcast edges - channel not ready (subscribed: ${isSubscribed})`);
            return;
        }
        console.log(`📤 [Realtime] Sending edges-update (${edges.length} edges, senderId: ${myId.current})`);
        channelRef.current.send({
            type: 'broadcast',
            event: 'edges-update',
            payload: {
                senderId: myId.current,
                edges,
            },
        });
    }, [isSubscribed]);

    return {
        cursors,
        broadcastCursor,
        broadcastNodes,
        broadcastEdges,
        isSubscribed,
    };
}
