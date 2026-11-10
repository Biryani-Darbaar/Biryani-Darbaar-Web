export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  autoComplete?: string;
  rows?: number;
}

export const loginFormFields: FormField[] = [
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
    autoComplete: "current-password",
  },
];
