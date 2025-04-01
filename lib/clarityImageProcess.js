/**
 * Process an image using Clarity AI upscaling API
 * @param {string} imageUrl - URL of the image to process (Supabase URL)
 * @param {object} options - Processing options
 * @param {string} options.mode - Processing mode: 'flux' (default), 'crystal', or 'creative'
 * @param {number} options.creativity - Creativity level (0-10)
 * @param {string} options.prompt - Optional prompt for guided enhancement
 * @returns {Promise<string>} - The processed image URL
 */
export async function processImageWithClarity(
  imageUrl,
  { mode = 'flux', creativity = 0, prompt = '' } = {},
) {
  try {
    console.log(`Processing image with Clarity AI: ${imageUrl}`);
    console.log(`Mode: ${mode}, Creativity: ${creativity}`);

    // Prepare the request data
    const requestData = {
      imageUrl,
      mode,
      creativity,
    };

    // Add prompt if provided
    if (prompt && prompt.trim().length > 0) {
      requestData.prompt = prompt;
    }

    // Send to server endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/image-clarity`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Server error: ${errorData.error || response.statusText}`,
      );
    }

    const result = await response.json();
    console.log('Clarity AI response:', result);

    if (!result.success) {
      throw new Error(
        result.error || 'Unknown error during image processing with Clarity AI',
      );
    }

    // Return the upscaled image URL and other data
    if (result.upscaledImageUrl) {
      return {
        upscaledImageUrl: result.upscaledImageUrl,
        status: result.status,
        balance: result.balance,
      };
    } else {
      throw new Error('No upscaled image URL received from Clarity AI');
    }
  } catch (error) {
    console.error('Error processing image with Clarity AI:', error);
    throw error;
  }
}
