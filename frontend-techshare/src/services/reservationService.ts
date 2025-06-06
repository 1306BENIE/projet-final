import {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
  ReservationStatus,
  PaymentStatus,
} from "@/interfaces/Reservation";
import { mockReservationsData } from "@/data/mockReservationsData";

class ReservationService {
  private reservations: Reservation[] = [...mockReservationsData];

  // Simuler un délai réseau
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    await this.delay(1000); // Simuler un délai réseau

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      userId: "user-1", // Simuler l'utilisateur connecté
      toolId: data.toolId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: ReservationStatus.PENDING,
      totalPrice: this.calculatePrice(data.startDate, data.endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: PaymentStatus.PENDING,
    };

    this.reservations.push(newReservation);
    return newReservation;
  }

  async getReservations(): Promise<Reservation[]> {
    await this.delay(500);
    return this.reservations;
  }

  async getReservationById(id: string): Promise<Reservation | undefined> {
    await this.delay(300);
    return this.reservations.find((res: Reservation) => res.id === id);
  }

  async updateReservation(
    id: string,
    data: UpdateReservationDto
  ): Promise<Reservation | undefined> {
    await this.delay(800);
    const index = this.reservations.findIndex(
      (res: Reservation) => res.id === id
    );

    if (index === -1) return undefined;

    const currentReservation = this.reservations[index];
    const updatedReservation: Reservation = {
      ...currentReservation,
      ...data,
      updatedAt: new Date(),
    };

    this.reservations[index] = updatedReservation;
    return updatedReservation;
  }

  async deleteReservation(id: string): Promise<boolean> {
    await this.delay(500);
    const initialLength = this.reservations.length;
    this.reservations = this.reservations.filter(
      (res: Reservation) => res.id !== id
    );
    return this.reservations.length !== initialLength;
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    await this.delay(500);
    return this.reservations.filter(
      (res: Reservation) => res.userId === userId
    );
  }

  async getToolReservations(toolId: string): Promise<Reservation[]> {
    await this.delay(500);
    return this.reservations.filter(
      (res: Reservation) => res.toolId === toolId
    );
  }

  private calculatePrice(startDate: Date, endDate: Date): number {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const basePrice = 5000; // Prix de base par jour
    return days * basePrice;
  }
}

export const reservationService = new ReservationService();
