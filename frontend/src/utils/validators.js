// ─── Regex Rules ─────────────────────────────────────────────
export const PHONE_REGEX  = /^[6-9]\d{9}$/;
export const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const AADHAR_REGEX = /^\d{12}$/;
export const PAN_REGEX    = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const NAME_REGEX   = /^[a-zA-Z\s.'-]{2,60}$/;

// ─── Validators ───────────────────────────────────────────────
export const v = {
  name:     (val) => !val?.trim()                   ? "Name is required"
                   : !NAME_REGEX.test(val.trim())   ? "Name can only contain letters"
                   : null,

  phone:    (val) => !val?.trim()                   ? "Phone number is required"
                   : !PHONE_REGEX.test(val.trim())  ? "Enter valid 10-digit mobile number (starts with 6-9)"
                   : null,

  phoneOpt: (val) => val?.trim() && !PHONE_REGEX.test(val.trim())
                   ? "Enter valid 10-digit mobile number (starts with 6-9)" : null,

  email:    (val) => !val?.trim()                   ? "Email is required"
                   : !EMAIL_REGEX.test(val.trim())  ? "Enter a valid email address"
                   : null,

  emailOpt: (val) => val?.trim() && !EMAIL_REGEX.test(val.trim())
                   ? "Enter a valid email address" : null,

  password: (val) => !val               ? "Password is required"
                   : val.length < 6     ? "Password must be at least 6 characters"
                   : null,

  aadhar:   (val) => val?.trim() && !AADHAR_REGEX.test(val.replace(/\s/g, ""))
                   ? "Aadhar must be exactly 12 digits" : null,

  pan:      (val) => val?.trim() && !PAN_REGEX.test(val.trim().toUpperCase())
                   ? "PAN format: ABCDE1234F" : null,

  amount:   (val) => !val || Number(val) <= 0 ? "Enter a valid amount greater than 0" : null,

  required: (val, label) => !val?.toString().trim() ? `${label} is required` : null,
};

// Run array of [value, ...validatorFns], returns first error string or null
export const validate = (rules) => {
  for (const [val, ...fns] of rules) {
    for (const fn of fns) {
      const err = fn(val);
      if (err) return err;
    }
  }
  return null;
};
