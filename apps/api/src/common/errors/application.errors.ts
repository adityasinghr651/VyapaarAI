import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class ValidationError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BusinessError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends NotFoundException {
  constructor(entityName: string) {
    super(`${entityName} not found`);
  }
}

export class ConflictError extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends UnauthorizedException {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}
