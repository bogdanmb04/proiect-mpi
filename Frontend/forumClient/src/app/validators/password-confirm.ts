import { ValidatorFn } from "@angular/forms";

export function passwordMatchValidator(): ValidatorFn {
  return (formGroup) => {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  };
}
