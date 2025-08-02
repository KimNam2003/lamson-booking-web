import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadAvatarService {
  async saveDoctorAvatar(file: Express.Multer.File, doctorId: number): Promise<string> {
    const folder = path.join(process.cwd(), 'public', 'doctor', 'avatar', doctorId.toString());

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // 🧹 Xóa ảnh cũ (nếu có)
    fs.readdirSync(folder).forEach(fileName => {
      fs.unlinkSync(path.join(folder, fileName));
    });

    const filePath = path.join(folder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return `/doctor/avatar/${doctorId}/${file.originalname}`;
  }

  async saveSpecialty(file: Express.Multer.File, specialtyName: string): Promise<string> {
    // Loại bỏ ký tự không hợp lệ để tránh lỗi đường dẫn
    const safeName = specialtyName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const folder = path.join(process.cwd(), 'public', 'specialty', safeName);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // 🧹 Xóa ảnh cũ (nếu có)
    fs.readdirSync(folder).forEach(fileName => {
      fs.unlinkSync(path.join(folder, fileName));
    });

    const filePath = path.join(folder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return `/specialty/${safeName}/${file.originalname}`;
  }
}
