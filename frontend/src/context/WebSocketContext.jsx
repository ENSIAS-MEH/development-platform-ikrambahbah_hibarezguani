// src/context/WebSocketContext.jsx
//
// ✅ WebSocket GLOBAL — se connecte dès que l'utilisateur est connecté,
// indépendamment de quelle page/conversation il consulte.
//
// Responsabilités :
//  1. Connexion WebSocket unique pour toute l'application
//  2. markAllAsDelivered() dès la connexion (DELIVERED global)
//  3. Diffuse les messages entrants et status updates à toute l'app
//  4. Permet aux pages de s'abonner à des conversations spécifiques

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import { markAllAsDelivered } from "../services/messagingApi";

const WS_URL = "http://localhost:8086/ws-messaging";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  // Map des listeners par conversationId
  const listenersRef = useRef({});
  
  // Map des listeners de statut utilisateur
  const userStatusListenersRef = useRef({});

  // Ref pour ne marquer DELIVERED qu'une seule fois par session
  const hasMarkedDeliveredRef = useRef(false);

  const userId = user?.userId ? parseInt(user.userId) : null;

  // ─────────────────────────────────────────────────────────────────
  // CONNEXION WEBSOCKET GLOBALE
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Pas de connexion si l'utilisateur n'est pas connecté
    if (!isAuthenticated || !userId) {
      if (stompClient.current?.connected) {
        stompClient.current.deactivate();
      }
      stompClient.current = null;
      hasMarkedDeliveredRef.current = false;
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ [Global WS] Token manquant");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ [Global WS] Connecté — userId:", userId);
        setIsConnected(true);

        // ── Abonnement au canal privé de l'utilisateur ──────────────
        client.subscribe(`/user/queue/status`, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            console.log("📊 [Global WS] Status privé reçu:", data);
            const listener = listenersRef.current[data.conversationId];
            listener?.onStatus?.(data);
          } catch (e) {
            console.error("[Global WS] Erreur parsing status:", e);
          }
        });

        // ── Abonnement aux statuts des utilisateurs ──────────────────
        client.subscribe(`/topic/user-status`, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            console.log("🟢 [Global WS] Status utilisateur reçu:", data);
            // Notifier tous les listeners pour cet utilisateur
            const listeners = userStatusListenersRef.current[data.userId];
            if (listeners) {
              listeners.forEach(listener => listener(data));
            }
          } catch (e) {
            console.error("[Global WS] Erreur parsing user status:", e);
          }
        });

        // ✅ DELIVERED GLOBAL — une seule fois par session de connexion
        if (!hasMarkedDeliveredRef.current) {
          hasMarkedDeliveredRef.current = true;
          markAllAsDelivered()
            .then(() => console.log("✅ [Global WS] Tous les messages → DELIVERED"))
            .catch(err => console.error("❌ [Global WS] markAllAsDelivered:", err));
        }
      },

      onDisconnect: () => {
        console.log("🔴 [Global WS] Déconnecté");
        setIsConnected(false);
        hasMarkedDeliveredRef.current = false;
      },

      onStompError: (frame) => {
        console.error("❌ [Global WS] STOMP error:", frame.headers?.message);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.deactivate();
      }
      stompClient.current = null;
      hasMarkedDeliveredRef.current = false;
      setIsConnected(false);
    };
  }, [isAuthenticated, userId]);

  // ─────────────────────────────────────────────────────────────────
  // SUBSCRIBE À UNE CONVERSATION
  // ─────────────────────────────────────────────────────────────────

  const subscribeToConversation = useCallback((conversationId, onMessage, onStatus) => {
    if (!stompClient.current?.connected) {
      console.warn("[Global WS] Pas connecté, impossible de s'abonner à conv:", conversationId);
      return () => {};
    }

    const subscription = stompClient.current.subscribe(
      `/topic/conversation/${conversationId}`,
      (frame) => {
        try {
          const data = JSON.parse(frame.body);
          if (data.type === "STATUS_UPDATE") {
            onStatus?.(data);
          } else {
            onMessage?.(data);
          }
        } catch (e) {
          console.error("[Global WS] Erreur parsing frame conv:", e);
        }
      }
    );

    listenersRef.current[conversationId] = { onMessage, onStatus };
    console.log(`✅ [Global WS] Abonné à conversation ${conversationId}`);

    return () => {
      subscription?.unsubscribe();
      delete listenersRef.current[conversationId];
      console.log(`🔌 [Global WS] Désabonné de conversation ${conversationId}`);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // SUBSCRIBE AU STATUT D'UN UTILISATEUR
  // ─────────────────────────────────────────────────────────────────

  const subscribeToUserStatus = useCallback((targetUserId, onStatusChange) => {
    if (!stompClient.current?.connected) {
      console.warn("[Global WS] Pas connecté, impossible de s'abonner au statut de:", targetUserId);
      return () => {};
    }

    // Enregistrer le listener
    if (!userStatusListenersRef.current[targetUserId]) {
      userStatusListenersRef.current[targetUserId] = [];
    }
    userStatusListenersRef.current[targetUserId].push(onStatusChange);

    console.log(`✅ [Global WS] Abonné au statut de l'utilisateur ${targetUserId}`);

    // Retourner unsubscribe
    return () => {
      const listeners = userStatusListenersRef.current[targetUserId];
      if (listeners) {
        const index = listeners.indexOf(onStatusChange);
        if (index !== -1) listeners.splice(index, 1);
        if (listeners.length === 0) {
          delete userStatusListenersRef.current[targetUserId];
        }
      }
      console.log(`🔌 [Global WS] Désabonné du statut de l'utilisateur ${targetUserId}`);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // ENVOYER VIA WEBSOCKET
  // ─────────────────────────────────────────────────────────────────

  const sendWsMessage = useCallback((destination, body) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn("⚠️ [Global WS] Non connecté, message non envoyé");
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, 
      subscribeToConversation, 
      sendWsMessage,
      subscribeToUserStatus
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocketContext doit être utilisé dans WebSocketProvider");
  return ctx;
}