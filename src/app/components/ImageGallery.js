// components/ImageGallery.js - Enhanced Gallery Component with Professional Design
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { db } from "../lib/firebase";
import { doc, deleteDoc, writeBatch } from "firebase/firestore";

export default function ImageGallery({ images, onDelete, loading = false }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedImages = useMemo(() => {
    let filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.description &&
          image.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case "name":
          return a.title.localeCompare(b.title);
        case "size":
          return b.size - a.size;
        case "newest":
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
    });
  }, [images, searchTerm, sortBy]);

  useEffect(() => {
    setSelectedImages(new Set());
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === "Escape") {
        setSelectedImage(null);
      } else if (e.key === "ArrowLeft") {
        navigateImage(-1);
      } else if (e.key === "ArrowRight") {
        navigateImage(1);
      } else if (e.key === "Delete") {
        e.preventDefault();
        handleSingleDelete(selectedImage);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  const handleImageError = (imageId) => {
    setImageErrors((prev) => new Set([...prev, imageId]));
  };

  const navigateImage = (direction) => {
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < filteredAndSortedImages.length) {
      setCurrentImageIndex(newIndex);
      setSelectedImage(filteredAndSortedImages[newIndex]);
    }
  };

  const openImageModal = (image) => {
    const index = filteredAndSortedImages.findIndex(
      (img) => img.id === image.id
    );
    setCurrentImageIndex(index);
    setSelectedImage(image);
  };

  const handleSingleDelete = async (image) => {
    if (confirm("Are you sure you want to delete this image?")) {
      setDeleting(image.id);
      try {
        const response = await fetch("/api/delete-cloudinary", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: image.publicId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete from Cloudinary");
        }

        await deleteDoc(doc(db, "images", image.id));
        onDelete(image.id);
        if (selectedImage && selectedImage.id === image.id) {
          setSelectedImage(null);
        }
      } catch (error) {
        alert("Failed to delete image: " + error.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`Delete ${selectedImages.size} selected image(s)?`)) return;

    setBulkDeleting(true);
    try {
      const selectedImageObjects = filteredAndSortedImages.filter((img) =>
        selectedImages.has(img.id)
      );

      const cloudinaryPromises = selectedImageObjects.map((image) =>
        fetch("/api/delete-cloudinary", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: image.publicId }),
        })
      );

      await Promise.all(cloudinaryPromises);

      const batch = writeBatch(db);
      selectedImageObjects.forEach((image) => {
        const docRef = doc(db, "images", image.id);
        batch.delete(docRef);
      });
      await batch.commit();

      selectedImageObjects.forEach((image) => onDelete(image.id));
      setSelectedImages(new Set());
    } catch (error) {
      alert("Bulk delete error: " + error.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) newSet.delete(imageId);
      else newSet.add(imageId);
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedImages(new Set(filteredAndSortedImages.map((img) => img.id)));
  };

  const deselectAll = () => {
    setSelectedImages(new Set());
  };

  const getImageSrc = (image) => {
    if (imageErrors.has(image.id)) {
      return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>
          <rect width='300' height='200' fill='#F9FAFB'/>
          <text x='150' y='90' text-anchor='middle' fill='#6B7280' font-size='14'>Image failed to load</text>
          <text x='150' y='110' text-anchor='middle' fill='#9CA3AF' font-size='12'>${image.title || "Untitled"}</text>
        </svg>
      `)}`;
    }
    return image.url;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <span className="text-gray-900 text-lg font-medium">Loading gallery...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Photo Gallery</h1>
              <div className="text-sm text-gray-600">
                {filteredAndSortedImages.length} {filteredAndSortedImages.length === 1 ? 'photo' : 'photos'}
                {selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
              </div>
            </div>
            
            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">By Name</option>
                  <option value="size">By Size</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                </div>

                {/* Selection Actions */}
                {selectedImages.size > 0 && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={selectAll}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bulkDeleting ? "Deleting..." : `Delete (${selectedImages.size})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedImages.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No photos found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "Upload some photos to get started."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedImages.has(image.id)
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300 hover:border-blue-600"
                    }`}>
                      {selectedImages.has(image.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>

                {/* Image */}
                <div 
                  className="aspect-w-4 aspect-h-3 cursor-pointer"
                  onClick={() => openImageModal(image)}
                >
                  <Image
                    src={getImageSrc(image)}
                    alt={image.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover transition-opacity group-hover:opacity-90"
                    onError={() => handleImageError(image.id)}
                  />
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-xs text-gray-600 truncate mb-2">{image.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(image.size)}</span>
                    <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageModal(image);
                      }}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleDelete(image);
                      }}
                      disabled={deleting === image.id}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            selectedImages.size === filteredAndSortedImages.length &&
                            filteredAndSortedImages.length > 0
                          }
                          onChange={() =>
                            selectedImages.size === filteredAndSortedImages.length
                              ? deselectAll()
                              : selectAll()
                          }
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedImages.size === filteredAndSortedImages.length && filteredAndSortedImages.length > 0
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300 hover:border-blue-600"
                        }`}>
                          {selectedImages.size === filteredAndSortedImages.length && filteredAndSortedImages.length > 0 && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedImages.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={() => toggleImageSelection(image.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedImages.has(image.id)
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300 hover:border-blue-600"
                          }`}>
                            {selectedImages.has(image.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <Image
                          src={getImageSrc(image)}
                          width={64}
                          height={64}
                          alt={image.title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={() => handleImageError(image.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{image.title}</div>
                          {image.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{image.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatFileSize(image.size)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openImageModal(image)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleSingleDelete(image)}
                            disabled={deleting === image.id}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                          >
                            {deleting === image.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">{selectedImage.title}</h2>
                {selectedImage.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedImage.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative">
              <Image
                src={getImageSrc(selectedImage)}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="w-full max-h-[60vh] object-contain bg-gray-50"
                onError={() => handleImageError(selectedImage.id)}
              />
              
              {/* Navigation Arrows */}
              {currentImageIndex > 0 && (
                <button
                  onClick={() => navigateImage(-1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {currentImageIndex < filteredAndSortedImages.length - 1 && (
                <button
                  onClick={() => navigateImage(1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Size:</span> {formatFileSize(selectedImage.size)} • 
                  <span className="font-medium ml-2">Uploaded:</span> {new Date(selectedImage.uploadedAt).toLocaleString()} • 
                  <span className="font-medium ml-2">{currentImageIndex + 1} of {filteredAndSortedImages.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSingleDelete(selectedImage)}
                    disabled={deleting === selectedImage.id}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting === selectedImage.id ? "Deleting..." : "Delete Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}