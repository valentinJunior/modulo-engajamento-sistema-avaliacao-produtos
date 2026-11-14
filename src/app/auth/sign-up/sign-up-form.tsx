"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { type Path, useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type SignUpInput, signUpSchema } from "@/lib/validations/sign-up";
import { useTRPC } from "@/trpc/client";
import { ReviewerPreview } from "./reviewer-preview";

type FieldConfig = {
  name: Path<SignUpInput>;
  label: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  description?: string;
};

const nameFields: FieldConfig[] = [
  {
    name: "firstName",
    label: "Nome",
    type: "text",
    autoComplete: "given-name",
    placeholder: "Maria",
  },
  {
    name: "lastName",
    label: "Sobrenome",
    type: "text",
    autoComplete: "family-name",
    placeholder: "Silva",
  },
];

const otherFields: FieldConfig[] = [
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
    autoComplete: "new-password",
    description: "Use pelo menos 8 caracteres.",
  },
  {
    name: "confirmPassword",
    label: "Confirmar senha",
    type: "password",
    autoComplete: "new-password",
  },
];

export function SignUpForm({ intro }: { intro?: ReactNode }) {
  const router = useRouter();
  const trpc = useTRPC();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [firstName = "", lastName = ""] = useWatch({
    control: form.control,
    name: ["firstName", "lastName"],
  });

  const signUp = useMutation(
    trpc.auth.signUp.mutationOptions({
      onSuccess: () => router.push("/auth/sign-up/success"),
      onError: (error) => {
        // Erros por campo vindos da API (400)
        const fieldErrors = error.data?.fieldErrors;
        if (fieldErrors) {
          for (const [name, messages] of Object.entries(fieldErrors)) {
            if (messages?.[0]) {
              form.setError(name as Path<SignUpInput>, {
                message: messages[0],
              });
            }
          }
        }
        if (error.data?.code === "CONFLICT") {
          form.setError("email", { message: error.message });
        }
        setFormError(
          error.data?.code === "BAD_REQUEST"
            ? "Verifique os dados informados e tente novamente."
            : error.message ||
                "Não foi possível criar a conta. Tente novamente.",
        );
      },
    }),
  );

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    signUp.mutate(values);
  });

  const renderField = (field: FieldConfig) => {
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
          aria-describedby={
            field.description && !error ? `${field.name}-hint` : undefined
          }
          className="h-11 rounded-md bg-card px-3 shadow-[inset_0_1px_0_rgb(27_35_64/0.04)] md:text-base"
          disabled={signUp.isPending}
          {...form.register(field.name)}
        />
        {field.description && !error && (
          <FieldDescription id={`${field.name}-hint`}>
            {field.description}
          </FieldDescription>
        )}
        <FieldError errors={[error]} />
      </Field>
    );
  };

  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex justify-center px-4 py-10 sm:px-8 sm:py-14 lg:items-center lg:py-16">
        <div className="w-full max-w-md">
          {intro}
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {formError && (
                <Alert
                  variant="destructive"
                  className="border-destructive/40 bg-destructive/5 px-3 py-2.5"
                >
                  <CircleAlert />
                  <AlertTitle>Não foi possível criar sua conta</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {nameFields.map(renderField)}
              </div>
              {otherFields.map(renderField)}

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-md text-base"
                disabled={signUp.isPending}
              >
                {signUp.isPending && <LoaderCircle className="animate-spin" />}
                {signUp.isPending ? "Criando conta…" : "Criar conta"}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </section>

      <aside
        aria-label="Prévia de como seu nome aparece nas avaliações"
        className="order-first flex flex-col items-center justify-center gap-5 bg-ink px-4 py-8 text-ink-foreground sm:px-8 lg:order-none lg:gap-8 lg:py-16"
      >
        <p className="max-w-sm text-center text-sm text-ink-foreground/75 lg:max-w-md lg:text-base">
          É assim que seu nome vai aparecer nas avaliações.
        </p>
        <ReviewerPreview firstName={firstName} lastName={lastName} />
      </aside>
    </div>
  );
}
