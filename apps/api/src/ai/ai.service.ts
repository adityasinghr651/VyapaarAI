import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private geminiClient?: GoogleGenAI;
  private openaiClient?: OpenAI;

  constructor(private readonly config: ConfigService) {
    const provider = this.config.get('AI_PROVIDER');
    
    if (provider === 'gemini') {
      const apiKey = this.config.get('GEMINI_API_KEY');
      if (apiKey && apiKey.trim() !== '') {
        this.geminiClient = new GoogleGenAI({ apiKey });
      } else {
        this.logger.warn('GEMINI_API_KEY is not configured. Gemini provider will not function.');
      }
    } else if (provider === 'openai') {
      const apiKey = this.config.get('OPENAI_API_KEY');
      if (apiKey && apiKey.trim() !== '') {
        this.openaiClient = new OpenAI({ apiKey });
      } else {
        this.logger.warn('OPENAI_API_KEY is not configured. OpenAI provider will not function.');
      }
    }
  }

  async parseStructured<T>(
    prompt: string,
    schema: Record<string, any>,
    media?: { buffer: Buffer; mimeType: string },
  ): Promise<T> {
    const provider = this.config.get('AI_PROVIDER');

    if (provider === 'gemini') {
      return this.parseWithGemini<T>(prompt, schema, media);
    } else if (provider === 'openai') {
      return this.parseWithOpenAi<T>(prompt, schema, media);
    } else {
      throw new Error(`Unsupported AI Provider: ${provider}`);
    }
  }

  private async parseWithGemini<T>(
    prompt: string,
    schema: Record<string, any>,
    media?: { buffer: Buffer; mimeType: string },
  ): Promise<T> {
    if (!this.geminiClient) {
      throw new Error('Gemini client is not initialized. Please verify GEMINI_API_KEY.');
    }

    try {
      const contents: any[] = [];
      
      if (media) {
        contents.push({
          inlineData: {
            data: media.buffer.toString('base64'),
            mimeType: media.mimeType,
          },
        });
      }
      
      contents.push(prompt);

      // We use gemini-2.5-flash as default, fallback to gemini-1.5-flash if needed
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema as any,
          temperature: 0.1, // low temperature for structured data consistency
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return JSON.parse(text) as T;
    } catch (error) {
      this.logger.error('Gemini execution failed', error);
      throw error;
    }
  }

  private async parseWithOpenAi<T>(
    prompt: string,
    schema: Record<string, any>,
    media?: { buffer: Buffer; mimeType: string },
  ): Promise<T> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client is not initialized. Please verify OPENAI_API_KEY.');
    }

    try {
      let finalPrompt = prompt;

      // OpenAI doesn't natively accept audio files in the chat completion endpoint.
      // We must transcribe first using whisper if media is present.
      if (media) {
        this.logger.log('Audio file detected. Transcribing via Whisper first...');
        const file = new File([new Uint8Array(media.buffer)], `audio.${media.mimeType.split('/')[1] || 'ogg'}`, {
          type: media.mimeType,
        });
        
        const transcription = await this.openaiClient.audio.transcriptions.create({
          file: file as any,
          model: 'whisper-1',
        });
        
        finalPrompt = `[User voice transcription: "${transcription.text}"]\n\n${prompt}`;
      }

      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a structured parser. Output only valid JSON matching the schema: ${JSON.stringify(
              schema,
            )}`,
          },
          { role: 'user', content: finalPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error('OpenAI returned an empty response.');
      }

      return JSON.parse(text) as T;
    } catch (error) {
      this.logger.error('OpenAI execution failed', error);
      throw error;
    }
  }
}
