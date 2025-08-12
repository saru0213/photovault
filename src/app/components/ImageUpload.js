// // components/ImageUpload.js - Device-Friendly UI with Simple Features
// 'use client';

// import { useState, useRef } from 'react';
// import { db } from '../lib/firebase';
// import { collection, addDoc } from 'firebase/firestore';
// import Image from 'next/image';

// export default function ImageUpload({ onUploadSuccess }) {
//   const [uploading, setUploading] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const fileInputRef = useRef(null);

//   const validateFile = (file) => {
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     const maxSize = 5 * 1024 * 1024; // 5MB
    
//     if (!validTypes.includes(file.type)) {
//       return { valid: false, error: 'Only images allowed (JPEG, PNG, GIF, WebP)' };
//     }
//     if (file.size > maxSize) {
//       return { valid: false, error: 'File too large (max 5MB)' };
//     }
//     return { valid: true };
//   };

//   const handleFiles = (files) => {
//     const validFiles = [];
//     const errors = [];
    
//     Array.from(files).forEach((file, index) => {
//       const validation = validateFile(file);
//       if (validation.valid) {
//         const fileWithPreview = {
//           file,
//           id: `${Date.now()}-${index}`,
//           title: file.name.split('.')[0].substring(0, 30), // Limit title length
//           preview: URL.createObjectURL(file)
//         };
//         validFiles.push(fileWithPreview);
//       } else {
//         errors.push(`${file.name}: ${validation.error}`);
//       }
//     });

//     if (errors.length > 0) {
//       alert(errors.join('\n'));
//     }
    
//     setSelectedFiles(prev => [...prev, ...validFiles]);
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === 'dragenter' || e.type === 'dragover');
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFiles(e.dataTransfer.files);
//     }
//   };

//   const handleFileInput = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       handleFiles(e.target.files);
//     }
//   };

//   const removeFile = (fileId) => {
//     setSelectedFiles(prev => {
//       const updated = prev.filter(f => f.id !== fileId);
//       const fileToRemove = prev.find(f => f.id === fileId);
//       if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
//       return updated;
//     });
//   };

//   const updateTitle = (fileId, value) => {
//     setSelectedFiles(prev =>
//       prev.map(f => f.id === fileId ? { ...f, title: value.substring(0, 50) } : f)
//     );
//   };

//   const uploadFile = async (fileData) => {
//     const formData = new FormData();
//     formData.append('image', fileData.file);
//     formData.append('title', fileData.title);

//     const uploadResponse = await fetch('/api/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     if (!uploadResponse.ok) {
//       let errorMessage = 'Upload failed';
//       try {
//         const errorData = await uploadResponse.json();
//         errorMessage = errorData.error || `Upload failed (${uploadResponse.status})`;
//       } catch (jsonError) {
//         errorMessage = `Upload failed (${uploadResponse.status}: ${uploadResponse.statusText})`;
//       }
//       throw new Error(errorMessage);
//     }

//     let imageData;
//     try {
//       imageData = await uploadResponse.json();
//     } catch (jsonError) {
//       throw new Error('Invalid response from server');
//     }

//     const docRef = await addDoc(collection(db, 'images'), imageData);
    
//     return { id: docRef.id, ...imageData };
//   };

//   const handleSubmit = async () => {
//     if (selectedFiles.length === 0) {
//       alert('Please select images to upload');
//       return;
//     }

//     setUploading(true);
//     let successCount = 0;
//     let errorCount = 0;

//     try {
//       for (const fileData of selectedFiles) {
//         try {
//           const result = await uploadFile(fileData);
//           onUploadSuccess(result);
//           URL.revokeObjectURL(fileData.preview);
//           successCount++;
//         } catch (error) {
//           console.error(`Upload failed for ${fileData.file.name}:`, error);
//           errorCount++;
//         }
//       }

//       setSelectedFiles([]);
      
