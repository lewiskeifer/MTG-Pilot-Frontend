import { FormGroup } from '@angular/forms';

// custom validator to check for a non-zero value
export function NonZero(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        if (control.value <= 0) {
            control.setErrors({ nonZero: true });
        }
    }
}