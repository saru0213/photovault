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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
    <Link
      href="/"
      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation font-medium text-sm sm:text-base min-h-[44px] min-w-[44px]"
    >
      <span className="text-lg">←</span>
      <span className="hidden sm:inline">Back to Home</span>
    </Link>
  </div>
</div>




      {/* Full Width Gallery Container */}
      <div className="w-full">
        <ImageGallery images={images} onDelete={handleDelete} loading={loading} />
      </div>
    </div>
  );
}