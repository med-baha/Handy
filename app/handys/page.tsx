'use client'
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Search, Send, Star, User, Briefcase, MessageSquare } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

const HandysPage = () => {
  const [handysData, setHandysData] = useState([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { getToken, userId } = useAuth()
  const [post, setPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState<string | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedHandy, setSelectedHandy] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const router = useRouter()

  const getHandys = async () => {
    const token = await getToken()
    const res = await fetch('http://localhost:3001/api/users', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
    const data = await res.json()
    setHandysData(data)
  }

  const getCurrentUser = async () => {
    if (!userId) return
    const token = await getToken()
    const res = await fetch(`http://localhost:3001/api/users/${userId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
    const data = await res.json()
    setCurrentUser(data)
  }



  const sendPost = async () => {
    setIsPosting(true)
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: currentUser?._id,
          post
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to post.')
      }

      toast.success('Post created successfully!')
      setPost("") // Clear the input after successful post
    } catch (error: any) {
      toast.error(error.message || 'Error creating post.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleContactHandy = async (handy: any) => {
    if (!handy?._id) {
      toast.error("Handy information not available");
      return;
    }

    setLoadingConversation(handy._id);
    setSelectedHandy(handy);

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserId: handy._id
        })
      });

      if (res.ok) {
        const conversation = await res.json();
        console.log("Conversation created/found:", conversation);

        if (conversation.isExisting) {
          router.push(`/conversations?id=${conversation._id}`);
        } else {
          setConversationId(conversation._id);
          setShowMessageDialog(true);
        }
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Error creating conversation");
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
        toast.success("Message sent successfully");
        setMessageContent("");
        setShowMessageDialog(false);
        router.push(`/conversations?id=${conversationId}`);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  }

  useEffect(() => {
    getHandys()
    getCurrentUser()
  }, [])

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-base-content">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-end mb-4">
            <button
              className="btn btn-accent gap-2"
              onClick={() => router.push('/conversations')}
            >
              <MessageSquare size={18} />
              Messages
            </button>
          </div>
          <h1 className="text-4xl font-bold text-white">Find a Handy</h1>
          <p className="mt-2 text-white/70">Connect with skilled professionals for your needs.</p>
        </div>

        {/* Post Input Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body flex-row items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content w-12 rounded-full">
                <User size={24} />
              </div>
            </div>
            <div className="relative w-full">
              <textarea
                className="textarea textarea-bordered w-full resize-y min-h-[6rem] focus:textarea-primary"
                placeholder="What are you looking for today?"
                value={post}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPost(e.target.value)}
                disabled={isPosting}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  className="btn btn-primary"
                  onClick={sendPost}
                  disabled={isPosting || !post.trim()}
                >
                  {isPosting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <Send size={20} />
                  )}
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="form-control w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or specialty..."
                className="input input-bordered w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <select className="select select-bordered w-full md:w-auto" defaultValue="">
            <option disabled value="">Filter by Specialty</option>
            <option>Plumbing</option>
            <option>Electrician</option>
            <option>Carpentry</option>
            <option>Gardening</option>
          </select>
        </div>

        {/* Handyman Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {handysData.map((item: any, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                        {item.profile_pic ? <img src={item.profile_pic} /> : <span className="text-xl">{item.name?.[0]?.toUpperCase()}</span>}
                      </div>
                    </div>
                    <div>
                      <h2 className="card-title text-lg">{item.name}</h2>
                      <div className="badge badge-secondary badge-sm gap-1">
                        <Briefcase size={10} />
                        {item.specialty}
                      </div>
                    </div>
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1 text-warning font-bold">
                      <span>{item.rating}</span>
                      <Star size={16} fill="currentColor" />
                    </div>
                  )}
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-base-content/80">
                  {item.description}
                </p>

                <div className="card-actions mt-6 justify-end">
                  {currentUser && currentUser._id !== item._id && (
                    <button
                      className="btn btn-primary btn-sm w-full"
                      onClick={() => handleContactHandy(item)}
                      disabled={loadingConversation === item._id}
                    >
                      {loadingConversation === item._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Contact"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Dialog */}
      {
        showMessageDialog && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                Send Message to {selectedHandy?.name || "User"}
              </h3>

              {selectedHandy?.specialty && (
                <div className="badge badge-secondary mb-4">{selectedHandy.specialty}</div>
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
                      <Send size={18} />
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
        )
      }
    </div >
  )
}

export default HandysPage