//       if (successCount > 0 && errorCount === 0) {
//         alert(`Successfully uploaded ${successCount} image(s)!`);
//       } else if (successCount > 0) {
//         alert(`Uploaded ${successCount} image(s). ${errorCount} failed.`);
//       } else {
//         alert('Upload failed. Please try again.');
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   const clearAll = () => {
//     selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
//     setSelectedFiles([]);
//   };

//   return (
//     <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mx-auto max-w-2xl">
//       {/* Header */}
//       <div className="text-center mb-4">
//         <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Upload Images</h2>
//         <p className="text-sm text-gray-600">Select multiple images to upload</p>
//       </div>

//       {/* Upload Area */}
//       <div
//         className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors touch-manipulation ${
//           dragActive 
//             ? 'border-blue-400 bg-blue-50' 
//             : 'border-gray-300 bg-gray-50 hover:border-blue-300'
//         }`}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         <div className="space-y-3">
//           <div className="text-4xl sm:text-5xl">📷</div>
//           <div>
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
//             >
//               Choose Images
//             </button>
//             <p className="text-xs sm:text-sm text-gray-500 mt-2">
//               Or drag and drop here
//             </p>
//             <p className="text-xs text-gray-400 mt-1">
//               JPEG, PNG, GIF, WebP • Max 5MB each
//             </p>
//           </div>
//         </div>
        
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={handleFileInput}
//           className="hidden"
//         />
//       </div>

//       {/* Selected Files */}
//       {selectedFiles.length > 0 && (
//         <div className="mt-4">
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-sm font-medium text-gray-700">
//               {selectedFiles.length} image(s) selected
//             </span>
//             <button
//               type="button"
//               onClick={clearAll}
//               className="text-sm text-red-500 hover:text-red-600 font-medium"
//             >
//               Clear All
//             </button>
//           </div>

//           {/* Files List */}
//           <div className="space-y-3 max-h-80 overflow-y-auto">
//             {selectedFiles.map((fileData) => (
//               <div key={fileData.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
//                 <div className="flex gap-3">
//                   {/* Image Preview */}
//                   <Image
//                   width={300}
//                   height={200}
//                     src={fileData.preview}
//                     alt="Preview"
//                     className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border flex-shrink-0"
//                   />
                  
//                   {/* File Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-start mb-2">
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-medium text-gray-700 truncate">
//                           {fileData.file.name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {(fileData.file.size / 1024).toFixed(0)} KB
//                         </p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeFile(fileData.id)}
//                         className="text-red-500 hover:text-red-600 p-1 ml-2"
//                       >
//                         <span className="text-sm">✕</span>
//                       </button>
//                     </div>
                    
//                     {/* Title Input */}
//                     <input
//                       type="text"
//                       value={fileData.title}
//                       onChange={(e) => updateTitle(fileData.id, e.target.value)}
//                       placeholder="Image title"
//                       className="w-full text-sm p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                       maxLength="50"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Upload Button */}
//           <button
//             onClick={handleSubmit}
//             disabled={uploading}
//             className="w-full mt-4 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium touch-manipulation"
//           >
//             {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }






// 'use client';

// import { useState, useRef } from 'react';
// import { Upload, X, Copy, Check, Image, AlertTriangle } from 'lucide-react';

// export default function SimpleImageUpload({ onUploadSuccess }) {
//   const [uploading, setUploading] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [uploadedLinks, setUploadedLinks] = useState([]);
//   const [copiedLinks, setCopiedLinks] = useState({});
//   const [errors, setErrors] = useState([]);
//   const fileInputRef = useRef(null);

//   const validateFile = (file) => {
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     const maxSize = 5 * 1024 * 1024; // 5MB
    
//     if (!validTypes.includes(file.type)) {
//       return { valid: false, error: 'Only images allowed' };
//     }
//     if (file.size > maxSize) {
//       return { valid: false, error: 'File too large (max 5MB)' };
//     }
//     return { valid: true };
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 B';
//     const k = 1024;
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
//   };

//   const handleFiles = (files) => {
//     const validFiles = [];
//     const newErrors = [];
    
//     Array.from(files).forEach((file, index) => {
//       const validation = validateFile(file);
//       if (validation.valid) {
//         validFiles.push({
//           file,
//           id: `${Date.now()}-${index}`,
//           title: file.name.split('.')[0].substring(0, 30),
//           preview: URL.createObjectURL(file),
//           size: file.size,
//         });
//       } else {
//         newErrors.push(`${file.name}: ${validation.error}`);
//       }
//     });
    
//     setErrors(newErrors);
//     setSelectedFiles(prev => [...prev, ...validFiles]);
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === 'dragenter' || e.type === 'dragover');
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFiles(e.dataTransfer.files);
//     }
//   };

//   const handleFileInput = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       handleFiles(e.target.files);
//     }
//   };

//   const removeFile = (fileId) => {
//     setSelectedFiles(prev => {
//       const updated = prev.filter(f => f.id !== fileId);
//       const fileToRemove = prev.find(f => f.id === fileId);
//       if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
//       return updated;
//     });
//   };

//   const updateTitle = (fileId, value) => {
//     setSelectedFiles(prev =>
//       prev.map(f => f.id === fileId ? { ...f, title: value.substring(0, 50) } : f)
//     );
//   };

//   const uploadFile = async (fileData) => {
//     const formData = new FormData();
//     formData.append('image', fileData.file);
//     formData.append('title', fileData.title);

//     const uploadResponse = await fetch('/api/upload', { 
//       method: 'POST', 
//       body: formData 
//     });

//     if (!uploadResponse.ok) {
//       const errorData = await uploadResponse.json().catch(() => null);
//       throw new Error(errorData?.error || 'Upload failed');
//     }

