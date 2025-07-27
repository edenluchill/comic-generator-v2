import { NextRequest } from "next/server";

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors: string[];
}

/**
 * 验证请求体是否存在
 */
export async function validateRequestBody<T = unknown>(
  request: NextRequest
): Promise<ValidationResult<T>> {
  try {
    const body = (await request.json()) as T;
    return {
      isValid: true,
      data: body,
      errors: [],
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        isValid: false,
        errors: [error.message],
      };
    }
    return {
      isValid: false,
      errors: ["Invalid JSON body"],
    };
  }
}

/**
 * 验证必需字段
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): ValidationResult<T> {
  const errors: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`Missing required field: ${String(field)}`);
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors,
  };
}

/**
 * 验证数组字段
 */
export function validateArrayField<T>(
  data: unknown,
  fieldName: string,
  minLength: number = 1
): ValidationResult<T[]> {
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [`${fieldName} must be an array`],
    };
  }

  if (data.length < minLength) {
    return {
      isValid: false,
      errors: [`${fieldName} must have at least ${minLength} items`],
    };
  }

  return {
    isValid: true,
    data: data as T[],
    errors: [],
  };
}

/**
 * 验证字符串字段
 */
export function validateStringField(
  value: unknown,
  fieldName: string,
  minLength: number = 1,
  maxLength?: number
): ValidationResult<string> {
  if (typeof value !== "string") {
    return {
      isValid: false,
      errors: [`${fieldName} must be a string`],
    };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      errors: [`${fieldName} must be at least ${minLength} characters long`],
    };
  }

  if (maxLength && value.length > maxLength) {
    return {
      isValid: false,
      errors: [
        `${fieldName} must be no more than ${maxLength} characters long`,
      ],
    };
  }

  return {
    isValid: true,
    data: value,
    errors: [],
  };
}
