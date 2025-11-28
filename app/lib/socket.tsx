'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@clerk/nextjs'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const { getToken, userId } = useAuth()

    useEffect(() => {
        if (!userId) return

        const initSocket = async () => {
            const token = await getToken()

            // Initialize socket connection with authentication
            const newSocket = io('http://localhost:3001', {
                auth: {
                    token,
                    userId
                },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            })

            // Connection event handlers
            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id)
                setIsConnected(true)
            })

            newSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason)
                setIsConnected(false)
            })

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error)
                setIsConnected(false)
            })

            setSocket(newSocket)
        }

        initSocket()

        // Cleanup on unmount
        return () => {
            if (socket) {
                console.log('🧹 Cleaning up socket connection')
                socket.disconnect()
            }
        }
    }, [userId])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
