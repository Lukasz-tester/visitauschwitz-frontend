// Local type definitions replacing @payloadcms/plugin-form-builder/types

export interface FormFieldBase {
  blockType: string
  name: string
  label?: string
  required?: boolean
  width?: number
}

export interface TextField extends FormFieldBase {
  blockType: 'text'
  defaultValue?: string
}

export interface TextareaField extends FormFieldBase {
  blockType: 'textarea'
  defaultValue?: string
  rows?: number
}

export interface EmailField extends FormFieldBase {
  blockType: 'email'
  defaultValue?: string
}

export interface NumberField extends FormFieldBase {
  blockType: 'number'
  defaultValue?: string
}

export interface CheckboxField extends FormFieldBase {
  blockType: 'checkbox'
  defaultValue?: boolean
}

export interface SelectField extends FormFieldBase {
  blockType: 'select'
  defaultValue?: string
  options: { label: string; value: string }[]
}

export interface CountryField extends FormFieldBase {
  blockType: 'country'
  defaultValue?: string
}

export interface StateField extends FormFieldBase {
  blockType: 'state'
  defaultValue?: string
}

export interface MessageField extends FormFieldBase {
  blockType: 'message'
  message?: unknown
}

export type FormFieldBlock =
  | TextField
  | TextareaField
  | EmailField
  | NumberField
  | CheckboxField
  | SelectField
  | CountryField
  | StateField
  | MessageField

export interface Form {
  id: string
  title?: string
  fields?: FormFieldBlock[]
  submitButtonLabel?: string
  confirmationType?: 'message' | 'redirect'
  confirmationMessage?: unknown
  redirect?: { url: string }
  emails?: unknown[]
}
