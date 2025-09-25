import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Request } from 'express';
import { PaymentsService } from './payment.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** API tạo URL thanh toán VNPay */
  @Post('vnpay/url')
  async createVnpayUrl(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    // Lấy IP address client (có thể dùng headers hoặc req.ip)
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    return this.paymentsService.generateVnpayUrl(dto, ipAddr as string);
  }

  /** API callback từ VNPay */
@Get('vnpay-return')
async vnpayReturn(@Query() query: any, @Res() res: Response) {
  const result = await this.paymentsService.handleVnpayReturn(query);
  if (result.payment.status === 'paid') {
    return res.redirect(`http://localhost:5173/thanh-toan-thanh-cong/${result.payment.appointmentId}`);
  } else {
    return res.redirect(`http://localhost:5173/thanh-toan-that-bai/${result.payment.appointmentId}`);
  }
}

}
