import { motion } from "framer-motion";
import { X, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Tool } from "@/interfaces/tools/tool";
import { Button } from "@/components/ui/Button/Button";
import { jsPDF } from "jspdf";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
  startDate: string;
  endDate: string;
}

export function ContractModal({
  isOpen,
  onClose,
  tool,
  startDate,
  endDate,
}: ContractModalProps) {
  const handleDownloadPDF = () => {
    console.log("Génération du PDF avec les données:", {
      tool,
      startDate,
      endDate,
      timestamp: new Date().getTime(),
    });

    const timestamp = new Date().getTime();
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Configuration de la police
    doc.setFont("helvetica", "normal");

    // Couleurs
    const primaryColor: [number, number, number] = [0, 51, 102]; // Bleu foncé
    const secondaryColor: [number, number, number] = [100, 100, 100]; // Gris
    const accentColor: [number, number, number] = [0, 102, 204]; // Bleu clair

    // En-tête avec fond coloré
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, "F");

    // Logo et titre
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("TechShare", 105, 25, { align: "center" });

    doc.setFontSize(16);
    doc.text("Conditions Générales de Location", 105, 35, { align: "center" });

    // Date de mise à jour
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(
      `Dernière mise à jour : ${format(new Date(), "dd/MM/yyyy")}`,
      105,
      50,
      { align: "center" }
    );

    // Introduction avec fond gris clair
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 60, 190, 20, "F");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "Toute réservation implique l'acceptation pleine et entière du présent contrat.",
      20,
      73,
      { align: "center", maxWidth: 170 }
    );

    let yPosition = 90;

    // Fonction helper pour ajouter une section
    const addSection = (title: string, content: string[], items: string[]) => {
      // Titre de la section avec ligne décorative
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(title, 20, yPosition);

      // Ligne décorative sous le titre
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(20, yPosition + 2, 60, yPosition + 2);
      yPosition += 15;

      // Contenu
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      content.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 8;
      });

      // Items avec puces colorées
      items.forEach((item) => {
        // Puce colorée
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.circle(22, yPosition - 2, 1, "F");
        doc.text(item.substring(2), 25, yPosition);
        yPosition += 8;
      });

      yPosition += 10; // Espace entre les sections
    };

    // 1. Objet du Contrat
    addSection(
      "1. Objet du Contrat",
      [
        "Le présent contrat régit les conditions de location de l'outil suivant :",
      ],
      [
        `${tool.name}`,
        `Propriétaire : ${tool.owner.firstName} ${tool.owner.lastName}`,
        `Prix de location : ${tool.dailyPrice.toLocaleString()} FCFA / jour`,
        `Caution : ${tool.caution?.toLocaleString() || 0} FCFA`,
      ]
    );

    // 2. Conditions de Location
    addSection(
      "2. Conditions de Location",
      [
        `La durée de la location est fixée du ${format(
          new Date(startDate),
          "dd/MM/yyyy"
        )} au ${format(new Date(endDate), "dd/MM/yyyy")}.`,
        "Le locataire doit :",
      ],
      [
        "Être majeur et capable",
        "Ne pas céder la location",
        "Demander un nouvel accord pour toute prolongation",
        "Présenter une pièce d'identité valide",
      ]
    );

    // 3. Caution et Remboursement
    addSection(
      "3. Caution et Remboursement",
      [
        `Une caution de ${
          tool.caution?.toLocaleString() || 0
        } FCFA est exigée pour toute location.`,
      ],
      [
        "La caution est remboursée dans les 7 jours suivant le retour de l'outil",
        "En cas de dommage, la caution peut être retenue partiellement ou totalement",
        "Si les dommages excèdent la caution, le locataire s'engage à payer la différence",
        "Le remboursement se fait par le même moyen de paiement que la caution",
      ]
    );

    // 4. Responsabilités
    addSection(
      "4. Responsabilités",
      ["Le locataire s'engage à :"],
      [
        "Utiliser l'outil conformément à sa destination normale",
        "Ne pas le prêter à des tiers",
        "Assurer l'outil contre les risques de perte, vol et dommages",
        "Signaler immédiatement tout dommage ou dysfonctionnement",
        "Respecter les consignes d'utilisation et de sécurité",
      ]
    );

    // 5. Retour de l'outil
    addSection(
      "5. Retour de l'outil",
      [],
      [
        "L'outil doit être retourné à la date et l'heure convenues",
        "Tout retard sera facturé au tarif journalier en vigueur",
        "L'outil doit être retourné dans le même état qu'il a été reçu",
        "Un état des lieux sera effectué lors du retour",
        "En cas de non-retour, des poursuites judiciaires pourront être engagées",
      ]
    );

    // Acceptation avec fond gris clair
    doc.setFillColor(245, 245, 245);
    doc.rect(10, yPosition, 190, 40, "F");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Acceptation du contrat", 20, yPosition + 15);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(
      "En confirmant votre réservation, vous acceptez expressément les conditions générales de location ci-dessus.",
      20,
      yPosition + 25,
      { maxWidth: 170 }
    );
    doc.text(
      "Cette acceptation vaut signature électronique et engage les deux parties.",
      20,
      yPosition + 35,
      { maxWidth: 170 }
    );
    doc.text(
      `Date d'acceptation : ${format(new Date(), "dd/MM/yyyy")}`,
      20,
      yPosition + 45
    );

    // Pied de page avec fond coloré
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 277, 210, 20, "F");

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("TechShare - Conditions Générales de Location", 105, 287, {
      align: "center",
    });

    // Téléchargement avec timestamp unique
    const filename = `contrat-location-${tool.name}-${format(
      new Date(),
      "yyyy-MM-dd"
    )}-${timestamp}.pdf`;
    console.log("Nom du fichier PDF:", filename);
    doc.save(filename);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* En-tête */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Contrat de Location</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Télécharger en PDF</span>
                </div>
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* En-tête du contrat */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">TechShare</h1>
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {format(new Date(), "dd/MM/yyyy")}
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm">
                Toute réservation implique l'acceptation pleine et entière du
                présent contrat.
              </p>
            </div>

            {/* 1. Objet du Contrat */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                1. Objet du Contrat
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <p className="text-gray-600">
                  Le présent contrat régit les conditions de location de l'outil
                  suivant :
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{tool.name}</p>
                  <p className="text-gray-600">
                    Propriétaire : {tool.owner.firstName} {tool.owner.lastName}
                  </p>
                  <p className="text-gray-600">
                    Prix de location : {tool.dailyPrice.toLocaleString()} FCFA /
                    jour
                  </p>
                  <p className="text-gray-600">
                    Caution : {tool.caution?.toLocaleString() || 0} FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Conditions de Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                2. Conditions de Location
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <p className="text-gray-600">
                  La durée de la location est fixée du{" "}
                  {format(new Date(startDate), "dd/MM/yyyy")} au{" "}
                  {format(new Date(endDate), "dd/MM/yyyy")}.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Le locataire doit être majeur et capable</li>
                  <li>La location est personnelle et ne peut être cédée</li>
                  <li>
                    Toute prolongation doit faire l'objet d'un nouvel accord
                  </li>
                  <li>
                    Le locataire doit présenter une pièce d'identité valide
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Caution et Remboursement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                3. Caution et Remboursement
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <p className="text-gray-600">
                  Une caution de {tool.caution?.toLocaleString() || 0} FCFA est
                  exigée pour toute location.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    La caution est remboursée dans les 7 jours suivant le retour
                    de l'outil
                  </li>
                  <li>
                    En cas de dommage, la caution peut être retenue
                    partiellement ou totalement
                  </li>
                  <li>
                    Si les dommages excèdent la caution, le locataire s'engage à
                    payer la différence
                  </li>
                  <li>
                    Le remboursement se fait par le même moyen de paiement que
                    la caution
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Responsabilités */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                4. Responsabilités
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <p className="text-gray-600">Le locataire s'engage à :</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    Utiliser l'outil conformément à sa destination normale
                  </li>
                  <li>Ne pas le prêter à des tiers</li>
                  <li>
                    Assurer l'outil contre les risques de perte, vol et dommages
                  </li>
                  <li>
                    Signaler immédiatement tout dommage ou dysfonctionnement
                  </li>
                  <li>Respecter les consignes d'utilisation et de sécurité</li>
                </ul>
              </div>
            </div>

            {/* 5. Retour de l'outil */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                5. Retour de l'outil
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    L'outil doit être retourné à la date et l'heure convenues
                  </li>
                  <li>
                    Tout retard sera facturé au tarif journalier en vigueur
                  </li>
                  <li>
                    L'outil doit être retourné dans le même état qu'il a été
                    reçu
                  </li>
                  <li>Un état des lieux sera effectué lors du retour</li>
                  <li>
                    En cas de non-retour, des poursuites judiciaires pourront
                    être engagées
                  </li>
                </ul>
              </div>
            </div>

            {/* Acceptation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Acceptation du contrat
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600">
                  En confirmant votre réservation, vous acceptez expressément
                  les conditions générales de location ci-dessus. Cette
                  acceptation vaut signature électronique et engage les deux
                  parties.
                </p>
                <p className="text-gray-600 mt-4">
                  Date d'acceptation : {format(new Date(), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
