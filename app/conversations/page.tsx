'use client'
import React, { useEffect, useState } from 'react'
import { MessageCircle, User, ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const ConversationsPage = () => {
    const router = useRouter()
    const { getToken } = useAuth()
    const [conversations, setConversations] = useState<any[]>([])
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sendingMessage, setSendingMessage] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)

    const getConversations = async () => {
        try {
            const token = await getToken()
            const res = await fetch('http://localhost:3001/api/conversations', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.ok) {
                const data = await res.json()
                setConversations(data)
                console.log("Conversations:", data)
            }
        } catch (error) {
            console.error("Error fetching conversations:", error)
        }
    }

    const getMessages = async (conversationId: string) => {
        setLoadingMessages(true)
        try {
            const token = await getToken()
            const res = await fetch(`http://localhost:3001/api/messages/${conversationId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.ok) {
                const data = await res.json()
                setMessages(data)
                console.log("Messages:", data)
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const handleSelectConversation = (conversation: any) => {
        setSelectedConversation(conversation)
        getMessages(conversation._id)
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        setSendingMessage(true)

        try {
            const token = await getToken()
            const res = await fetch('http://localhost:3001/api/messages', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    conversationId: selectedConversation._id,
                    content: newMessage
                })
            })

            if (res.ok) {
                const message = await res.json()
                setMessages([...messages, message])
                setNewMessage("")
            } else {
                alert("Failed to send message")
            }
        } catch (error) {
            console.error("Error sending message:", error)
            alert("Error sending message")
        } finally {
            setSendingMessage(false)
        }
    }

    useEffect(() => {
        getConversations()
    }, [])

    return (
        <div className="min-h-screen bg-base-200 font-sans text-base-content">
            <div className="container mx-auto max-w-7xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-ghost gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>
                    <h1 className="text-3xl font-bold text-secondary">Messages</h1>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
                    {/* Conversations List */}
                    <div className="md:col-span-1 card bg-base-100 shadow-xl overflow-hidden">
                        <div className="card-body p-0">
                            <h2 className="text-xl font-bold p-4 border-b border-base-300">
                                Conversations
                            </h2>
                            <div className="overflow-y-auto flex-1">
                                {conversations.length === 0 ? (
                                    <div className="p-4 text-center text-base-content/50">
                                        No conversations yet
                                    </div>
                                ) : (
                                    conversations.map((conv: any) => {
                                        const otherUser = conv.participants?.find((p: any) => p._id !== conv.participants[0]._id) || conv.participants[0]
                                        return (
                                            <div
                                                key={conv._id}
                                                className={`p-4 border-b border-base-300 cursor-pointer hover:bg-base-200 transition-colors ${selectedConversation?._id === conv._id ? 'bg-base-200' : ''
                                                    }`}
                                                onClick={() => handleSelectConversation(conv)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-secondary text-secondary-content rounded-full w-12">
                                                            <User size={24} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{otherUser?.name || "User"}</p>
                                                        {otherUser?.specialty && (
                                                            <p className="text-sm text-base-content/70">{otherUser.specialty}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="md:col-span-2 card bg-base-100 shadow-xl overflow-hidden flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-base-300">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-secondary text-secondary-content rounded-full w-10">
                                                <User size={20} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {selectedConversation.participants?.find((p: any) => p.name)?.name || "User"}
                                            </p>
                                            {selectedConversation.participants?.find((p: any) => p.specialty)?.specialty && (
                                                <p className="text-sm text-base-content/70">
                                                    {selectedConversation.participants.find((p: any) => p.specialty).specialty}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingMessages ? (
                                        <div className="flex justify-center items-center h-full">
                                            <span className="loading loading-spinner loading-lg text-secondary"></span>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex justify-center items-center h-full text-base-content/50">
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        messages.map((msg: any) => (
                                            <div
                                                key={msg._id}
                                                className={`chat ${msg.sender?._id === selectedConversation.participants[0]._id ? 'chat-start' : 'chat-end'}`}
                                            >
                                                <div className="chat-header mb-1">
                                                    {msg.sender?.name || "User"}
                                                    <time className="text-xs opacity-50 ml-2">
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </time>
                                                </div>
                                                <div className="chat-bubble">{msg.content}</div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-base-300">
                                    <div className="flex gap-2">
                                        <textarea
                                            className="textarea textarea-bordered flex-1 resize-none"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                            rows={1}
                                            disabled={sendingMessage}
                                        ></textarea>
                                        <button
                                            className="btn btn-primary gap-2"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                        >
                                            {sendingMessage ? (
                                                <span className="loading loading-spinner loading-sm"></span>
                                            ) : (
                                                <Send size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-base-content/50">
                                <MessageCircle size={64} className="mb-4" />
                                <p className="text-lg">Select a conversation to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConversationsPage
