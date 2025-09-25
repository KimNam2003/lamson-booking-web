import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as moment from 'moment';import { Payment } from './entities/payment.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

  ) {}

  private vnp_TmnCode = process.env.VNP_TMNCODE;
  private vnp_HashSecret = process.env.VNP_HASHSECRET;
  private vnp_Url = process.env.VNP_URL;
  private vnp_ReturnUrl = process.env.VNP_RETURNURL;

  /** Sắp xếp object theo key (phục vụ ký VNPay) */
  private sortObject(obj: any) {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /** Tạo payment record nếu chưa có */
  async createPayment(dto: CreatePaymentDto) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: dto.appointmentId },
      relations: ['patient'],
    });
    if (!appointment) throw new Error('Appointment not found');
    if (!appointment.patient) throw new Error('Patient not found');

    const patient = appointment.patient;

    // Kiểm tra payment đã tồn tại chưa
    let payment = await this.paymentRepo.findOne({
      where: { appointmentId: dto.appointmentId },
    });
    if (!payment) {
      payment = this.paymentRepo.create({
        appointmentId: dto.appointmentId,
        patientId: patient.id,
        amount: dto.amount ,
        method: 'vnpay',
        status: 'pending',
      });
      await this.paymentRepo.save(payment);
    }

    return payment;
  }

  /** Sinh URL thanh toán VNPay */
  async generateVnpayUrl(dto: CreatePaymentDto, ipAddr: string) {
    const payment = await this.createPayment(dto);

    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderId = payment.appointmentId.toString();
    const amount = payment.amount *100 ; 
      // const timestamp = Date.now();

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Amount: amount,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán lịch khám #${orderId}`,
      vnp_OrderType: 'billpayment',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = this.sortObject(vnp_Params);

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret!);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const paymentUrl =
      this.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();

    return { paymentUrl };
  }

/** Xử lý callback từ VNPay */
async handleVnpayReturn(query: any) {
  let vnp_Params = { ...query };
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Verify chữ ký
  vnp_Params = this.sortObject(vnp_Params);
  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac('sha512', this.vnp_HashSecret!);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash !== signed) {
    throw new Error('Invalid signature from VNPay');
  }

  // const txnRef = vnp_Params['vnp_TxnRef']; // VD: "12-1758640247321"
  // const orderId = Number(txnRef.split('-')[0]); // lấy appointmentId   
  const orderId = vnp_Params['vnp_TxnRef']
  const rspCode = vnp_Params['vnp_ResponseCode'];
  const vnpAmount = Number(vnp_Params['vnp_Amount']) / 100;

  const payment = await this.paymentRepo.findOne({
    where: { appointmentId: orderId },
  });
  if (!payment) throw new Error('Payment not found');

  // ✅ Chỉ check amount 1 lần, ép kiểu number
  if (Number(payment.amount) !== Number(vnpAmount)) {
    throw new Error(
      `Amount mismatch: DB=${payment.amount}, VNPay=${vnpAmount}`
    );
  }

  if (rspCode === '00') {
    payment.status = 'paid';
    payment.transactionCode = vnp_Params['vnp_TransactionNo'] || null;
    payment.paidAt = vnp_Params['vnp_PayDate']
      ? moment(vnp_Params['vnp_PayDate'], 'YYYYMMDDHHmmss').toDate()
      : new Date();
  } else {
    payment.status = 'failed';
  }

  await this.paymentRepo.save(payment);

  return { message: 'Payment processed', payment };
}

}
