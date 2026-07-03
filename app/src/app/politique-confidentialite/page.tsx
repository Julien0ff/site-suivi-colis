import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité - TrackFlow",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <ShieldCheck className="h-8 w-8 text-green-500" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de TrackFlow, nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Données d'authentification Discord (ID utilisateur, adresse e-mail, nom d'utilisateur, avatar).</li>
              <li>Données de suivi (numéros de suivi des colis, transporteurs, descriptions).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Utilisation des données</h2>
            <p>Les données collectées sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Assurer le fonctionnement du service (enregistrement et synchronisation de vos colis).</li>
              <li>Vous envoyer des notifications privées sur Discord concernant l'évolution de vos livraisons.</li>
            </ul>
            <p className="font-medium text-foreground mt-2">Nous ne revendons, ni ne louons vos données personnelles à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Partage avec des tiers</h2>
            <p>Afin de récupérer les statuts de vos colis, vos numéros de suivi sont transmis de manière sécurisée aux API de suivi partenaires (AfterShip, TrackingMore). Aucune donnée d'identification personnelle (votre nom ou votre adresse e-mail) n'est transmise à ces services tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Durée de conservation</h2>
            <p>Vos données de colis et votre compte sont conservés tant que votre compte est actif. Vous pouvez à tout moment demander la suppression complète de votre compte et de toutes les données associées en nous contactant.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Vos droits (RGPD)</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, vous pouvez nous contacter à l'adresse e-mail mentionnée dans les Mentions Légales.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
