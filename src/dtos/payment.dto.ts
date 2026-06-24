import {
	IsNumber,
	IsPositive,
	IsInt,
	IsOptional,
	IsString,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'

export class NfcPaymentDto {
	@Type(() => Number)
	@IsNumber({}, { message: "cardId raqam bo'lishi kerak" })
	@IsPositive({ message: "cardId musbat son bo'lishi kerak" })
	cardId!: number

	@Type(() => Number)
	@IsInt({ message: "Summa butun son bo'lishi kerak (tiyinda)" })
	@IsPositive({ message: "Summa musbat bo'lishi kerak" })
	amount!: number

	@IsOptional()
	@IsString()
	currency?: string

	@IsString()
	@IsNotEmpty({ message: 'merchantUuid kiritilishi shart' })
	merchantUuid!: string // ← shu qatorni qo'shing
}