//     const imageData = await uploadResponse.json();
    
//     setUploadedLinks(prev => [...prev, {
//       url: imageData.url,
//       title: fileData.title,
//       id: imageData.id,
//       timestamp: new Date().toISOString()
//     }]);

//     return { id: imageData.id, ...imageData };
//   };

//   const handleSubmit = async () => {
//     if (selectedFiles.length === 0) return;
    
//     setUploading(true);
//     setErrors([]);
//     const uploadErrors = [];

//     try {
//       for (const fileData of selectedFiles) {
//         try {
//           const result = await uploadFile(fileData);
//           if (onUploadSuccess) onUploadSuccess(result);
//           URL.revokeObjectURL(fileData.preview);
//         } catch (error) {
//           uploadErrors.push(`${fileData.file.name}: ${error.message}`);
//         }
//       }
      
//       setSelectedFiles([]);
      
//       if (uploadErrors.length > 0) {
//         setErrors(uploadErrors);
//       }
      
//     } finally {
//       setUploading(false);
//     }
//   };

//   const copyToClipboard = async (link, id) => {
//     try {
//       await navigator.clipboard.writeText(link);
//       setCopiedLinks(prev => ({ ...prev, [id]: true }));
//       setTimeout(() => {
//         setCopiedLinks(prev => ({ ...prev, [id]: false }));
//       }, 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4 sm:p-6">
//       <div className="bg-white rounded-lg shadow-md border">
//         {/* Header */}
//         <div className="p-4 sm:p-6 border-b">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Upload className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload Images</h2>
//               <p className="text-sm text-gray-500">Share your images instantly</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6 space-y-6">
//           {/* Errors */}
//           {errors.length > 0 && (
//             <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
//                 <AlertTriangle className="w-4 h-4" />
//                 Errors
//               </div>
//               <div className="text-sm text-red-600 space-y-1">
//                 {errors.map((error, idx) => (
//                   <div key={idx}>• {error}</div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Upload Area */}
//           <div
//             className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
//               dragActive 
//                 ? 'border-blue-400 bg-blue-50' 
//                 : 'border-gray-300 hover:border-gray-400'
//             }`}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//           >
//             <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
//               <Image className="w-6 h-6 text-gray-500" />
//             </div>
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium mb-2"
//             >
//               Choose Images
//             </button>
//             <p className="text-sm text-gray-500">Or drag and drop here</p>
//             <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP • Max 5MB</p>
            
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={handleFileInput}
//               className="hidden"
//             />
//           </div>

//           {/* Selected Files */}
//           {selectedFiles.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-medium text-gray-900">
//                   {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''}
//                 </h3>
//                 <button 
//                   onClick={() => {
//                     selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
//                     setSelectedFiles([]);
//                   }}
//                   className="text-sm text-red-600 hover:text-red-700"
//                 >
//                   Clear All
//                 </button>
//               </div>
              
//               <div className="space-y-3">
//                 {selectedFiles.map(fileData => (
//                   <div key={fileData.id} className="flex gap-3 p-3 border rounded-lg">
//                     <img 
//                       src={fileData.preview} 
//                       alt="Preview" 
//                       className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover flex-shrink-0"
//                     />
                    
//                     <div className="flex-1 min-w-0">
//                       <input
//                         type="text"
//                         value={fileData.title}
//                         onChange={(e) => updateTitle(fileData.id, e.target.value)}
//                         placeholder="Image title..."
//                         className="w-full p-2 text-gray-800 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       />
//                       <div className="text-xs text-gray-500 mt-1">
//                         {formatFileSize(fileData.size)}
//                       </div>
//                     </div>
                    
//                     <button 
//                       onClick={() => removeFile(fileData.id)}
//                       className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
              
//               <button
//                 onClick={handleSubmit}
//                 disabled={uploading}
//                 className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {uploading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="w-4 h-4" />
//                     Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
//                   </>
//                 )}
//               </button>
//             </div>
//           )}

//           {/* Success Links */}
//           {uploadedLinks.length > 0 && (
//             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//               <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
//                 <Check className="w-4 h-4" />
//                 Uploaded Successfully ({uploadedLinks.length})
//               </h3>
//               <div className="space-y-2">
//                 {uploadedLinks.map((linkData, idx) => (
//                   <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium text-sm text-gray-900 truncate">
//                         {linkData.title}
//                       </div>
//                       <a 
//                         href={linkData.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className="text-xs text-blue-600 hover:text-blue-700 break-all"
//                       >
//                         {linkData.url}
//                       </a>
//                     </div>
//                     <button
//                       onClick={() => copyToClipboard(linkData.url, linkData.id)}
//                       className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
//                         copiedLinks[linkData.id]
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
//                       }`}
//                     >
//                       {copiedLinks[linkData.id] ? (
//                         <>
//                           <Check className="w-3 h-3 inline mr-1" />
//                           Copied
//                         </>
//                       ) : (
//                         <>
//                           <Copy className="w-3 h-3 inline mr-1" />
//                           Copy
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// components/ImageUpload.js - Device-Friendly UI with Simple Features
'use client';

import { useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function ImageUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]); // Add state for uploaded links
  const [copiedLinks, setCopiedLinks] = useState({}); // Add state for copy status
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Only images allowed (JPEG, PNG, GIF, WebP)' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 5MB)' };
    }
    return { valid: true };
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];
    
    Array.from(files).forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileWithPreview = {
          file,
          id: `${Date.now()}-${index}`,
          title: file.name.split('.')[0].substring(0, 30), // Limit title length
          preview: URL.createObjectURL(file)
        };
        validFiles.push(fileWithPreview);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return updated;
    });
  };

  const updateTitle = (fileId, value) => {
    setSelectedFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, title: value.substring(0, 50) } : f)
    );
  };

  const uploadFile = async (fileData) => {
    const formData = new FormData();
    formData.append('image', fileData.file);
    formData.append('title', fileData.title);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error || `Upload failed (${uploadResponse.status})`;
      } catch (jsonError) {
        errorMessage = `Upload failed (${uploadResponse.status}: ${uploadResponse.statusText})`;
      }
      throw new Error(errorMessage);
    }

    let imageData;
    try {
      imageData = await uploadResponse.json();
    } catch (jsonError) {
      throw new Error('Invalid response from server');
    }

    const docRef = await addDoc(collection(db, 'images'), imageData);
    
    return { id: docRef.id, ...imageData };
  };

  // Add copy to clipboard function
  const copyToClipboard = async (link, id) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinks(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedLinks(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setCopiedLinks(prev => ({ ...prev, [id]: false }));
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select images to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const newUploadedLinks = []; // Store successful uploads

    try {
      for (const fileData of selectedFiles) {
        try {
          const result = await uploadFile(fileData);
          onUploadSuccess(result);
          URL.revokeObjectURL(fileData.preview);
          successCount++;
          
          // Add to uploadedLinks state
          newUploadedLinks.push({
            url: result.url,
            title: fileData.title,
            id: result.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Upload failed for ${fileData.file.name}:`, error);
          errorCount++;
        }
      }

      // Update uploaded links state
      setUploadedLinks(prev => [...prev, ...newUploadedLinks]);
      setSelectedFiles([]);
      
      if (successCount > 0 && errorCount === 0) {
        alert(`Successfully uploaded ${successCount} image(s)!`);
      } else if (successCount > 0) {
        alert(`Uploaded ${successCount} image(s). ${errorCount} failed.`);
      } else {
        alert('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mx-auto max-w-2xl">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Upload Images</h2>
        <p className="text-sm text-gray-600">Select multiple images to upload</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors touch-manipulation ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-blue-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className="text-4xl sm:text-5xl">📷</div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
            >
              Choose Images
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Or drag and drop here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, GIF, WebP • Max 5MB each
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedFiles.length} image(s) selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <div key={fileData.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex gap-3">
                  {/* Image Preview */}
                  <Image
                  width={300}
                  height={200}
                    src={fileData.preview}
                    alt="Preview"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border flex-shrink-0"
                  />
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fileData.file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileData.id)}
                        className="text-red-500 hover:text-red-600 p-1 ml-2"
                      >
                        <span className="text-sm">✕</span>
                      </button>
                    </div>
                    
                    {/* Title Input */}
                    <input
                      type="text"
                      value={fileData.title}
                      onChange={(e) => updateTitle(fileData.id, e.target.value)}
                      placeholder="Image title"
                      className="w-full text-sm p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      maxLength="50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full mt-4 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium touch-manipulation"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
          </button>
        </div>
      )}

      {/* Shareable Links Section */}
      {uploadedLinks.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <h3 className="text-sm font-semibold text-green-800">
              Successfully Uploaded ({uploadedLinks.length})
            </h3>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {uploadedLinks.map((linkData, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 mb-1 truncate">
                    {linkData.title}
                  </div>
                  <a 
                    href={linkData.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:text-blue-700 break-all underline"
                  >
                    {linkData.url}
                  </a>
                </div>
                
                <button
                  onClick={() => copyToClipboard(linkData.url, linkData.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation min-w-16 ${
                    copiedLinks[linkData.id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copiedLinks[linkData.id] ? (
                    <span>✓ Copied</span>
                  ) : (
                    <span>📋 Copy</span>
                  )}
                </button>
              </div>
            ))}
          </div>
          
          {/* Clear uploaded links button */}
          <button
            onClick={() => setUploadedLinks([])}
            className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 py-2"
          >
            Clear Links
          </button>
        </div>
      )}
    </div>
  );
}