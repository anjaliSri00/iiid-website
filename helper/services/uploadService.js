// helper/uploadService.js

import fetchApiResponse from "../api_data_store";

export const uploadService = {
  // Generic file upload function
  uploadFile: async (file, type, session, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ["application/pdf"],
      progressCallback = null,
    } = options;

    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Please upload a valid file type: ${allowedTypes.join(", ")}`);
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size should be less than ${maxSize / 1024 / 1024}MB`);
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    try {
      if (progressCallback) {
        progressCallback(30);
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-image`,
        {
          method: "POST",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        },
      );

      if (progressCallback) {
        progressCallback(80);
      }

      if (response.meta?.status === 200) {
        const fileUrl =
          response.data?.image_url?.url ||
          response.data?.url ||
          response.data?.fileUrl ||
          response.data?.file_url;
          
        if (fileUrl) {
          if (progressCallback) {
            progressCallback(100);
          }
          return {
            success: true,
            url: encodeURI(fileUrl),
            data: response.data,
          };
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // PDF upload specific
  uploadPDF: async (file, session, options = {}) => {
    return uploadService.uploadFile(
      file,
      "lesson_pdf",
      session,
      {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ["application/pdf"],
        ...options,
      }
    );
  },

  // Image upload specific
  uploadImage: async (file, session, options = {}) => {
    return uploadService.uploadFile(
      file,
      "course_thumbnail",
      session,
      {
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
        ...options,
      }
    );
  },

  // Video upload specific (if you have video upload endpoint)
  uploadVideo: async (file, session, options = {}) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("type", "course_video");

    try {
      if (options.progressCallback) {
        options.progressCallback(30);
      }

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/common/upload-video`,
        {
          method: "POST",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
          body: formData,
        },
      );

      if (options.progressCallback) {
        options.progressCallback(80);
      }

      if (response.meta?.status === 200) {
        const videoUrl =
          response.data?.video_url ||
          response.data?.url ||
          response.data?.fileUrl;
          
        if (videoUrl) {
          if (options.progressCallback) {
            options.progressCallback(100);
          }
          return {
            success: true,
            url: encodeURI(videoUrl),
            data: response.data,
          };
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.meta?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  },
};  