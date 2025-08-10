"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";

import ImageGallery from "../components/ImageGallery";
import { db } from "../lib/firebase";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "images"), orderBy("uploadedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const imageList = [];
        snapshot.forEach((doc) => {
          imageList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setImages(imageList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching images:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = (deletedId) => {
    // Real-time listener auto updates images
  };

  return (
    


<div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ← Back to Home
          </Link>
        </div>

      
         <ImageGallery images={images} onDelete={handleDelete} loading={loading} /> 
      </div>
    </div>
  );
}
