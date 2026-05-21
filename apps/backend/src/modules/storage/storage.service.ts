import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    // Secure the file extension and generate a unique name to prevent collisions or injection
    const fileExt = extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.ogg'];
    
    if (!allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(`Unsupported file type: ${fileExt}`);
    }

    const uniqueFileName = `${randomUUID()}${fileExt}`;
    const filePath = join(this.uploadDir, uniqueFileName);

    try {
      writeFileSync(filePath, file.buffer);
      // Returns relative path from server host
      return `/uploads/${uniqueFileName}`;
    } catch (error) {
      throw new BadRequestException(`Failed to save file: ${error.message}`);
    }
  }
}
