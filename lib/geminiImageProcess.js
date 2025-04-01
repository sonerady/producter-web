/**
 * Sends an image to the server for processing with Gemini API
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<object>} - The processed image URL and response from Gemini
 */
export async function processImageWithGemini(imageData) {
  try {
    // Extract base64 data if it includes a data URI prefix
    const base64Data = imageData.includes('data:')
      ? imageData
      : `data:image/jpeg;base64,${imageData}`;

    // Convert base64 to blob for file upload
    const fetchResponse = await fetch(base64Data);
    const blob = await fetchResponse.blob();

    // Create FormData and append the image
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');

    // Send to server endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/gemini-process`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Server error: ${errorData.error || response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error during image processing');
    }

    // Check if we have generated images with Supabase URLs
    if (result.supabaseUrls && result.supabaseUrls.length > 0) {
      // Return the first Supabase URL instead of base64 data
      return result.supabaseUrls[0];
    }
    // Fall back to base64 data if Supabase URLs are not available
    else if (result.generatedImages && result.generatedImages.length > 0) {
      // Return the first processed image data as before
      return `data:${result.generatedImages[0].mimeType};base64,${result.generatedImages[0].data}`;
    } else {
      throw new Error('No processed image received from server');
    }
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    throw error;
  }
}
