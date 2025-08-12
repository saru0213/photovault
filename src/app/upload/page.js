"use client";

import ImageUpload from "../components/ImageUpload";
import Link from "next/link";

export default function UploadPage() {
  const handleUploadSuccess = (uploadedImage) => {
    console.log("Image uploaded:", uploadedImage);
    // You can show a toast, redirect, or update state here
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Back to Login Button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Back to Login
        </Link>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 pt-16">
        <div className="max-w-3xl mx-auto">
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Bottom Safe Area for mobile devices */}
      <div className="h-4 sm:h-8"></div>
    </div>
  );
}
