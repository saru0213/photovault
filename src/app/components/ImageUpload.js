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

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select images to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const fileData of selectedFiles) {
        try {
          const result = await uploadFile(fileData);
          onUploadSuccess(result);
          URL.revokeObjectURL(fileData.preview);
          successCount++;
        } catch (error) {
          console.error(`Upload failed for ${fileData.file.name}:`, error);
          errorCount++;
        }
      }

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
    </div>
  );
}