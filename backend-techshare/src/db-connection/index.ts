import database from "./connection";
export * from "../config";

const connectToDatabase = async () => {
  try {
    await database.connect();
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
