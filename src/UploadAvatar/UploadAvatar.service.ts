import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadAvatarService {
  async saveDoctorAvatar(file: Express.Multer.File, doctorId: number): Promise<string> {
    const folder = path.join(process.cwd(), 'public', 'users', doctorId.toString());

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // 🧹 Xóa ảnh cũ (nếu có)
    fs.readdirSync(folder).forEach(fileName => {
      fs.unlinkSync(path.join(folder, fileName));
    });

    const filePath = path.join(folder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return `/users/${doctorId}/${file.originalname}`;
  }

  async saveSpecialty(file: Express.Multer.File, specialtyName: string): Promise<string> {
    const folder = path.join(process.cwd(), 'public', 'specialty');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const safeName = specialtyName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const ext = path.extname(file.originalname) || '.png';

    fs.readdirSync(folder).forEach(fileName => {
      if (fileName.startsWith(safeName + '.')) {
        fs.unlinkSync(path.join(folder, fileName));
      }
    });

    const fileName = `${safeName}${ext}`;
    const filePath = path.join(folder, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return `/specialty/${fileName}`;
  }
}
