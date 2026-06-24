import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class MerchantLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Login kiritilishi shart' })
  login!: string

  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password!: string
}
