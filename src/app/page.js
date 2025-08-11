
// "use client"
// import { useState, useEffect } from 'react';

// import { collection, getDocs, orderBy, query, onSnapshot } from 'firebase/firestore';

// import ImageGallery from './components/ImageGallery';
// import { db } from './lib/firebase';
// import ImageUpload from './components/ImageUpload';

// export default function Home() {
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Set up real-time listener for images
//     const q = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
    
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const imageList = [];
//       snapshot.forEach((doc) => {
//         imageList.push({
//           id: doc.id,
//           ...doc.data()
//         });
//       });
//       setImages(imageList);
//       setLoading(false);
//     }, (error) => {
//       console.error('Error fetching images:', error);
//       setLoading(false);
//     });

//     // Cleanup listener on unmount
//     return () => unsubscribe();
//   }, []);

//   const handleUploadSuccess = (newImage) => {
//     // Real-time listener will automatically update the images
//     // No need to manually update state
//   };

//   const handleDelete = (deletedId) => {
//     // Real-time listener will automatically update the images
//     // No need to manually update state
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-xl">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-bold text-black text-center mb-8">Image Gallery App</h1>
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-1">
//             <ImageUpload onUploadSuccess={handleUploadSuccess} />
//           </div>
          
//           <div className="lg:col-span-2">
//             <ImageGallery images={images} onDelete={handleDelete} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4 py-8">
        <div className="max-w-4xl w-full text-center space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              <span className="text-4xl sm:text-5xl lg:text-6xl">📷</span>
              <br className="sm:hidden" />
              <span className="sm:ml-3">Photokeep App</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              Upload your favorite photos and explore the gallery in real-time
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-base sm:text-lg touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              <span className="mr-2">📤</span>
              Upload Photos
            </Link>

            <Link
              href="/gallery"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-base sm:text-lg touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              <span className="mr-2">🖼️</span>
              View Gallery
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-sm border border-white/20">
                <div className="text-2xl sm:text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Fast Upload</h3>
                <p className="text-xs sm:text-sm text-gray-600">Quick and easy photo uploads</p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-sm border border-white/20">
                <div className="text-2xl sm:text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Secure Storage</h3>
                <p className="text-xs sm:text-sm text-gray-600">Your photos are safely stored</p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-sm border border-white/20 sm:col-span-2 lg:col-span-1">
                <div className="text-2xl sm:text-3xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Mobile Friendly</h3>
                <p className="text-xs sm:text-sm text-gray-600">Works perfectly on all devices</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 bg-gray-50 text-center text-gray-600 text-sm select-none">
        Made with <span className="text-red-500">❤️</span> by Saraswati Adkine
      </footer>
    </>
  );
}
