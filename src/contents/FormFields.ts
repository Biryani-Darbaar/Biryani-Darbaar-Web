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

export const registerFormFields: FormField[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    required: true,
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
    required: true,
    autoComplete: "family-name",
  },
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
    placeholder: "Create a password",
    required: true,
    autoComplete: "new-password",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    placeholder: "412 345 678",
    required: true,
    autoComplete: "tel",
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter your address",
    required: true,
    autoComplete: "street-address",
    rows: 3,
  },
];

export const contactFormFields: FormField[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "John",
    required: true,
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Doe",
    required: true,
    autoComplete: "family-name",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    placeholder: "+1 (555) 000-0000",
    required: true,
    autoComplete: "tel",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "john.doe@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    name: "description",
    label: "Message",
    type: "textarea",
    placeholder: "Tell us what you're thinking...",
    required: true,
    rows: 6,
  },
];
