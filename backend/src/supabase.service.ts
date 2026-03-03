import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
}
