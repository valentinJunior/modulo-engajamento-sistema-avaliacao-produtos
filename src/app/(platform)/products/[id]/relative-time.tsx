"use client";

import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * "há 3 dias". No servidor (e na hidratação) mostra a data absoluta, porque
 * o HTML pode vir do cache; no navegador troca pela data relativa.
 */
export function RelativeTime({ date }: { date: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const value = new Date(date);

  return (
    <time dateTime={date} title={format(value, "PPPp", { locale: ptBR })}>
      {isClient
        ? formatDistanceToNow(value, { addSuffix: true, locale: ptBR })
        : `em ${format(value, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`}
    </time>
  );
}
