// components/ImageUpload.js - Modern UI with Drag & Drop and Preview
'use client';

import { useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ImageUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
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
          title: file.name.split('.')[0],
          description: '',
          preview: URL.createObjectURL(file)
        };
        validFiles.push(fileWithPreview);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
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

  const updateFileInfo = (fileId, field, value) => {
    setSelectedFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, [field]: value } : f)
    );
  };

  const uploadFile = async (fileData) => {
    const formData = new FormData();
    formData.append('image', fileData.file);
    formData.append('title', fileData.title);
    formData.append('description', fileData.description);

    try {
      setUploadProgress(prev => ({ ...prev, [fileData.id]: { status: 'uploading', progress: 0 } }));
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const imageData = await uploadResponse.json();
      const docRef = await addDoc(collection(db, 'images'), imageData);

      setUploadProgress(prev => ({ ...prev, [fileData.id]: { status: 'success', progress: 100 } }));
      return { id: docRef.id, ...imageData };
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [fileData.id]: { status: 'error', error: error.message } }));
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert('Please select at least one image to upload.');

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(uploadFile);
      const results = await Promise.allSettled(uploadPromises);

      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          onUploadSuccess(result.value);
          URL.revokeObjectURL(selectedFiles[index].preview);
        } else {
          errorCount++;
          console.error(`Upload failed for ${selectedFiles[index].file.name}:`, result.reason);
        }
      });

      setSelectedFiles([]);
      setUploadProgress({});
      alert(
        successCount > 0 && errorCount === 0
          ? `Successfully uploaded ${successCount} image(s)!`
          : successCount > 0
            ? `Uploaded ${successCount} image(s). ${errorCount} failed.`
            : 'All uploads failed.'
      );
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
    setUploadProgress({});
  };

  return (
    <div className="bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">📤 Upload Your Images</h2>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl text-indigo-400">🖼️</div>
          <div>
            <p className="text-lg font-medium text-gray-800">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:underline font-semibold"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              JPEG, PNG, GIF, WebP — max 5MB
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

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Selected Images ({selectedFiles.length})</h3>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-600 underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <div key={fileData.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
                <div className="flex gap-4">
                  <img
                    src={fileData.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{fileData.file.name}</p>
                        <p className="text-xs text-gray-400">{Math.round(fileData.file.size / 1024)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileData.id)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        ✖ Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={fileData.title}
                        onChange={(e) => updateFileInfo(fileData.id, 'title', e.target.value)}
                        placeholder="Title"
                        className="text-sm p-2 border text-gray-800 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={fileData.description}
                        onChange={(e) => updateFileInfo(fileData.id, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="text-sm p-2 border text-gray-800 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    {uploadProgress[fileData.id] && (
                      <div className="mt-1 text-sm">
                        {uploadProgress[fileData.id].status === 'uploading' && (
                          <span className="text-blue-600 animate-pulse">Uploading...</span>
                        )}
                        {uploadProgress[fileData.id].status === 'success' && (
                          <span className="text-green-600">✅ Uploaded</span>
                        )}
                        {uploadProgress[fileData.id].status === 'error' && (
                          <span className="text-red-500">❌ {uploadProgress[fileData.id].error}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
          >
            {uploading
              ? `Uploading ${selectedFiles.length} image(s)...`
              : `Upload ${selectedFiles.length} image(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
