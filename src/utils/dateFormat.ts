/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function dateFormat(date: string): string {
    return (
        format(new Date(date), "dd MMM yyyy", {
            locale: ptBR,
        })
    )
}