"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type SignInInput, signInSchema } from "@/lib/validations/sign-in";
import { useTRPC } from "@/trpc/client";
import { safeNextPath } from "./safe-next-path";

type FieldConfig = {
  name: Path<SignInInput>;
  label: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
};

const fields: FieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "voce@exemplo.com",
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    autoComplete: "current-password",
  },
];

const inputClassName =
  "h-11 rounded-md bg-card px-3 shadow-[inset_0_1px_0_rgb(27_35_64/0.04)] md:text-base";

export function SignInForm() {
  const router = useRouter();
  const trpc = useTRPC();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signIn = useMutation(
    trpc.auth.signIn.mutationOptions({
      onSuccess: () => {
        // Lido só aqui (e não via useSearchParams) para a página continuar estática
        const next = new URLSearchParams(window.location.search).get("next");
        router.push(safeNextPath(next));
        router.refresh();
      },
      onError: (error) => {
        const fieldErrors = error.data?.fieldErrors;
        if (fieldErrors) {
          for (const [name, messages] of Object.entries(fieldErrors)) {
            if (messages?.[0]) {
              form.setError(name as Path<SignInInput>, {
                message: messages[0],
              });
            }
          }
        }
        const code = error.data?.code;
        setFormError(
          code === "UNAUTHORIZED"
            ? "Email ou senha inválidos."
            : code === "BAD_REQUEST"
              ? "Verifique os dados informados e tente novamente."
              : "Não foi possível entrar agora. Tente novamente.",
        );
      },
    }),
  );

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    signIn.mutate(values);
  });

  // Mantém o botão desabilitado também durante a navegação pós-sucesso
  const busy = signIn.isPending || signIn.isSuccess;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {formError && (
          <Alert
            variant="destructive"
            className="border-destructive/40 bg-destructive/5 px-3 py-2.5"
          >
            <CircleAlert />
            <AlertTitle>Não foi possível entrar</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {fields.map((field) => {
          const error = form.formState.errors[field.name];
          return (
            <Field key={field.name} data-invalid={!!error}>
              <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </FieldLabel>
              <Input
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                aria-invalid={!!error}
                className={inputClassName}
                disabled={busy}
                {...form.register(field.name)}
              />
              <FieldError errors={[error]} />
            </Field>
          );
        })}

        <Button
          type="submit"
          className="mt-2 h-11 w-full rounded-md text-base"
          disabled={busy}
        >
          {busy && <LoaderCircle className="animate-spin" />}
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  );
}
