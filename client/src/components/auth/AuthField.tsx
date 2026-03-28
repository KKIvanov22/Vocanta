import type { LucideIcon } from "lucide-react";

type AuthFieldProps = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  placeholder: string;
  icon: LucideIcon;
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export function AuthField({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  name,
  required,
  minLength,
  autoComplete,
}: AuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-gray-400 pointer-events-none" />
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>
    </div>
  );
}
