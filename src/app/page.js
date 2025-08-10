
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
      <div className="max-w-4xl w-full text-center space-y-10">
        <h1 className="text-5xl font-bold text-gray-800">
          📷 Welcome to Image Gallery App
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your favorite photos and explore the gallery in real-time.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/upload"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Upload Photo
          </Link>

          <Link
            href="/gallery"
            className="px-8 py-4 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
          >
            View Gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
