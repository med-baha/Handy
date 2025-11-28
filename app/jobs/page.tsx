'use client'
import React, { useEffect, useState } from 'react'
import { Briefcase, User, MessageCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const JobsPage = () => {
  const [posts, setPosts] = useState([])
  const router = useRouter()
  const { getToken, userId } = useAuth()
  const [loadingConversation, setLoadingConversation] = useState<string | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedPoster, setSelectedPoster] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const getAllPosts = async () => {
    const res = await fetch('http://localhost:3001/api/posts', {
      method: 'GET',
      headers: { "Content-Type": "application/json" }
    })
    const data = await res.json()
    setPosts(data)
    console.log(data)
  }

  const handleContactPoster = async (poster: any) => {
    if (!poster?._id) {
      alert("Poster information not available");
      return;
    }

    setLoadingConversation(poster._id);
    setSelectedPoster(poster);

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserId: poster._id
        })
      });

      if (res.ok) {
        const conversation = await res.json();
        console.log("Conversation created/found:", conversation);

        // If conversation already exists, redirect to conversations page
        // If new conversation, show message dialog
        if (conversation.isExisting) {
          // Existing conversation - redirect to conversations page with conversation ID
          router.push(`/conversations?id=${conversation._id}`);
        } else {
          // New conversation - show message dialog
          setConversationId(conversation._id);
          setShowMessageDialog(true);
        }
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Error creating conversation");
    } finally {
      setLoadingConversation(null);
    }
  }


  const handleSendMessage = async () => {
    if (!messageContent.trim() || !conversationId) return;

    setSendingMessage(true);

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: conversationId,
          content: messageContent
        })
      });

      if (res.ok) {
        console.log("Message sent successfully");
        setMessageContent("");
        setShowMessageDialog(false);
        // Navigate to conversations page with the conversation ID
        router.push(`/conversations?id=${conversationId}`);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  }

  useEffect(() => {
    getAllPosts()

  }, [])

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-base-content">
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </button>

          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-secondary">Job Offers</h1>
            <p className="text-base-content/70">Browse available opportunities posted by users.</p>
          </div>

          <div className="w-32"></div> {/* Spacer for balance */}
        </div>

        {posts.map((item: any, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="card-body flex-row items-start gap-4">
              {/* Icon/Avatar Placeholder */}
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Briefcase size={24} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-base-content/50" />
                  <span className="font-semibold text-sm text-base-content/70">
                    {item.poster?.name || item.poster || "Unknown User"}
                  </span>
                  {item.poster?.specialty && (
                    <span className="badge badge-secondary badge-sm">{item.poster.specialty}</span>
                  )}
                </div>

                <p className="text-lg font-medium text-base-content mb-4">{item.content}</p>

                <div className="card-actions justify-end">
                  {/* Only show button if current user is not the poster */}
                  {userId && userId !== item.poster?.clerk_id && (
                    <button
                      className="btn btn-sm btn-outline btn-primary gap-2"
                      onClick={() => handleContactPoster(item.poster)}
                      disabled={!item.poster?._id || loadingConversation === item.poster?._id}
                    >
                      {loadingConversation === item.poster?._id ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          Contact Poster
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            <p>No job offers found at the moment.</p>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      {showMessageDialog && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Send Message to {selectedPoster?.name || "User"}
            </h3>

            {selectedPoster?.specialty && (
              <div className="badge badge-secondary mb-4">{selectedPoster.specialty}</div>
            )}

            <textarea
              className="textarea textarea-bordered w-full h-32 mb-4"
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={sendingMessage}
            ></textarea>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessageContent("");
                }}
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary gap-2"
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowMessageDialog(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}

export default JobsPage
