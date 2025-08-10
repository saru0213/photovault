"use client";

import ImageUpload from "../components/ImageUpload";
import Link from "next/link";

export default function UploadPage() {
  const handleUploadSuccess = (uploadedImage) => {
    console.log("Image uploaded:", uploadedImage);
    // You can show a toast, redirect, or update state here
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

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Upload Image
        </h1>
        <ImageUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
}
