'use client'
import React, { useEffect, useState, useRef } from 'react'
import { MessageCircle, User, ArrowLeft, Send, FileText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import ContractDialog from '@/components/ContractDialog'
import toast from 'react-hot-toast'
import { useSocket } from '@/app/lib/socket'
const ConversationsPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { getToken, userId } = useAuth()
    const { socket, isConnected } = useSocket()
    const [currentUser, setCurrentUser] = useState<any>({})
    const [conversations, setConversations] = useState<any[]>([])
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sendingMessage, setSendingMessage] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [showContractDialog, setShowContractDialog] = useState(false)
    const [contractForm, setContractForm] = useState({
        title: "",
        description: "",
        price: "",
        deadline: "",
        location: "",
        estimatedHours: "",
        paymentTerms: ""
    })
    const [creatingContract, setCreatingContract] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const getCurrentUser = async () => {
        if (!userId) {
            return
        }
        try {
            const token = await getToken()
            const res = await fetch(`http://localhost:3001/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            setCurrentUser(data)
            return data
        } catch (error) {
            console.error("Failed to fetch current user:", error)
            toast.error("Failed to load user data.")
            return
        }
    }
    useEffect(() => {
        const loadData = async () => {
            if (!userId) return // Wait for auth to be ready

            const user = await getCurrentUser()
            if (user) {
                await getConversations()
            }
        }
        loadData()
    }, [userId]) // Re-run when userId is available

    const getConversations = async () => {
        try {
            const token = await getToken()
            const res = await fetch(`http://localhost:3001/api/conversations`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const data = await res.json()
                setConversations(data)
                console.log("Conversations:", data)
            } else {
                console.error("Failed to fetch conversations:", res.status)
            }
        } catch (error) {
            console.error("Error fetching conversations:", error)
        }
    }

    // Auto-select conversation from URL parameter
    useEffect(() => {
        const conversationId = searchParams.get('id')
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find((c: any) => c._id === conversationId)
            if (conversation) {
                handleSelectConversation(conversation)
                // Clean up URL parameter
                router.replace('/conversations', { scroll: false })
            }
        }
    }, [conversations, searchParams])

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
        // Leave previous conversation room
        if (selectedConversation && socket) {
            socket.emit('leave-conversation', selectedConversation._id)
        }

        setSelectedConversation(conversation)
        getMessages(conversation._id)

        // Join new conversation room
        if (socket) {
            socket.emit('join-conversation', conversation._id)
        }
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

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Socket.IO event listeners
    useEffect(() => {
        if (!socket || !selectedConversation) return

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            // Only add message if it belongs to the current conversation
            if (message.conversation === selectedConversation._id) {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === message._id)) return prev
                    return [...prev, message]
                })
            }
        }

        // Listen for typing indicators
        const handleUserTyping = ({ userName }: { userName: string; userId: string }) => {
            setOtherUserTyping(userName)
        }

        const handleUserStopTyping = () => {
            setOtherUserTyping(null)
        }

        socket.on('new-message', handleNewMessage)
        socket.on('user-typing', handleUserTyping)
        socket.on('user-stop-typing', handleUserStopTyping)

        // Cleanup
        return () => {
            socket.off('new-message', handleNewMessage)
            socket.off('user-typing', handleUserTyping)
            socket.off('user-stop-typing', handleUserStopTyping)
        }
    }, [socket, selectedConversation])

    // Handle typing indicator
    const handleTyping = () => {
        if (!socket || !selectedConversation || !currentUser.name) return

        if (!isTyping) {
            setIsTyping(true)
            socket.emit('typing', {
                conversationId: selectedConversation._id,
                userName: currentUser.name
            })
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
            socket.emit('stop-typing', {
                conversationId: selectedConversation._id
            })
        }, 1000)
    }



    const handleCreateContract = async () => {
        if (!selectedConversation) return

        // Get the other participant (receiver) - not the current user
        const otherParticipant = selectedConversation.participants?.find(
            (p: any) => p._id !== userId
        )

        if (!otherParticipant) {
            toast.error("Could not find the other participant", { duration: 5000 })
            return
        }

        setCreatingContract(true)

        try {
            const token = await getToken()
            const res = await fetch('http://localhost:3001/api/contracts', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: otherParticipant._id,
                    conversationId: selectedConversation._id,
                    ...contractForm,
                    price: parseFloat(contractForm.price),
                    estimatedHours: parseFloat(contractForm.estimatedHours)
                })
            })

            if (res.ok) {
                toast.success("Contract proposal sent successfully!", { duration: 5000 })
                setShowContractDialog(false)
                // Reset form
                setContractForm({
                    title: "",
                    description: "",
                    price: "",
                    deadline: "",
                    location: "",
                    estimatedHours: "",
                    paymentTerms: ""
                })
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to create contract", { duration: 5000 })
            }
        } catch (error) {
            console.error("Error creating contract:", error)
            toast.error("Error creating contract", { duration: 5000 })
        } finally {
            setCreatingContract(false)
        }
    }



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
                                        const otherUser = conv.participants?.find((p: any) => p._id !== currentUser._id)
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
                                                        <p className="font-semibold">{otherUser?.name}</p>
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
                                    <div className="flex items-center justify-between gap-3">
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

                                        {/* Make a Contract Button - Only show if other user is a handy */}
                                        {(() => {
                                            // Find the other participant (not the current user)

                                            console.log('participents are : ', selectedConversation.participants)
                                            const otherParticipant = selectedConversation.participants?.find(
                                                (p: any) => p._id !== currentUser._id
                                            )
                                            console.log('other participant is : ', otherParticipant)
                                            return otherParticipant?.is_handy ? (
                                                <button
                                                    className="btn btn-sm btn-primary gap-2"
                                                    onClick={() => setShowContractDialog(true)}
                                                >
                                                    <FileText size={16} />
                                                    Make a Contract
                                                </button>
                                            ) : null
                                        })()}
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

                                    {/* Typing indicator */}
                                    {otherUserTyping && (
                                        <div className="chat chat-start">
                                            <div className="chat-bubble bg-base-300 text-base-content/70 text-sm">
                                                {otherUserTyping} is typing...
                                            </div>
                                        </div>
                                    )}

                                    {/* Auto-scroll anchor */}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-base-300">
                                    <div className="flex gap-2">
                                        <textarea
                                            className="textarea textarea-bordered flex-1 resize-none"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value)
                                                handleTyping()
                                            }}
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

                {/* Contract Dialog Modal */}
                <ContractDialog
                    isOpen={showContractDialog}
                    onClose={() => setShowContractDialog(false)}
                    contractForm={contractForm}
                    setContractForm={setContractForm}
                    onSubmit={handleCreateContract}
                    isSubmitting={creatingContract}
                />
            </div>
        </div>
    )
}

export default ConversationsPage
