"use client";

import ImageUpload from "../components/ImageUpload";
import Link from "next/link";

export default function UploadPage() {
  const handleUploadSuccess = (uploadedImage) => {
    console.log("Image uploaded:", uploadedImage);
    // You can show a toast, redirect, or update state here
  };

  return (
    <div className="min-h-screen bg-gray-100">
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



      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
      
      {/* Bottom Safe Area for mobile devices */}
      <div className="h-4 sm:h-8"></div>
    </div>
  );
}