// lib/faq.js
import fetchApiResponse from "@/helper/api_data_store";

export async function getFAQs(pageId = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Fetch from API
    const response = await fetchApiResponse(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/list`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );

    clearTimeout(timeoutId);

    // console.log("FAQ API Response:", response);

    if (response?.meta?.status === 200 && response?.data) {
      let faqData = Array.isArray(response.data) ? response.data : [];
      
      // Filter by page_id if provided
      if (pageId !== null && pageId !== undefined) {
        faqData = faqData.filter(faq => faq.page_id === pageId);
      }
      
      return {
        props: {
          faqs: faqData,
          error: null,
        },
      };
    }

    return {
      props: {
        faqs: [],
        error: response?.meta?.message || "Failed to fetch FAQs",
      },
    };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return {
      props: {
        faqs: [],
        error: error.message || "An error occurred while fetching FAQs",
      },
    };
  }
}