import { Module } from '@nestjs/common';
import { UploadAvatarService } from './UploadAvatar.service';

@Module({
  providers: [UploadAvatarService],
  exports: [UploadAvatarService], // Để module khác (doctor, specialty...) sử dụng được
})
export class UploadModule {}
