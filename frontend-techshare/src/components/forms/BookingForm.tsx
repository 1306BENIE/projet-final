import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Loader2 } from "lucide-react";

const bookingSchema = z
  .object({
    startDate: z
      .date({
        required_error: "La date de début est requise",
      })
      .nullable(),
    endDate: z
      .date({
        required_error: "La date de fin est requise",
      })
      .nullable(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const days = differenceInDays(data.endDate, data.startDate);
      return days >= 1 && days <= 30;
    },
    {
      message: "La durée de réservation doit être entre 1 et 30 jours",
      path: ["endDate"],
    }
  );

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

export default function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const handleDateSelect = (date: Date) => {
    if (!selectedDates.from) {
      setSelectedDates({ from: date, to: undefined });
      setValue("startDate", date);
    } else if (!selectedDates.to && date > selectedDates.from) {
      setSelectedDates({ from: selectedDates.from, to: date });
      setValue("endDate", date);
    } else {
      setSelectedDates({ from: date, to: undefined });
      setValue("startDate", date);
      setValue("endDate", null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dates de réservation
          </label>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Calendar
              mode="range"
              selected={{
                from: selectedDates.from,
                to: selectedDates.to,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  handleDateSelect(range.from);
                }
                if (range?.to) {
                  handleDateSelect(range.to);
                }
              }}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes (optionnel)
          </label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Ajoutez des informations supplémentaires pour le propriétaire..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !selectedDates.from || !selectedDates.to}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Réservation en cours...
          </>
        ) : (
          "Confirmer la réservation"
        )}
      </Button>
    </form>
  );
}
