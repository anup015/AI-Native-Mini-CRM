import { ReactNode } from "react";

import { Input } from "@/components/ui/input";

type AuthFieldProps = {
  label: string;
  error?: string;
  children?: ReactNode;
} & React.ComponentProps<typeof Input>;

export function AuthField({ label, error, children, ...props }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={props.id}>
        {label}
      </label>
      {children ?? <Input {...props} />}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
}
