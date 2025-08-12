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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Back to Login Button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Back to Login
        </Link>
      </div>

      {/* Full Width Gallery Container */}
      <div className="w-full pt-16">
        <ImageGallery
          images={images}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}
