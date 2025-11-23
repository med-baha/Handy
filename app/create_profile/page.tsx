"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Briefcase, Search, ArrowRight, Image as ImageIcon } from 'lucide-react'

const SingUpPage = () => {
  const [active, setActive] = useState("");

  return (
    active === "" ? (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4 font-sans text-base-content">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Handy!</h1>
          <p className="text-xl text-base-content/70">Let's get you set up. How do you want to use the platform?</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
          {/* Handyman Option */}
          <div className="card flex-1 bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-primary" onClick={() => setActive("handyman")}>
            <div className="card-body items-center text-center py-12">
              <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
                <Briefcase size={48} />
              </div>
              <h2 className="card-title text-2xl">I'm a Handyman</h2>
              <p>I want to offer my services and find jobs.</p>
              <button className="btn btn-primary mt-6 gap-2">
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Client Option */}
          <div className="card flex-1 bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-secondary" onClick={() => setActive("no")}>
            <div className="card-body items-center text-center py-12">
              <div className="p-4 bg-secondary/10 rounded-full mb-4 text-secondary">
                <Search size={48} />
              </div>
              <h2 className="card-title text-2xl">I'm Looking for Help</h2>
              <p>I want to find professionals for my projects.</p>
              <button className="btn btn-secondary mt-6 gap-2">
                Find Pros <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : active === "handyman" ? (
      <HandyForm />
    ) : active === "no" ? (
      <NonHandyForm />
    ) : null
  );

}

const HandyForm = () => {
  const [formData, setFormData] = useState({
    specialty: "",
    description: "",
    profilePicture: ""
  })
  const router = useRouter()
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true)
    const updatedData = { ...formData, is_handy: true };

    const token = await getToken()
    await fetch("http://localhost:3001/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedData),
    })
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 font-sans text-base-content">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-2">Handyman Profile</h2>
          <p className="text-base-content/60 mb-6">Tell us about your skills to get matched with jobs.</p>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">What is your specialty?</span></label>
              <input
                onChange={handleChange}
                name='specialty'
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Plumber, Electrician, Carpenter"
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea
                onChange={handleChange}
                name='description'
                className="textarea textarea-bordered h-24"
                placeholder="Describe your experience and services..."
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Profile Picture</span></label>
              <input
                onChange={handleChange}
                name='profilePicture'
                type="file"
                className="file-input file-input-bordered w-full"
                accept='image/*'
              />
            </div>

            <button type='submit' className="btn btn-primary w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const NonHandyForm = () => {
  const [formData, setFormData] = useState({
    profilePicture: "",
    is_company: "true",
    post: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedData = { ...formData, is_handy: false };
    const token = await getToken()
    await fetch("http://localhost:3001/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedData),
    });
    router.push('/handys')
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 font-sans text-base-content">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-2">Client Profile</h2>
          <p className="text-base-content/60 mb-6">Let's set up your account to find help.</p>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">I represent:</span></label>
              <div className="flex gap-6">
                <label className="label cursor-pointer gap-2 border rounded-lg p-3 flex-1 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="is_company"
                    value="true"
                    checked={formData.is_company === "true"}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text">A Company</span>
                </label>
                <label className="label cursor-pointer gap-2 border rounded-lg p-3 flex-1 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="is_company"
                    value="false"
                    checked={formData.is_company === "false"}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text">An Individual</span>
                </label>
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">What are you looking for?</span></label>
              <textarea
                onChange={handleChange}
                name='post'
                className="textarea textarea-bordered h-24"
                placeholder="Briefly describe what you need help with..."
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Profile Picture</span></label>
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                accept='image/*'
                onChange={handleChange}
              />
            </div>

            <button className="btn btn-primary w-full mt-6" type='submit' disabled={isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default SingUpPage
