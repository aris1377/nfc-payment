import { IsString, IsNotEmpty, Matches, IsNumber, IsPositive, Length, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @Matches(/^\+?998\d{9}$/, { message: 'Telefon raqam formati noto\'g\'ri (+998XXXXXXXXX)' })
  phone!: string
}

export class ConfirmOtpDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'userId raqam bo\'lishi kerak' })
  @IsPositive({ message: 'userId musbat son bo\'lishi kerak' })
  userId!: number

  @IsString()
  @Length(6, 6, { message: 'OTP 6 ta raqamdan iborat bo\'lishi kerak' })
  otp!: string
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token kiritilishi shart' })
  refreshToken!: string
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Ism bo\'sh bo\'lmasligi kerak' })
  name?: string
}
