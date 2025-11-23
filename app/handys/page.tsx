'use client'
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Search, Send, Star, User, Briefcase } from "lucide-react"

const HandysPage = () => {
  const [userData, setUserData] = useState({})
  const { getToken } = useAuth()
  const [post, setPost] = useState("")
  const userid = "fdsqesgtellllll" // This seems hardcoded in original, keeping it for now but it's suspicious

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
    setUserData(data)
  }

  const handlechnage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost(e.target.value)
  }

  const sendPost = async () => {
    const res = await fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userid, post })
    })
    // Ideally clear input or show success here
  }

  useEffect(() => {
    getHandys()
  }, [])

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-base-content">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Find a Handy</h1>
          <p className="mt-2 text-base-content/70">Connect with skilled professionals for your needs.</p>
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
              <input
                type="text"
                className="input input-bordered w-full pr-12 focus:input-primary"
                placeholder="What are you looking for today?"
                onChange={handlechnage}
              />
              <button
                className="btn btn-ghost btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                onClick={sendPost}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Handyman Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(userData).map((item: any, index) => (
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
                  <button className="btn btn-primary btn-sm w-full">Contact</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HandysPage
