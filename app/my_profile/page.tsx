"use client";
import { useRouter } from "next/navigation";
import { Briefcase, MessageSquare, Settings, Star, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const HandyProfile = ({ userData }: any) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingContractsCount, setPendingContractsCount] = useState(0);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: userData._id,  // Send the MongoDB ID instead of name
          post: postContent,
        }),
      });

      if (res.ok) {
        setSuccessMessage("Post created successfully!");
        setPostContent("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPendingContracts = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3001/api/contracts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const contracts = await res.json();
        // Count only pending contracts where the user is the receiver
        const pendingCount = contracts.filter(
          (c: any) => c.status === 'pending' && c.receiver._id === userData._id
        ).length;
        setPendingContractsCount(pendingCount);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  useEffect(() => {
    if (userData?._id) {
      fetchPendingContracts();
    }
  }, [userData]);


  if (!userData) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content">
      {/* Header Background */}
      <div className="h-48 w-full bg-gradient-to-r from-primary to-secondary opacity-90"></div>

      <div className="mx-auto -mt-24 max-w-4xl px-4 pb-12">
        {/* Main Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">

            {/* Avatar */}
            <div className="avatar -mt-20 mb-4">
              <div className="ring-primary ring-offset-base-100 w-32 rounded-full ring-4 ring-offset-4 bg-base-100">
                <img
                  src={userData.profile_pic || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt={userData.name}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name & Specialty */}
            <h2 className="card-title text-3xl font-bold">{userData.name}</h2>
            <div className="badge badge-secondary badge-lg mt-2 gap-2">
              <Briefcase size={14} />
              {userData.specialty}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-base-200 px-4 py-2">
              <span className="font-semibold">Rating:</span>
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: userData.rating }, (_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-base-content/80">
              {userData.description}
            </p>

            {/* Actions Divider */}
            <div className="divider my-8">Actions</div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="btn btn-primary gap-2"
                onClick={() => router.push('/manage_profile')}
              >
                <Settings size={18} />
                Manage Profile
              </button>

              <button
                className="btn btn-secondary gap-2"
                onClick={() => router.push('/jobs')}
              >
                <Briefcase size={18} />
                Job Offers
              </button>

              <button
                className="btn btn-accent gap-2"
                onClick={() => router.push('/conversations')}
              >
                <MessageSquare size={18} />
                Messages
              </button>

              <button
                className="btn btn-neutral gap-2 relative"
                onClick={() => router.push('/contracts')}
              >
                <Briefcase size={18} />
                Contracts
                {pendingContractsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-error-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {pendingContractsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h3 className="card-title text-2xl font-bold flex items-center gap-2">
              <Plus size={24} className="text-secondary" />
              Create Job Collaboration Post
            </h3>
            <p className="text-base-content/70 mb-4">
              Share job opportunities or collaboration requests with other professionals.
            </p>

            <textarea
              className="textarea textarea-bordered w-full h-32 resize-none"
              placeholder="Describe the job opportunity or collaboration you're looking for..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              disabled={isSubmitting}
            ></textarea>

            {successMessage && (
              <div className="alert alert-success">
                <span>{successMessage}</span>
              </div>
            )}

            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary gap-2"
                onClick={handleCreatePost}
                disabled={isSubmitting || !postContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandyProfile;
