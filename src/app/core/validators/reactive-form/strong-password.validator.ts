import { ValidatorFn } from '@angular/forms';

interface StrongPasswordErrors {
  lowercase?: boolean;
  uppercase?: boolean;
  number?: boolean;
  specialChar?: boolean;
  minlength?: boolean;
}

export function strongPasswordValidator(): ValidatorFn {
  return (control) => {
    const value: string = control.value;
    const result: StrongPasswordErrors = {};
    //   Min??
    const lowerCaseRegex = /.*[a-z]/;
    if (!lowerCaseRegex.test(value)) {
      result.lowercase = true;
    }
    //   Maj??
    const upperCaseRegex = /.*[A-Z]/;
    if (!upperCaseRegex.test(value)) {
      result.uppercase = true;
    }
    //   Chiffre??
    const numberCaseRegex = /.*[0-9]/;
    if (!numberCaseRegex.test(value)) {
      result.number = true;
    }
    //   Char Spé??
    const specialCharRegex = /.*[\W_]/;
    if (!specialCharRegex.test(value)) {
      result.specialChar = true;
    }
    //   Min len
    if (value.length < 8) {
      result.minlength = true;
    }

    if (Object.keys(result).length > 0) {
      return result;
    }

    return null;
  };
}
