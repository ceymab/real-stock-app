"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  const [name , setName] = useState("");

  useEffect(() => {
    console.log("form submiited",{name})
  },[name])

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    console.log("Form Sumited",{name})
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
    <input type="text" placeholder="Enter Your name " value={name} onChange={(e) => setName(e.target.value)} />

    <button type="submit">submit</button>
      </form>
    </div>
  );
}
