// hooks/useFileUpload.js

import { useState } from "react";
import { toast } from "react-toastify";
import { uploadService } from "../services/uploadService";

export const useFileUpload = (session) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadPDF = async (file, options = {}) => {
    const { onSuccess, onError, onProgress } = options;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadService.uploadPDF(file, session, {
        progressCallback: (progress) => {
          setUploadProgress(progress);
          if (onProgress) onProgress(progress);
        },
      });

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadImage = async (file, options = {}) => {
    const { onSuccess, onError, onProgress } = options;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadService.uploadImage(file, session, {
        progressCallback: (progress) => {
          setUploadProgress(progress);
          if (onProgress) onProgress(progress);
        },
      });

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadVideo = async (file, options = {}) => {
    const { onSuccess, onError, onProgress } = options;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadService.uploadVideo(file, session, {
        progressCallback: (progress) => {
          setUploadProgress(progress);
          if (onProgress) onProgress(progress);
        },
      });

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadPDF,
    uploadImage,
    uploadVideo,
    isUploading,
    uploadProgress,
    error,
  };
};