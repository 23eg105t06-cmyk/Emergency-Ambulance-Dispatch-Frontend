import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || ''

let stompClient = null

export function connectSocket(onConnected) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket connected')
      if (onConnected) onConnected(stompClient)
    },
    onDisconnect: () => console.log('WebSocket disconnected'),
    onStompError: (frame) => console.error('STOMP error', frame),
  })
  stompClient.activate()
  return stompClient
}

export function disconnectSocket() {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
}

export function subscribeToDriverBookings(driverId, callback) {
  if (!stompClient?.connected) return
  return stompClient.subscribe(`/topic/driver/${driverId}/booking`, (msg) => {
    callback(JSON.parse(msg.body))
  })
}

export function subscribeToUserBookings(userId, callback) {
  if (!stompClient?.connected) return
  return stompClient.subscribe(`/topic/user/${userId}/booking`, (msg) => {
    callback(JSON.parse(msg.body))
  })
}

export function subscribeToBookingLocation(bookingId, callback) {
  if (!stompClient?.connected) return
  return stompClient.subscribe(`/topic/booking/${bookingId}/location`, (msg) => {
    callback(JSON.parse(msg.body))
  })
}

export function subscribeToUserTimeout(userId, callback) {
  if (!stompClient?.connected) return
  return stompClient.subscribe(`/topic/user/${userId}/timeout`, (msg) => {
    callback(JSON.parse(msg.body))
  })
}

export function getStompClient() {
  return stompClient
}
