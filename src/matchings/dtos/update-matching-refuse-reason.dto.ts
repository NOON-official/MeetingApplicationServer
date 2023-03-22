import { CreateMatchingRefuseReasonDto } from './create-matching-refuse-reason.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateMatchingRefuseReasonDto extends PartialType(CreateMatchingRefuseReasonDto) {}
