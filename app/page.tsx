"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import SingUpPage from "./create_profile/page";
import HandysPage from "./handys/page";
import HandyProfile from "./my_profile/page";

export default function Home() {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<any>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);


  // get the cuurent user
  const getMe = async () => {
    try {
      // If Clerk not ready, exit early
      if (!isLoaded || !isSignedIn) {
        if (isLoaded && !isSignedIn) setIsLoadingData(false);
        return;
      }

      const token = await getToken();

      // 1. Try cache
      const storedUserData = sessionStorage.getItem("userData");

      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);

          if (Object.keys(parsed).length > 0) {
            setUserData(parsed);
            setIsLoadingData(false);
            return; // STOP HERE → no fetch
          }
        } catch {
          // ignore corrupted cache
        }
      }

      // 2. Fetch only if no cache
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.status)
      if (!res.ok) {
        setNotFound(true);
        setIsLoadingData(false);
        return;
      }

      // Success
      const data = await res.json();

      if (data.is_handy === undefined) {
        setNotFound(true);
        setIsLoadingData(false);
        return;
      }

      // Save fresh data
      setUserData(data);
      sessionStorage.setItem("userData", JSON.stringify(data));

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingData(false);
    }
  };


  useEffect(() => {

    //const cache = await caches.open()
    getMe();
  }, [isLoaded, isSignedIn]);
  { console.log(notFound) }
  if (!isLoaded || isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-secondary"></span>
      </div>
    );
  }
  if (notFound) {
    return (<SingUpPage />)

  }
  else {
    if (userData.is_handy) {
      return (
        <HandyProfile userData={userData} />
      );
    } if (!userData.is_handy && !userData.is_handy === undefined) {
      return (
        <HandysPage />
      )
    }
  }

}


