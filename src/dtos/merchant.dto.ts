import { IsString, IsNotEmpty, MinLength, IsNumber, Min, Max, IsOptional, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty({ message: 'Merchant nomi kiritilishi shart' })
  name!: string

  @IsString()
  @IsNotEmpty({ message: 'Login kiritilishi shart' })
  login!: string

  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password!: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'vendorId raqam bo\'lishi kerak' })
  vendorId?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Komissiya raqam bo\'lishi kerak' })
  @Min(0, { message: 'Komissiya 0 dan kam bo\'lmasligi kerak' })
  @Max(100, { message: 'Komissiya 100 dan oshmasligi kerak' })
  commission?: number
}

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Ism bo\'sh bo\'lmasligi kerak' })
  name?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'vendorId raqam bo\'lishi kerak' })
  vendorId?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Komissiya raqam bo\'lishi kerak' })
  @Min(0, { message: 'Komissiya 0 dan kam bo\'lmasligi kerak' })
  @Max(100, { message: 'Komissiya 100 dan oshmasligi kerak' })
  commission?: number

  @IsOptional()
  @IsIn(['active', 'inactive'], { message: 'Status active yoki inactive bo\'lishi kerak' })
  status?: string
}

export class CreateTerminalDto {
  @IsString()
  @IsNotEmpty({ message: 'Serial raqam kiritilishi shart' })
  serialNumber!: string
}
