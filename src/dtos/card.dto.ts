import { IsString, IsNotEmpty, Length, Matches } from 'class-validator'

export class RegisterCardDto {
  @IsString()
  @Matches(/^\+?998\d{9}$/, { message: 'Telefon raqam formati noto\'g\'ri (+998XXXXXXXXX)' })
  phoneNumber!: string

  @IsString()
  @Length(16, 16, { message: 'Karta raqami 16 ta raqamdan iborat bo\'lishi kerak' })
  @Matches(/^\d{16}$/, { message: 'Karta raqami faqat raqamlardan iborat bo\'lishi kerak' })
  cardNumber!: string

  @IsString()
  @Matches(/^\d{2}\/\d{2}$/, { message: 'Karta muddati MM/YY formatida bo\'lishi kerak' })
  cardExpire!: string
}

export class ConfirmCardDto {
  @IsString()
  @IsNotEmpty({ message: 'Karta ID kiritilishi shart' })
  cardId!: string

  @IsString()
  @Length(6, 6, { message: 'Tasdiqlash kodi 6 ta raqamdan iborat bo\'lishi kerak' })
  confirmCode!: string
}
