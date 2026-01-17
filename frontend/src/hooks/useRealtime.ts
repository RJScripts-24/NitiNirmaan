import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Node, Edge } from 'reactflow';

export interface RealtimeUser {
    id: string; // The ephemeral presence ID (myId)
    name: string;
    color: string;
    accessLevel: 'edit' | 'view';
    isCurrentUser: boolean;
}

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
    const [activeUsers, setActiveUsers] = useState<RealtimeUser[]>([]);
    const [accessLevel, setAccessLevel] = useState<'edit' | 'view'>('edit');
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
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users: RealtimeUser[] = [];

                Object.keys(state).forEach(key => {
                    const presence = state[key][0] as any; // Supabase presence is an array per key
                    if (presence) {
                        users.push({
                            id: key,
                            name: presence.user || 'Anonymous',
                            color: presence.color || '#ccc',
                            accessLevel: presence.accessLevel || 'edit',
                            isCurrentUser: key === myId.current
                        });
                    }
                });

                setActiveUsers(users);
                console.log('👥 [Realtime] Active users updated:', users.length);
            })
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
                // Determine if we should accept this update based on local access level?
                // Ideally backend policies enforce this too, but for UI sync:
                console.log(`📥 [Realtime] Received nodes-update from ${payload.payload.senderId}`);
                if (onNodesChangeRef.current) {
                    onNodesChangeRef.current(payload.payload.nodes);
                }
            })
            .on('broadcast', { event: 'edges-update' }, (payload) => {
                console.log(`📥 [Realtime] Received edges-update from ${payload.payload.senderId}`);
                if (onEdgesChangeRef.current) {
                    onEdgesChangeRef.current(payload.payload.edges);
                }
            })
            .on('broadcast', { event: 'permission-change' }, (payload) => {
                const { targetUserId, newAccessLevel } = payload.payload;
                console.log(`🔒 [Realtime] Permission change received. Target: ${targetUserId}, MyId: ${myId.current}, NewLevel: ${newAccessLevel}`);

                if (targetUserId === myId.current) {
                    console.log('✅ [Realtime] Applying new access level to ME');
                    setAccessLevel(newAccessLevel);
                } else {
                    console.log('ℹ️ [Realtime] Ignoring permission change for another user');
                }
            })
            .subscribe(async (status) => {
                console.log(`📡 [Realtime] Subscription status: ${status}`);
                if (status === 'SUBSCRIBED') {
                    setIsSubscribed(true);
                    console.log(`✅ [Realtime] Successfully subscribed to project:${projectId}`);

                    // Initial presence track
                    await channel.track({
                        user: identity?.name || 'Guest',
                        color: identity?.color || '#888',
                        accessLevel: 'edit', // Default start as edit, unless logic overrides later
                        online_at: new Date().toISOString(),
                    });

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
    }, [projectId, token, identity]); // Re-subscribe if identity changes (unlikely) or project changes

    // Track access level changes
    useEffect(() => {
        if (isSubscribed && channelRef.current) {
            channelRef.current.track({
                user: identity?.name || 'Guest',
                color: identity?.color || '#888',
                accessLevel: accessLevel,
                online_at: new Date().toISOString(),
            }).catch((err: any) => console.error('Failed to update presence access level', err));
        }
    }, [accessLevel, isSubscribed, identity]);

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
        if (!channelRef.current || !isSubscribed) return;
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
        if (!channelRef.current || !isSubscribed) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'edges-update',
            payload: {
                senderId: myId.current,
                edges,
            },
        });
    }, [isSubscribed]);

    // Function to change another user's permission
    const changeUserPermission = useCallback((targetUserId: string, newAccessLevel: 'edit' | 'view') => {
        console.log(`📤 [Realtime] ADMIN: Sending permission change. Target: ${targetUserId}, Level: ${newAccessLevel}`);
        if (!channelRef.current || !isSubscribed) {
            console.error('❌ [Realtime] Cannot send permission change - channel not ready');
            return;
        }
        channelRef.current.send({
            type: 'broadcast',
            event: 'permission-change',
            payload: {
                targetUserId,
                newAccessLevel
            }
        }).then(() => {
            console.log('✅ [Realtime] Permission change broadcast sent successfully');
        }).catch((err: any) => {
            console.error('❌ [Realtime] Permission change broadcast failed:', err);
        });
    }, [isSubscribed]);

    return {
        cursors,
        activeUsers,
        accessLevel,
        changeUserPermission,
        broadcastCursor,
        broadcastNodes,
        broadcastEdges,
        isSubscribed,
    };
}
