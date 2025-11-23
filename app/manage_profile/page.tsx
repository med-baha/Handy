'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, FileText, Briefcase, Image as ImageIcon } from "lucide-react";

const Page = () => {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter()
  // Load from sessionStorage once
  useEffect(() => {
    const saved = sessionStorage.getItem("userData");
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setUserData((prev: any) => {
      const updated = { ...prev, [name]: value };
      sessionStorage.setItem("userData", JSON.stringify(updated)); // update sessionStorage too
      return updated;
    });
  };

  if (!userData) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const handelUpdate = async () => {
    if (!userData) {
      console.log("empty!!");
      return;
    }

    // ---- VALIDATION ----
    if (
      !userData.name ||
      !userData.specialty ||
      !userData.description
    ) {
      console.log("Please fill all fields");
      return; // stop here, do NOT redirect
    }

    try {
      console.log("SENDING:", userData);

      const res = await fetch(`http://localhost:3001/api/users/${userData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        console.log("Update failed");
        return; // stop redirecting
      }

      router.push("/"); // only redirect if success
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 font-sans text-base-content">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 border-b pb-2">Manage Profile</h2>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text flex items-center gap-2"><User size={16} /> Name</span>
            </label>
            <input
              name="name"
              value={userData.name}
              type="text"
              className="input input-bordered w-full"
              onChange={handleChange}
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text flex items-center gap-2"><Briefcase size={16} /> Specialty</span>
            </label>
            <input
              name="specialty"
              value={userData.specialty}
              type="text"
              className="input input-bordered w-full"
              onChange={handleChange}
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text flex items-center gap-2"><FileText size={16} /> Description</span>
            </label>
            <textarea
              name="description"
              value={userData.description}
              className="textarea textarea-bordered h-24"
              onChange={handleChange}
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text flex items-center gap-2"><ImageIcon size={16} /> Profile Picture</span>
            </label>
            <input
              name="profilePicture"
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
            />
          </div>

          <div className="card-actions justify-end mt-8">
            <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
            <button className="btn btn-primary gap-2" onClick={handelUpdate}>
              <Save size={18} />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
