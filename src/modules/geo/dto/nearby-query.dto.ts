/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsNumber, IsLatitude, IsLongitude, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius?: number = 10;

  @IsOptional()
  @IsString()
  category?: string;
}