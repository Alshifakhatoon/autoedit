import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoAnalysisResult, BRollSegment } from "../types";

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the video" },
    summary: { type: Type.STRING, description: "A one sentence summary of the video content" },
    captions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startTime: { type: Type.NUMBER, description: "Start time in seconds" },
          endTime: { type: Type.NUMBER, description: "End time in seconds" },
          text: { type: Type.STRING, description: "The spoken text" },
        },
        required: ["startTime", "endTime", "text"],
      },
    },
    bRoll: {
      type: Type.ARRAY,
      description: "Suggested B-roll inserts for moments that benefit from visual variety",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID for the segment" },
          startTime: { type: Type.NUMBER, description: "Start time in seconds" },
          endTime: { type: Type.NUMBER, description: "End time in seconds" },
          description: { type: Type.STRING, description: "Reason for this b-roll" },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this segment" },
        },
        required: ["id", "startTime", "endTime", "description", "imagePrompt"],
      },
    },
  },
  required: ["title", "summary", "captions", "bRoll"],
};

export const analyzeVideoContent = async (base64Data: string, mimeType: string): Promise<VideoAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `You are an expert video editor. Analyze this video to create a professional edit.
            1. Transcribe the audio into accurate captions with timestamps.
            2. Identify 3-5 key moments where the visual content is static, talking-head, or could be improved with B-roll (contextual images).
            3. For these moments, suggest 'bRoll' segments with a specific 'imagePrompt' that can be used to generate an image.
            
            Return the result in JSON format.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.2, // Low temperature for more factual transcription
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as VideoAnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateBRollImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: prompt + ", photorealistic, high quality, cinematic lighting, 4k",
          },
        ],
      },
      config: {
        // No schema for image generation on this model, it returns base64 in parts
      },
    });

    // Extract image
    // The response structure for images in generateContent for flash-image usually puts it in inlineData or similar part
    // However, for 2.5-flash-image, it often behaves like text-to-image returning a part with inlineData
    
    // We iterate to find the image part
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
