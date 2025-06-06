import { Schema, model, Document, Types } from "mongoose";
import { logger } from "../utils/logger";

// Interface pour les données d'entrée (sans createdAt)
export interface SecurityLogInput {
  userId?: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  details: any;
}

// Interface pour le document complet
export interface ISecurityLog extends Document, SecurityLogInput {
  createdAt: Date;
}

const securityLogSchema = new Schema<ISecurityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  status: { type: String, enum: ["success", "failure"], required: true },
  details: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const SecurityLog = model<ISecurityLog>("SecurityLog", securityLogSchema);

class SecurityLogService {
  async logAction(data: SecurityLogInput): Promise<void> {
    try {
      const logData = {
        ...data,
        createdAt: new Date(),
      };

      await SecurityLog.create(logData);
      logger.info(`Action de sécurité enregistrée: ${data.action}`, {
        userId: data.userId,
        status: data.status,
      });
    } catch (error) {
      logger.error(
        "Erreur lors de l'enregistrement du log de sécurité:",
        error
      );
    }
  }

  async logEvent(
    userId: Types.ObjectId,
    action: string,
    details: string
  ): Promise<void> {
    try {
      const logData: SecurityLogInput = {
        userId: userId.toString(),
        action,
        ipAddress: "system",
        userAgent: "system",
        status: "success",
        details,
      };

      await this.logAction(logData);
    } catch (error) {
      logger.error("Erreur lors de l'enregistrement de l'événement:", error);
    }
  }

  async getLogs(query: any = {}): Promise<ISecurityLog[]> {
    try {
      return await SecurityLog.find(query)
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des logs de sécurité:",
        error
      );
      throw error;
    }
  }
}

export const securityLogService = new SecurityLogService();
