import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAppointmentConfirmation(
    to: string,
    doctorName: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: `Xác nhận lịch hẹn với bác sĩ ${doctorName}`,
      template: 'appointment-confirmation', // file: ./templates/appointment-confirmation.hbs
      context: {
        doctorName,
        serviceName,
        date,
        time,
      },
    });
  }
}
